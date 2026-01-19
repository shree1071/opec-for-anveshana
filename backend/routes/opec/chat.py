from flask import Blueprint, jsonify, request
from core.supabase_client import get_supabase_client
from core.ai.gemini_service import detect_signals, generate_chat_response
from datetime import datetime

chat_bp = Blueprint('opec_chat', __name__)

@chat_bp.route('/message', methods=['POST'])
def send_message():
    try:
        data = request.json
        clerk_id = data.get('clerk_id')
        message = data.get('message')
        use_search = data.get('use_search', False) # Default to False: Standard Chat
        print(f"DEBUG: Processing message from clerk_id: {clerk_id}, use_search={use_search}")
        
        if not clerk_id or not message:
             return jsonify({"error": "Missing clerk_id or message"}), 400
             
        supabase = get_supabase_client()
        if not supabase:
             print("ERROR: Supabase client is None. Check .env variables.")
             return jsonify({"error": "Database connection failed. Server configuration error."}), 500
        
        # 1. Get student ID and full profile
        student_res = supabase.table('students').select('*').eq('clerk_user_id', clerk_id).limit(1).execute()
        if not student_res.data or len(student_res.data) == 0:
            return jsonify({"error": "Student not found - Please complete onboarding"}), 404
        
        student_data = student_res.data[0]
        student_id = student_data['id']
        
        # Build student context for AI
        student_context = {
            "name": student_data.get('name'),
            "email": student_data.get('email'),
            "education_level": student_data.get('education_level'),  # "school" or "college"
            "grade_or_year": student_data.get('grade_or_year'),  # "10th", "12th", "1st Year", etc.
            "stream_or_branch": student_data.get('stream_or_branch'),  # "PCM", "CS", "Mechanical", etc.
            "interests": student_data.get('interests'),
            "goals": student_data.get('goals'),
            "location": student_data.get('location'),
            "budget": student_data.get('budget')
        }
        
        # 2. Get or Create Conversation
        # For simplicity, assuming one active conversation for now
        conv_res = supabase.table('conversations').select('*').eq('student_id', student_id).eq('is_active', True).execute()
        if conv_res.data:
            conv_id = conv_res.data[0]['id']
            # Get context messages
            msgs_res = supabase.table('messages').select('*').eq('conversation_id', conv_id).order('created_at', desc=True).limit(5).execute()
            context_messages = msgs_res.data[::-1] # Reverse to chronological
        else:
            new_conv = supabase.table('conversations').insert({"student_id": student_id, "title": "New Conversation"}).execute()
            conv_id = new_conv.data[0]['id']
            context_messages = []
            
        # 3. Detect Signals (Async in prod, sync here for prototype)
        context_text = "\\n".join([m['content'] for m in context_messages])
        analysis = detect_signals(message, context_text)
        print(f"DEBUG: Signals analysis result: {analysis}")
        signals = analysis.get('signals', {})
        
        # 4. Save User Message
        user_msg = {
            "conversation_id": conv_id,
            "student_id": student_id,
            "role": "user",
            "content": message,
            "signals": signals
        }
        user_msg_res = supabase.table('messages').insert(user_msg).execute()
        user_msg_id = user_msg_res.data[0]['id'] if user_msg_res.data else None
        
        # 5. Generate Response
        from core.inference.pattern_matcher import match_patterns
        
        # Get simplified history for pattern matching
        history_for_patterns = [{"signals": m.get('signals', {})} for m in context_messages]
        # Add current message signals
        history_for_patterns.append({"signals": signals})
        
        active_patterns = match_patterns(history_for_patterns)
        
        # Save detected patterns to DB (simplified)
        if active_patterns and user_msg_id:
            pattern_ids = [p['id'] for p in active_patterns]
            # Update user message with patterns
            supabase.table('messages').update({"patterns": pattern_ids}).eq('id', user_msg_id).execute()
            
        ai_response_text = generate_chat_response(message, context_messages, active_patterns, student_context, use_search=use_search)
        
        # 6. Save AI Message
        ai_msg = {
            "conversation_id": conv_id,
            "student_id": student_id,
            "role": "assistant",
            "content": ai_response_text
        }
        supabase.table('messages').insert(ai_msg).execute()
        
        return jsonify({
            "response": ai_response_text,
            "signals": signals
        }), 200

    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        import traceback
        tb = traceback.format_exc()
        traceback.print_exc()
        return jsonify({"error": str(e), "traceback": tb}), 500

@chat_bp.route('/history', methods=['GET'])
def get_chat_history():
    try:
        clerk_id = request.args.get('clerk_id')
        if not clerk_id:
             return jsonify({"error": "Missing clerk_id"}), 400
             
        supabase = get_supabase_client()
        if not supabase:
             return jsonify({"error": "Database connection failed"}), 500
        
        # 1. Get student ID
        student_res = supabase.table('students').select('id').eq('clerk_user_id', clerk_id).limit(1).execute()
        if not student_res.data or len(student_res.data) == 0:
            return jsonify({"messages": []}), 200 # Return empty if no student yet (first login)
        student_id = student_res.data[0]['id']
        
        # 2. Get active conversation
        conv_res = supabase.table('conversations').select('*').eq('student_id', student_id).eq('is_active', True).execute()
        if not conv_res.data:
            return jsonify({"messages": []}), 200
            
        conv_id = conv_res.data[0]['id']
        
        # 3. Get messages
        msgs_res = supabase.table('messages').select('*').eq('conversation_id', conv_id).order('created_at', desc=False).execute()
        
        formatted_messages = []
        for msg in msgs_res.data:
            formatted_messages.append({
                "role": msg['role'],
                "content": msg['content'],
                "signals": msg.get('signals') or {},
                "timestamp": datetime.fromisoformat(msg['created_at']).timestamp() * 1000 if msg.get('created_at') else datetime.now().timestamp() * 1000,
                "status": "sent"
            })
            
        return jsonify({"messages": formatted_messages}), 200

    except Exception as e:
        print(f"Error fetching history: {e}")
        return jsonify({"error": str(e)}), 500

@chat_bp.route('/stats', methods=['GET'])
def get_dashboard_stats():
    try:
        clerk_id = request.args.get('clerk_id')
        if not clerk_id:
             return jsonify({"error": "Missing clerk_id"}), 400
             
        supabase = get_supabase_client()
        if not supabase:
             return jsonify({"error": "Database connection failed"}), 500
        
        # 1. Get student ID
        student_res = supabase.table('students').select('id').eq('clerk_user_id', clerk_id).limit(1).execute()
        if not student_res.data:
             return jsonify({
                 "message_count": 0,
                 "clarity_score": 0,
                 "patterns_count": 0,
                 "last_active": None
             }), 200
             
        student_id = student_res.data[0]['id']
        
        # 2. Get active conversation stats
        # Count all user messages
        msg_count_res = supabase.table('messages').select('id', count='exact').eq('student_id', student_id).eq('role', 'user').execute()
        message_count = msg_count_res.count if msg_count_res.count else 0
        
        # Get latest Clarity Score (Progressive Logic)
        # 1. Base score from engagement (logarithmic growth to avoid easy 100%)
        base_score = 0
        if message_count > 0:
            import math
            # 10 msgs -> ~23%, 50 msgs -> ~50%, 100 msgs -> ~69%
            base_score = min(math.log(message_count + 1) * 15, 70)
            
        # 2. Bonus from identified patterns (each pattern adds ~5% clarity)
        # Get unique patterns detected
        recent_msgs = supabase.table('messages').select('signals').eq('student_id', student_id).neq('signals', '{}').order('created_at', desc=True).limit(50).execute()
        unique_patterns = set()
        for m in recent_msgs.data:
            if m.get('signals'):
                for s in m['signals'].keys():
                    unique_patterns.add(s)
        
        pattern_bonus = len(unique_patterns) * 5
        
        clarity_score = min(int(base_score + pattern_bonus), 98) # Cap at 98% until "Graduation" event
        
        # Get unique patterns detected
        recent_msgs = supabase.table('messages').select('signals').eq('student_id', student_id).neq('signals', '{}').order('created_at', desc=True).limit(50).execute()
        unique_patterns = set()
        for m in recent_msgs.data:
            if m.get('signals'):
                for s in m['signals'].keys():
                    unique_patterns.add(s)
                    
        return jsonify({
            "message_count": message_count,
            "clarity_score": clarity_score,
            "patterns_count": len(unique_patterns),
            "last_active": datetime.now().isoformat() 
        }), 200

    except Exception as e:
        print(f"Error fetching stats: {e}")
        return jsonify({"error": str(e)}), 500

@chat_bp.route('/report', methods=['POST'])
def generate_session_report():
    try:
        data = request.json
        clerk_id = data.get('clerk_id')
        if not clerk_id:
             return jsonify({"error": "Missing clerk_id"}), 400
             
        supabase = get_supabase_client()
        if not supabase:
             return jsonify({"error": "Database connection failed"}), 500
             
        # Get student
        student_res = supabase.table('students').select('id').eq('clerk_user_id', clerk_id).limit(1).execute()
        if not student_res.data:
             return jsonify({"error": "Student not found"}), 404
        student_id = student_res.data[0]['id']
        
        # Get conversation history
        recent_msgs = supabase.table('messages').select('role, content').eq('student_id', student_id).order('created_at', desc=True).limit(20).execute()
        messages = recent_msgs.data[::-1]
        
        if not messages:
            return jsonify({"report": "No conversation history found to generate a report."}), 200
            
        # Generate Report using Gemini (Optimized prompt)
        conversation_text = ""
        for m in messages:
            conversation_text += f"{m['role'].upper()}: {m['content']}\n"
            
        prompt = f"""
        You are an expert career consultant. Based on the following conversation fragment, generate a concise, actionable session report.
        
        Conversation:
        {conversation_text}
        
        Format the output in Markdown:
        ## 🎯 Core Insight
        [One sentence summary of the user's main challenge or realization]
        
        ## 🔑 Key Strengths Identified
        - [Strength 1]
        - [Strength 2]
        
        ## 🚀 Recommended Next Steps
        1. [Actionable step 1]
        2. [Actionable step 2]
        """
        
        # Call Gemini (reusing existing service logic or direct call)
        # For prototype speed, we'll try to use the generate_chat_response generic or import model directly if needed.
        # Assuming generate_chat_response can handle this or we make a new helper.
        # For now, let's use a simplified logical report if Gemini isn't directly exposed for this content type, 
        # but better to use the AI.
        from core.ai.gemini_service import model # Assuming model is accessible or generic generation function
        response = model.generate_content(prompt)
        report_content = response.text
        
        return jsonify({"report": report_content}), 200
        
    except Exception as e:
        print(f"Error generating report: {e}")
        return jsonify({"error": str(e)}), 500
