from flask import Blueprint, jsonify, request
from services.ai_engine import run_career_simulation, chat_with_coach
from core.supabase_client import get_supabase_client

main_bp = Blueprint('main', __name__)

@main_bp.route('/simulate', methods=['POST'])
def simulate_career():
    data = request.json
    clerk_id = data.get('clerk_id')
    
    # Fetch student profile from database
    student_profile = None
    chat_context = None
    
    if clerk_id:
        try:
            supabase = get_supabase_client()
            if supabase:
                # Fetch student profile
                student_res = supabase.table('students').select('*').eq('clerk_user_id', clerk_id).limit(1).execute()
                if student_res.data and len(student_res.data) > 0:
                    student_data = student_res.data[0]
                    student_profile = {
                        "name": student_data.get('name'),
                        "education_level": student_data.get('education_level'),
                        "grade_or_year": student_data.get('grade_or_year'),
                        "stream_or_branch": student_data.get('stream_or_branch'),
                        "interests": student_data.get('interests'),
                        "goals": student_data.get('goals'),
                        "location": student_data.get('location')
                    }
                    
                    # Fetch chat history to enhance simulation with conversation insights
                    student_id = student_data.get('id')
                    if student_id:
                        # Get active conversation
                        conv_res = supabase.table('conversations').select('*').eq('student_id', student_id).eq('is_active', True).execute()
                        if conv_res.data and len(conv_res.data) > 0:
                            conversation_id = conv_res.data[0]['id']
                            
                            # Get recent messages (last 20 for context)
                            messages_res = supabase.table('messages').select('*').eq('conversation_id', conversation_id).order('created_at', desc=False).limit(20).execute()
                            
                            if messages_res.data:
                                # Extract chat insights
                                user_concerns = []
                                user_questions = []
                                
                                for msg in messages_res.data:
                                    if msg.get('role') == 'user':
                                        content = msg.get('content', '')
                                        if '?' in content:
                                            user_questions.append(content)
                                        else:
                                            user_concerns.append(content)
                                
                                chat_context = {
                                    "total_messages": len(messages_res.data),
                                    "recent_questions": user_questions[-5:],  # Last 5 questions
                                    "recent_concerns": user_concerns[-5:],    # Last 5 statements
                                    "engagement_level": "high" if len(messages_res.data) > 10 else "moderate"
                                }
                                
                                print(f"[SIMULATION] Enhanced with chat context: {len(messages_res.data)} messages")
                                
        except Exception as e:
            print(f"Error fetching student profile/chat: {e}")
    
    # Merge with any additional data from request
    user_profile = data.get('user_profile', {})
    if student_profile:
        # Student profile from DB takes precedence
        user_profile = {**user_profile, **student_profile}
    
    # Add chat context to profile
    if chat_context:
        user_profile['chat_insights'] = chat_context
    
    if not user_profile:
        return jsonify({"error": "Missing user profile. Please complete onboarding first."}), 400
        
    result = run_career_simulation(user_profile)
    return jsonify(result)

@main_bp.route('/chat', methods=['POST'])
def chat():
    data = request.json
    question = data.get('question')
    context = data.get('context')
    
    if not question:
        return jsonify({"error": "Missing question"}), 400
    
    answer = chat_with_coach(question, context)
    return jsonify({"answer": answer})
