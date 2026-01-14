import os
import sys

print(f"Python Executable: {sys.executable}")
print(f"Current Directory: {os.getcwd()}")

try:
    from dotenv import load_dotenv
    print("SUCCESS: python-dotenv imported.")
    load_dotenv()
    key = os.environ.get('GEMINI_API_KEY')
    if key:
        print(f"SUCCESS: GEMINI_API_KEY found (starts with {key[:5]}...)")
    else:
        print("FAILURE: GEMINI_API_KEY NOT found in env.")
except ImportError:
    print("FAILURE: python-dotenv NOT installed.")

try:
    import requests
    print("SUCCESS: requests imported.")
except ImportError:
    print("FAILURE: requests NOT installed.")

try:
    import google.generativeai as genai
    print("SUCCESS: google-generativeai imported.")
except ImportError:
    print("FAILURE: google-generativeai NOT installed.")
