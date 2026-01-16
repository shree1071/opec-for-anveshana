"""
Global error handling middleware for Flask application.
Provides consistent error responses and proper HTTP status codes.
"""

from flask import jsonify
from functools import wraps
import logging

logger = logging.getLogger(__name__)


class APIError(Exception):
    """Base class for API errors"""
    def __init__(self, message: str, status_code: int = 500, error_code: str = "INTERNAL_ERROR"):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        super().__init__(self.message)


class ValidationError(APIError):
    """Raised when request validation fails"""
    def __init__(self, message: str, details: dict = None):
        super().__init__(message, 400, "VALIDATION_ERROR")
        self.details = details


class QuotaExceededError(APIError):
    """Raised when API quota is exhausted"""
    def __init__(self, message: str, retry_after: int = 120):
        super().__init__(message, 429, "QUOTA_EXCEEDED")
        self.retry_after = retry_after


class NotFoundError(APIError):
    """Raised when resource is not found"""
    def __init__(self, message: str):
        super().__init__(message, 404, "NOT_FOUND")


class UnauthorizedError(APIError):
    """Raised when authentication fails"""
    def __init__(self, message: str = "Unauthorized"):
        super().__init__(message, 401, "UNAUTHORIZED")


def handle_error(error):
    """Global error handler for all exceptions"""
    
    # Handle our custom API errors
    if isinstance(error, APIError):
        response = {
            "error": error.message,
            "code": error.error_code
        }
        
        # Add extra fields for specific error types
        if isinstance(error, ValidationError) and error.details:
            response["details"] = error.details
        elif isinstance(error, QuotaExceededError):
            response["retry_after"] = error.retry_after
        
        return jsonify(response), error.status_code
    
    # Handle unexpected errors
    logger.error(f"Unexpected error: {str(error)}", exc_info=True)
    
    return jsonify({
        "error": "An unexpected error occurred. Please try again later.",
        "code": "INTERNAL_ERROR"
    }), 500


def with_error_handling(f):
    """
    Decorator to add error handling to route functions.
    Catches exceptions and converts them to proper JSON responses.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except APIError as e:
            # Let APIError propagate to global handler
            raise
        except Exception as e:
            # Wrap unexpected errors
            logger.error(f"Error in {f.__name__}: {str(e)}", exc_info=True)
            raise APIError(
                message="An unexpected error occurred",
                status_code=500,
                error_code="INTERNAL_ERROR"
            )
    
    return decorated_function


def register_error_handlers(app):
    """Register error handlers with Flask app"""
    
    @app.errorhandler(APIError)
    def handle_api_error(error):
        return handle_error(error)
    
    @app.errorhandler(500)
    def handle_500(error):
        return handle_error(error)
    
    @app.errorhandler(404)
    def handle_404(error):
        return jsonify({
            "error": "Endpoint not found",
            "code": "NOT_FOUND"
        }), 404
    
    @app.errorhandler(405)
    def handle_405(error):
        return jsonify({
            "error": "Method not allowed",
            "code": "METHOD_NOT_ALLOWED"
        }), 405
