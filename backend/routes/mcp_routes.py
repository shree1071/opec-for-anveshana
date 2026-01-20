"""
MCP Routes for CareerPath
Flask blueprint exposing MCP tools as REST endpoints
"""

from flask import Blueprint, jsonify, request
from mcp.tools import MCPJobTools, execute_tool, get_tool_descriptions
from mcp.job_api import get_adzuna_client
import logging

logger = logging.getLogger(__name__)

mcp_bp = Blueprint('mcp', __name__)


@mcp_bp.route('/jobs', methods=['POST'])
def search_jobs():
    """
    Search for live job postings
    
    POST /api/mcp/jobs
    Body: {
        "query": "software engineer",
        "location": "bangalore",
        "salary_min_lpa": 10,
        "max_results": 5
    }
    """
    data = request.json or {}
    
    query = data.get('query', '')
    if not query:
        return jsonify({"error": "Missing 'query' parameter"}), 400
    
    location = data.get('location', 'bangalore')
    salary_min_lpa = data.get('salary_min_lpa')
    max_results = data.get('max_results', 5)
    
    result = MCPJobTools.search_live_jobs(
        query=query,
        location=location,
        salary_min_lpa=salary_min_lpa,
        max_results=max_results
    )
    
    return jsonify(result)


@mcp_bp.route('/salary', methods=['GET'])
def get_salary():
    """
    Get salary insights for a role
    
    GET /api/mcp/salary?job_title=software+engineer&location=bangalore
    """
    job_title = request.args.get('job_title', '')
    if not job_title:
        return jsonify({"error": "Missing 'job_title' parameter"}), 400
    
    location = request.args.get('location', 'india')
    
    result = MCPJobTools.get_salary_data(
        job_title=job_title,
        location=location
    )
    
    return jsonify(result)


@mcp_bp.route('/skills', methods=['GET'])
def get_trending_skills():
    """
    Get trending skills in a domain
    
    GET /api/mcp/skills?domain=software+engineering&location=bangalore
    """
    domain = request.args.get('domain', 'software engineering')
    location = request.args.get('location', 'bangalore')
    
    result = MCPJobTools.get_trending_skills(
        domain=domain,
        location=location
    )
    
    return jsonify(result)


@mcp_bp.route('/company', methods=['GET'])
def get_company_jobs():
    """
    Get jobs at a specific company
    
    GET /api/mcp/company?name=Google&location=india
    """
    company_name = request.args.get('name', '')
    if not company_name:
        return jsonify({"error": "Missing 'name' parameter"}), 400
    
    location = request.args.get('location', 'india')
    
    result = MCPJobTools.get_company_job_count(
        company_name=company_name,
        location=location
    )
    
    return jsonify(result)


@mcp_bp.route('/query', methods=['POST'])
def natural_language_query():
    """
    Natural language job query (for voice/chat integration)
    
    POST /api/mcp/query
    Body: {
        "query": "Find me React developer jobs in Bangalore with 15 LPA salary"
    }
    
    This endpoint parses the natural language and calls appropriate tools.
    """
    data = request.json or {}
    nl_query = data.get('query', '').lower()
    
    if not nl_query:
        return jsonify({"error": "Missing 'query' parameter"}), 400
    
    # Simple NL parsing (in production, use AI for this)
    result = None
    
    # Detect salary mentions
    salary_min_lpa = None
    import re
    salary_match = re.search(r'(\d+)\s*(?:lpa|lakhs?|l\b)', nl_query)
    if salary_match:
        salary_min_lpa = float(salary_match.group(1))
    
    # Detect location
    locations = ['bangalore', 'mumbai', 'delhi', 'hyderabad', 'chennai', 'pune', 'kolkata', 'noida', 'gurgaon', 'india']
    detected_location = 'bangalore'  # default
    for loc in locations:
        if loc in nl_query:
            detected_location = loc
            break
    
    # Determine intent and extract job title
    if 'salary' in nl_query and ('for' in nl_query or 'of' in nl_query):
        # Salary query
        job_title = nl_query.split('salary')[0].replace('what is the', '').replace('what', '').strip()
        if not job_title:
            job_title = "software engineer"
        result = MCPJobTools.get_salary_data(job_title, detected_location)
        
    elif 'trending' in nl_query or 'skills' in nl_query or 'learn' in nl_query:
        # Skills query
        result = MCPJobTools.get_trending_skills(domain="software engineering", location=detected_location)
        
    elif 'company' in nl_query or 'at ' in nl_query:
        # Company query - try to extract company name
        companies = ['google', 'microsoft', 'amazon', 'flipkart', 'swiggy', 'zomato', 'infosys', 'tcs', 'wipro']
        company = None
        for c in companies:
            if c in nl_query:
                company = c.title()
                break
        if company:
            result = MCPJobTools.get_company_job_count(company, detected_location)
        else:
            # Fall back to job search
            result = MCPJobTools.search_live_jobs(nl_query, detected_location, salary_min_lpa)
    else:
        # Default: Job search
        # Extract job title by removing common words
        job_title = nl_query
        for word in ['find', 'me', 'jobs', 'job', 'openings', 'for', 'in', 'with', 'lpa', 'salary', 'lakhs']:
            job_title = job_title.replace(word, '')
        job_title = ' '.join(job_title.split())  # Clean whitespace
        if not job_title:
            job_title = "software developer"
        
        result = MCPJobTools.search_live_jobs(
            query=job_title,
            location=detected_location,
            salary_min_lpa=salary_min_lpa,
            max_results=5
        )
    
    return jsonify({
        "original_query": data.get('query'),
        "parsed": {
            "detected_location": detected_location,
            "detected_salary": salary_min_lpa
        },
        "result": result
    })


@mcp_bp.route('/tools', methods=['GET'])
def list_tools():
    """List available MCP tools"""
    return jsonify({
        "tools": [
            {
                "name": "search_live_jobs",
                "endpoint": "/api/mcp/jobs",
                "method": "POST",
                "description": "Search real-time job postings"
            },
            {
                "name": "get_salary_data",
                "endpoint": "/api/mcp/salary",
                "method": "GET",
                "description": "Get salary statistics for a role"
            },
            {
                "name": "get_trending_skills",
                "endpoint": "/api/mcp/skills",
                "method": "GET",
                "description": "Analyze in-demand skills"
            },
            {
                "name": "get_company_jobs",
                "endpoint": "/api/mcp/company",
                "method": "GET",
                "description": "Find jobs at a specific company"
            },
            {
                "name": "natural_language_query",
                "endpoint": "/api/mcp/query",
                "method": "POST",
                "description": "AI-powered natural language job query"
            }
        ]
    })


@mcp_bp.route('/health', methods=['GET'])
def health_check():
    """Check if MCP and Adzuna API are configured correctly"""
    client = get_adzuna_client()
    has_credentials = bool(client.app_id and client.api_key)
    
    return jsonify({
        "mcp_status": "operational",
        "adzuna_configured": has_credentials,
        "cache_size": len(client._cache) if hasattr(client, '_cache') else 0
    })


@mcp_bp.route('/news', methods=['POST'])
def get_industry_news():
    """
    Get career/industry news for a field
    
    POST /api/mcp/news
    Body: {
        "field": "software engineering",
        "max_results": 5
    }
    """
    try:
        from mcp.news_api import search_news
        
        data = request.json or {}
        field = data.get('field', 'technology careers')
        max_results = data.get('max_results', 5)
        
        # Construct a career-focused query
        query = f"{field} careers jobs trends India"
        
        result = search_news(query, max_results=max_results)
        
        return jsonify({
            "success": True,
            "field": field,
            **result
        })
        
    except Exception as e:
        logger.error(f"News API error: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "articles": []
        }), 500


@mcp_bp.route('/videos', methods=['POST'])
def get_learning_videos():
    """
    Get learning videos for a skill/topic
    
    POST /api/mcp/videos
    Body: {
        "skill": "react programming",
        "max_results": 5
    }
    """
    try:
        from mcp.youtube_api import search_videos
        
        data = request.json or {}
        skill = data.get('skill', 'programming')
        max_results = data.get('max_results', 5)
        
        # Construct a learning-focused query
        query = f"learn {skill} tutorial beginner"
        
        result = search_videos(query, max_results=max_results)
        
        return jsonify({
            "success": True,
            "skill": skill,
            **result
        })
        
    except Exception as e:
        logger.error(f"Video API error: {e}")
        return jsonify({
            "success": False,
            "error": str(e),
            "videos": []
        }), 500

