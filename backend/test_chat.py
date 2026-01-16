import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

API_URL = "http://localhost:5000/api/opec/chat/message"

def test_chat():
    # 1. Use a known clerk_id - we might need to fetch one from DB or use a dummy
    # Since I don't know a valid clerk_id, I'll try to find one or use a dummy 'user_2...'
    # Ideally I should read from 'students' table first if I could, but via API:
    
    # Payload simulating the frontend request
    payload = {
        "clerk_id": "test_user_id", # This might fail if user not in DB, but should return 404, not 500
        "message": "I am feeling lost about my career."
    }
    
    try:
        print(f"Sending request to {API_URL}...")
        response = requests.post(API_URL, json=payload, timeout=5)
        
        print(f"Status Code: {response.status_code}")
        print("Response Body:")
        print(response.text)
        
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the server. Is it running on port 5000?")
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_chat()
