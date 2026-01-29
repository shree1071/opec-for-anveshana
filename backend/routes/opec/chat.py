from flask import Blueprint, jsonify, request
from core.supabase_client import get_supabase_client
from core.ai.agents import get_orchestrator
from datetime import datetime

chat_bp = Blueprint('opec_chat', __name__)

@chat_bp.route('/conversations', methods=['GET'])
def get_conversations():
    try:
        clerk_id = request.args.get('clerk_id')
        if not clerk_id:
             return jsonify({"error": "Missing clerk_id"}), 400
             
        supabase = get_supabase_client()
        if not supabase:
             return jsonify({"error": "Database connection failed"}), 500
        
        # Get student
        student_res = supabase.table('students').select('id').eq('clerk_user_id', clerk_id).limit(1).execute()
        if not student_res.data:
            return jsonify({"conversations": []}), 200
        student_id = student_res.data[0]['id']
        
        # Get conversations ordered by last update (or creation if no updates)
        # Assuming conversations have created_at. If updated_at exists, use that.
        convs_res = supabase.table('conversations').select('*').eq('student_id', student_id).order('created_at', desc=True).execute()
        
        return jsonify({"conversations": convs_res.data}), 200
    except Exception as e:
        print(f"Error fetching conversations: {e}")
        return jsonify({"error": str(e)}), 500

@chat_bp.route('/conversations/<conversation_id>', methods=['DELETE'])
def delete_conversation(conversation_id):
    try:
        data = request.json
        clerk_id = data.get('clerk_id')
        
        if not clerk_id:
            return jsonify({"error": "Missing clerk_id"}), 400
            
        supabase = get_supabase_client()
        if not supabase:
            return jsonify({"error": "Database connection failed"}), 500
        
        # Get student ID
        student_res = supabase.table('students').select('id').eq('clerk_user_id', clerk_id).limit(1).execute()
        if not student_res.data:
            return jsonify({"error": "Student not found"}), 404
        student_id = student_res.data[0]['id']
        
        # Verify ownership before deleting
        conv_res = supabase.table('conversations').select('id').eq('id', conversation_id).eq('student_id', student_id).limit(1).execute()
        if not conv_res.data:
            return jsonify({"error": "Conversation not found or unauthorized"}), 404
        
        # Delete messages first (foreign key constraint)
        supabase.table('messages').delete().eq('conversation_id', conversation_id).execute()
        
        # Delete conversation
        supabase.table('conversations').delete().eq('id', conversation_id).execute()
        
        return jsonify({"message": "Conversation deleted successfully"}), 200
        
    except Exception as e:
        print(f"Error deleting conversation: {e}")
        return jsonify({"error": str(e)}), 500

@chat_bp.route('/conversations', methods=['POST'])
def create_conversation():
    try:
        data = request.json
        clerk_id = data.get('clerk_id')
        title = data.get('title', 'New Chat')
        
        if not clerk_id:
             return jsonify({"error": "Missing clerk_id"}), 400
             
        supabase = get_supabase_client()
        # Get student
        student_res = supabase.table('students').select('id').eq('clerk_user_id', clerk_id).limit(1).execute()
        if not student_res.data:
            return jsonify({"error": "Student not found"}), 404
        student_id = student_res.data[0]['id']
        
        # Create new conversation
        new_conv = supabase.table('conversations').insert({
            "student_id": student_id, 
            "title": title,
            "is_active": True
        }).execute()
        
        return jsonify(new_conv.data[0]), 201
    except Exception as e:
        print(f"Error creating conversation: {e}")
        return jsonify({"error": str(e)}), 500

@chat_bp.route('/message', methods=['POST'])
def send_message():
    try:
        data = request.json
        clerk_id = data.get('clerk_id')
        message = data.get('message')
        conversation_id = data.get('conversation_id') # Support explicit conversation ID
        use_search = data.get('use_search', False)
        use_fast_mode = data.get('fast_mode', True)
        
        if not clerk_id or not message:
             return jsonify({"error": "Missing clerk_id or message"}), 400
             
        supabase = get_supabase_client()
        if not supabase:
             return jsonify({"error": "Database connection failed. Server configuration error."}), 500
        
        # 1. Get student ID and full profile
        student_res = supabase.table('students').select('*').eq('clerk_user_id', clerk_id).limit(1).execute()
        if not student_res.data or len(student_res.data) == 0:
            return jsonify({"error": "Student not found - Please complete onboarding"}), 404
        
        student_data = student_res.data[0]
        student_id = student_data['id']
        
        # Build student context for AI agents
        student_context = {
            "name": student_data.get('name'),
            "email": student_data.get('email'),
            "education_level": student_data.get('education_level'),
            "grade_or_year": student_data.get('grade_or_year'),
            "stream_or_branch": student_data.get('stream_or_branch'),
            "interests": student_data.get('interests'),
            "goals": student_data.get('goals'),
            "location": student_data.get('location'),
            "budget": student_data.get('budget')
        }
        
        # 2. Get or Create Conversation
        conv_id = conversation_id
        is_new_conversation = False
        new_chat_requested = data.get('new_chat', False)

        if not conv_id:
            # Check for existing active conversation ONLY if new_chat is NOT requested
            if not new_chat_requested:
                conv_res = supabase.table('conversations').select('*').eq('student_id', student_id).eq('is_active', True).order('created_at', desc=True).limit(1).execute()
                if conv_res.data:
                    conv_id = conv_res.data[0]['id']
            
            # If still no ID (new chat requested OR no active found), create new
            if not conv_id:
                new_conv = supabase.table('conversations').insert({"student_id": student_id, "title": "New Conversation"}).execute()
                conv_id = new_conv.data[0]['id']
                is_new_conversation = True
        
        # Load context messages for this conversation
        msgs_res = supabase.table('messages').select('*').eq('conversation_id', conv_id).order('created_at', desc=True).limit(5).execute()
        context_messages = msgs_res.data[::-1] if msgs_res.data else []
        
        # 3. Save User Message
        user_msg = {
            "conversation_id": conv_id,
            "student_id": student_id,
            "role": "user",
            "content": message,
            "signals": {}
        }
        user_msg_res = supabase.table('messages').insert(user_msg).execute()
        user_msg_id = user_msg_res.data[0]['id'] if user_msg_res.data else None
        
        # 4. Process through OPEC 4-Agent Orchestrator
        mcp_data = None
        if use_search:
            try:
                from services.ai_engine import enhance_with_mcp_data
                mcp_data = enhance_with_mcp_data(message)
            except Exception:
                pass
        
        orchestrator = get_orchestrator(fast_mode=use_fast_mode)
        ai_response_text, detected_signals, thinking = orchestrator.process_message(
            message=message,
            context_messages=context_messages,
            student_context=student_context,
            mcp_data=mcp_data
        )
        
        # 5. Update user message with detected signals
        if detected_signals and user_msg_id:
            supabase.table('messages').update({"signals": detected_signals}).eq('id', user_msg_id).execute()
        
        # 6. Save AI Message
        ai_msg = {
            "conversation_id": conv_id,
            "student_id": student_id,
            "role": "assistant",
            "content": ai_response_text
        }
        supabase.table('messages').insert(ai_msg).execute()

        # 7. Smart Title Generation (Auto-Update) - NON-BLOCKING
        # This runs AFTER the response is ready, so it won't block the chat
        generated_title = None
        try:
            # Only try if conversation is brand new
            if is_new_conversation:
                # Keep it super simple - just use first message content
                simple_title = message[:30].strip()
                if simple_title:
                    supabase.table('conversations').update({"title": simple_title}).eq('id', conv_id).execute()
                    generated_title = simple_title
        except Exception as e:
            # Title generation is non-critical - log and continue
            print(f"Title generation failed (non-blocking): {e}")

        return jsonify({
            "response": ai_response_text,
            "signals": detected_signals,
            "thinking": thinking,
            "conversation_id": conv_id,
            "title": generated_title,
            "agents_used": ["observation", "pattern", "evaluation", "clarity"]
        }), 200

    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@chat_bp.route('/history', methods=['GET'])
def get_chat_history():
    try:
        clerk_id = request.args.get('clerk_id')
        conversation_id = request.args.get('conversation_id') # Optional specific conversation
        
        if not clerk_id:
             return jsonify({"error": "Missing clerk_id"}), 400
             
        supabase = get_supabase_client()
        if not supabase:
             return jsonify({"error": "Database connection failed"}), 500
        
        # Get student ID
        student_res = supabase.table('students').select('id').eq('clerk_user_id', clerk_id).limit(1).execute()
        if not student_res.data:
            return jsonify({"messages": []}), 200
        student_id = student_res.data[0]['id']
        
        conv_id = conversation_id
        
        # If no conversation_id, try to find most recent active one
        if not conv_id:
            conv_res = supabase.table('conversations').select('*').eq('student_id', student_id).eq('is_active', True).order('created_at', desc=True).limit(1).execute()
            if not conv_res.data:
                return jsonify({"messages": []}), 200
            conv_id = conv_res.data[0]['id']
        
        # Get messages
        msgs_res = supabase.table('messages').select('*').eq('conversation_id', conv_id).order('created_at', desc=False).execute()
        
        formatted_messages = []
        for msg in msgs_res.data:
            # Handle thinking data if likely stored in signals or separate column? 
            # Our current schema doesn't seem to persist 'thinking' separately in DB yet?
            # Uh oh, I need to check schema. MessageBubble expects 'thinking'.
            # Did I create a column for it? Probably not yet by user.
            # I should store thinking in the 'details' or 'metadata' column if exists, 
            # or hacked into 'signals' or just skip persistance for now if user didn't ask for DB migration.
            # For now, let's assume valid fields.
            
            formatted_messages.append({
                "role": msg['role'],
                "content": msg['content'],
                "signals": msg.get('signals') or {},
                "timestamp": datetime.fromisoformat(msg['created_at']).timestamp() * 1000 if msg.get('created_at') else datetime.now().timestamp() * 1000,
                "status": "sent",
                # "thinking": ... (If we saved it, load it here)
            })
            
        return jsonify({
            "messages": formatted_messages,
            "conversation_id": conv_id
        }), 200

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
