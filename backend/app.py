import sys

try:
    from flask import Flask
    from flask_cors import CORS
    from config import Config
    from routes.main_routes import main_bp
    from routes.auth_routes import auth_bp
    from services.db import init_db
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
    
    # Register global error handlers
    from middleware.error_handler import register_error_handlers
    register_error_handlers(app)
    
    # Register Blueprints
    app.register_blueprint(main_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    
    # College Directory Blueprint
    from routes.college_routes import college_bp
    app.register_blueprint(college_bp)
    
    # OPEC Blueprints
    from routes.opec.student import student_bp
    from routes.opec.chat import chat_bp
    from routes.opec.auth import auth_bp as opec_auth_bp
    from routes.opec.interviews import interviews_bp
    
    app.register_blueprint(student_bp, url_prefix='/api/opec/student')
    app.register_blueprint(chat_bp, url_prefix='/api/opec/chat')
    app.register_blueprint(opec_auth_bp, url_prefix='/api/opec/auth')
    app.register_blueprint(interviews_bp, url_prefix='/api/interviews')

    
    # MCP Blueprints
    from routes.mcp_routes import mcp_bp
    app.register_blueprint(mcp_bp, url_prefix='/api/mcp')

    @app.route('/')
    def health_check():
        return {"status": "CareerPath API is running", "version": "1.0.0"}

    return app

app = create_app()

if __name__ == '__main__':
    try:
        app.run(debug=True, port=5000)
    except Exception as e:
        print(f"An error occurred: {e}")
        import traceback
        traceback.print_exc()
