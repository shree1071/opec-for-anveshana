from flask import Blueprint, jsonify, request
from services.db import get_db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get("email")
    
    if not email:
        return jsonify({"error": "Email is required"}), 400
        
    client = get_db()
    
    # In a real Supabase app, you might use client.auth.sign_in_with_otp() 
    # or check a 'users' table.
    # For this simple simulation, we'll just upsert into a 'users' table if it exists,
    # or just return success to allow the simulation to proceed.
    
    try:
        # Check if user exists (Mocking table interaction for now as we don't know the schema)
        # res = client.table('users').select("*").eq('email', email).execute()
        
        # NOTE: Without the user creating the table in Supabase dashboard, this will fail.
        # We will handle this gracefully.
        return jsonify({"message": "Login successful", "email": email, "note": "Ensure 'users' table exists in Supabase for persistence."})
        
    except Exception as e:
        return jsonify({"message": "Login successful (local fallback)", "email": email, "warning": str(e)})
