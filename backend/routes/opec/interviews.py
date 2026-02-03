"""
Interview API Routes
Handles mock interview sessions and report generation
"""
from flask import Blueprint, request, jsonify
from core.supabase_client import get_supabase_client



interviews_bp = Blueprint('interviews', __name__)

@interviews_bp.route('/sessions', methods=['POST'])
def save_interview_session():
    """Save a completed interview session"""
    try:
        data = request.json
        clerk_id = request.headers.get('X-Clerk-User-Id')
        
        if not clerk_id:
            return jsonify({'error': 'Unauthorized'}), 401
        
        supabase = get_supabase_client()
        
        session_data = {
            'clerk_id': clerk_id,
            'company': data.get('company', 'Unknown'),
            'role': data.get('role', 'Unknown'),
            'duration_seconds': data.get('duration', 0),
            'status': 'completed'
        }
        
        result = supabase.table('interview_sessions').insert(session_data).execute()
        session_id = result.data[0]['id']
        
        # Generate AI-powered report
        from core.ai.interview_report import generate_interview_report
        
        ai_report = generate_interview_report(
            company=data.get('company', 'Unknown'),
            role=data.get('role', 'Unknown'),
            duration_seconds=data.get('duration', 0)
        )
        
        report_data = {
            'session_id': session_id,
            'overall_score': ai_report['overall_score'],
            'communication_score': ai_report['communication_score'],
            'technical_score': ai_report['technical_score'],
            'confidence_score': ai_report['confidence_score'],
            'strengths': ai_report['strengths'],
            'weaknesses': ai_report['weaknesses'],
            'key_insights': ai_report['key_insights'],
            'recommendations': ai_report['recommendations']
        }
        
        report_result = supabase.table('interview_reports').insert(report_data).execute()
        
        return jsonify({
            'session_id': session_id,
            'report_id': report_result.data[0]['id']
        }), 201
        
    except Exception as e:
        import traceback
        print(f"Error saving session: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500



@interviews_bp.route('/sessions/count', methods=['GET'])
def get_session_count():
    """Get count of interviews in the current month for billing limits"""
    try:
        clerk_id = request.headers.get('X-Clerk-User-Id')
        
        if not clerk_id:
            return jsonify({'error': 'Unauthorized'}), 401
            
        from datetime import datetime
        now = datetime.now()
        start_date = datetime(now.year, now.month, 1).isoformat()
        
        supabase = get_supabase_client()
        result = supabase.table('interview_sessions')\
            .select('id', count='exact')\
            .eq('clerk_id', clerk_id)\
            .gte('session_date', start_date)\
            .execute()
        
        return jsonify({'count': result.count}), 200
        
    except Exception as e:
        print(f"Error fetching count: {e}")
        return jsonify({'error': str(e)}), 500


@interviews_bp.route('/sessions', methods=['GET'])
def get_interview_history():
    """Get all interview sessions for authenticated user"""
    try:
        clerk_id = request.headers.get('X-Clerk-User-Id')
        
        if not clerk_id:
            return jsonify({'error': 'Unauthorized'}), 401
        
        supabase = get_supabase_client()
        result = supabase.table('interview_sessions')\
            .select('*')\
            .eq('clerk_id', clerk_id)\
            .order('session_date', desc=True)\
            .execute()
        
        return jsonify(result.data), 200
        
    except Exception as e:
        print(f"Error fetching history: {e}")
        return jsonify({'error': str(e)}), 500


@interviews_bp.route('/sessions/<session_id>/report', methods=['GET'])
def get_interview_report(session_id):
    """Get detailed report for a specific session"""
    try:
        clerk_id = request.headers.get('X-Clerk-User-Id')
        
        if not clerk_id:
            return jsonify({'error': 'Unauthorized'}), 401
        
        supabase = get_supabase_client()
        
        # Verify ownership
        session_result = supabase.table('interview_sessions')\
            .select('*')\
            .eq('id', session_id)\
            .eq('clerk_id', clerk_id)\
            .execute()
        
        if not session_result.data or len(session_result.data) == 0:
            return jsonify({'error': 'Session not found'}), 404
        
        session_data = session_result.data[0]
        
        # Get report
        report_result = supabase.table('interview_reports')\
            .select('*')\
            .eq('session_id', session_id)\
            .execute()
        
        report_data = report_result.data[0] if report_result.data and len(report_result.data) > 0 else None
        
        return jsonify({
            'session': session_data,
            'report': report_data
        }), 200
        
    except Exception as e:
        import traceback
        print(f"Error fetching report: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@interviews_bp.route('/sessions/<session_id>', methods=['DELETE'])
def delete_interview_session(session_id):
    """Delete an interview session and its report"""
    try:
        clerk_id = request.headers.get('X-Clerk-User-Id')
        
        if not clerk_id:
            return jsonify({'error': 'Unauthorized'}), 401
        
        supabase = get_supabase_client()
        
        # Verify ownership before deleting
        result = supabase.table('interview_sessions')\
            .delete()\
            .eq('id', session_id)\
            .eq('clerk_id', clerk_id)\
            .execute()
        
        if not result.data:
            return jsonify({'error': 'Session not found or unauthorized'}), 404
        
        return jsonify({'success': True}), 200
        
    except Exception as e:
        print(f"Error deleting session: {e}")
        return jsonify({'error': str(e)}), 500
