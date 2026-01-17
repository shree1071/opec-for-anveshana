from flask import Blueprint, jsonify, request
from core.supabase_client import get_supabase_client

student_bp = Blueprint('opec_student', __name__)

@student_bp.route('/profile', methods=['POST'])
def update_profile():
    try:
        data = request.json
        clerk_id = data.get('clerk_id')
        email = data.get('email')
        
        if not clerk_id or not email:
            return jsonify({"error": "Missing clerk_id or email"}), 400
            
        supabase = get_supabase_client()
        if not supabase:
             return jsonify({"error": "Supabase client not initialized"}), 500

        # Check if student exists
        res = supabase.table('students').select('*').eq('clerk_user_id', clerk_id).execute()
        
        student_data = {
            "clerk_user_id": clerk_id,
            "email": email,
            "name": data.get('name'),
            "education_level": data.get('education_level'),  # "school" or "college"
            "grade_or_year": data.get('grade_or_year'),  # "10th", "12th", "1st Year", etc.
            "stream_or_branch": data.get('stream_or_branch'),  # "PCM", "CS", "Mechanical", etc.
            "school_name": data.get('school_name'),
            "interests": data.get('interests'),
            "goals": data.get('goals'),
            "location": data.get('location'),
            "budget": data.get('budget'),
            "onboarding_completed": data.get('onboarding_completed', False)
        }
        
        if res.data:
            # Update
            supabase.table('students').update(student_data).eq('clerk_user_id', clerk_id).execute()
        else:
            # Insert
            supabase.table('students').insert(student_data).execute()
            
        return jsonify({"message": "Profile updated successfully"}), 200
        
    except Exception as e:
        print(f"Error updating profile: {e}")
        return jsonify({"error": str(e)}), 500

@student_bp.route('/profile', methods=['GET'])
def get_profile():
    try:
        clerk_id = request.args.get('clerk_id')
        
        if not clerk_id:
            return jsonify({"error": "Missing clerk_id"}), 400
            
        supabase = get_supabase_client()
        if not supabase:
             return jsonify({"error": "Supabase client not initialized"}), 500

        # Get student details
        res = supabase.table('students').select('*').eq('clerk_user_id', clerk_id).execute()
        
        if res.data:
            return jsonify(res.data[0]), 200
        else:
            return jsonify({"error": "Student not found"}), 404
        
    except Exception as e:
        print(f"Error fetching profile: {e}")
        return jsonify({"error": str(e)}), 500
