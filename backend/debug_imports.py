print("1. Starting imports...")
try:
    import flask
    print("2. flask imported")
    from flask import Flask
    print("3. Flask imported")
    from flask_cors import CORS
    print("4. CORS imported")
    import dotenv
    print("5. dotenv imported")
    import google.generativeai
    print("6. google.generativeai imported")
except ImportError as e:
    print(f"ImportError: {e}")
except Exception as e:
    print(f"Error: {e}")

print("Imports check complete.")
