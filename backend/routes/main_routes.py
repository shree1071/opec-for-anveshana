from flask import Blueprint, jsonify, request
from services.ai_engine import run_career_simulation, chat_with_coach

main_bp = Blueprint('main', __name__)

@main_bp.route('/simulate', methods=['POST'])
def simulate_career():
    data = request.json
    if not data or 'user_profile' not in data:
        return jsonify({"error": "Missing user_profile in request body"}), 400
        
    result = run_career_simulation(data['user_profile'])
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
