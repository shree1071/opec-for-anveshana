import sys
print("DEBUG: app.py started...", file=sys.stderr)

try:
    print("DEBUG: Importing flask...", file=sys.stderr)
    from flask import Flask
    print("DEBUG: Importing flask_cors...", file=sys.stderr)
    from flask_cors import CORS
    print("DEBUG: Importing config...", file=sys.stderr)
    from config import Config
    print("DEBUG: Importing main_routes...", file=sys.stderr)
    from routes.main_routes import main_bp
    print("DEBUG: Importing auth_routes...", file=sys.stderr)
    from routes.auth_routes import auth_bp
    print("DEBUG: Importing services.db...", file=sys.stderr)
    from services.db import init_db
    print("DEBUG: Imports successful", file=sys.stderr)
except BaseException as e:
    print(f"CRITICAL ERROR during imports: {e}", file=sys.stderr)
    import traceback
    traceback.print_exc()
    # If it's SystemExit, we might want to know the code
    if isinstance(e, SystemExit):
        print(f"SystemExit code: {e.code}", file=sys.stderr)
    sys.exit(1)

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    CORS(app)
    
    # Initialize DB
    init_db(app)
    
    # Register Blueprints
    app.register_blueprint(main_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    
    @app.route('/')
    def health_check():
        return {"status": "CareerPath API is running", "version": "1.0.0"}

    return app

app = create_app()

if __name__ == '__main__':
    print("Starting application...")
    try:
        print("App created successfully. Running server...")
        app.run(debug=True, port=5000)
    except Exception as e:
        print(f"An error occurred: {e}")
        import traceback
        traceback.print_exc()
