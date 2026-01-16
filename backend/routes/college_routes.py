"""
College routes - API endpoints for VTU college directory
"""
from flask import Blueprint, request, jsonify
from services.college_service import CollegeService

college_bp = Blueprint('colleges', __name__, url_prefix='/api/colleges')
college_service = CollegeService()

@college_bp.route('/', methods=['GET'])
def get_colleges():
    """
    Get all colleges with pagination
    Query params: page, limit
    """
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        
        result = college_service.get_all_colleges(page=page, limit=limit)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@college_bp.route('/search', methods=['GET'])
def search_colleges():
    """
    Search colleges by name
    Query params: q (query string)
    """
    try:
        query = request.args.get('q', '')
        
        if not query:
            return jsonify({
                'success': False,
                'error': 'Search query (q) is required'
            }), 400
        
        result = college_service.search_colleges(query)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@college_bp.route('/filter', methods=['GET'])
def filter_colleges():
    """
    Filter colleges by region, type, autonomous status
    Query params: region, type, autonomous
    """
    try:
        region = request.args.get('region')
        college_type = request.args.get('type')
        autonomous = request.args.get('autonomous')
        
        # Convert autonomous string to boolean
        if autonomous is not None:
            autonomous = autonomous.lower() in ['true', '1', 'yes']
        
        result = college_service.filter_colleges(
            region=region,
            college_type=college_type,
            autonomous=autonomous
        )
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@college_bp.route('/<college_id>', methods=['GET'])
def get_college(college_id):
    """
    Get a specific college by ID
    """
    try:
        result = college_service.get_college_by_id(college_id)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 404
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@college_bp.route('/code/<code>', methods=['GET'])
def get_college_by_code(code):
    """
    Get a specific college by VTU code
    """
    try:
        result = college_service.get_college_by_code(code)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 404
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@college_bp.route('/stats', methods=['GET'])
def get_statistics():
    """
    Get college statistics
    """
    try:
        result = college_service.get_statistics()
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
