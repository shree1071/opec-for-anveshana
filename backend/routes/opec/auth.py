from flask import Blueprint, jsonify, request

auth_bp = Blueprint('opec_auth', __name__)

@auth_bp.route('/webhook', methods=['POST'])
def webhook():
    # Placeholder for Clerk webhook
    return jsonify({"message": "Webhook received"}), 200
