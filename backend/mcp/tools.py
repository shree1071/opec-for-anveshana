"""
MCP Tools for CareerPath
Provides structured tools that AI can use to fetch live job market data
"""

import logging
from typing import Optional, Dict, Any, List
from datetime import datetime
from .job_api import search_jobs, get_salary_insights, get_adzuna_client
from .news_api import search_news
from .youtube_api import search_videos

logger = logging.getLogger(__name__)


class MCPJobTools:
    """
    MCP-style tools for job market intelligence.
    These tools can be invoked by the AI to fetch real-time data.
    """
    
    @staticmethod
    def get_industry_news(
        topic: str,
        max_results: int = 5
    ) -> Dict[str, Any]:
        """
        📰 Get latest news and trends
        
        Args:
            topic: Industry or company name
            max_results: Number of articles
        """
        try:
            result = search_news(topic, max_results)
            if not result.get("success"):
                return {"tool": "get_industry_news", "status": "error", "error": result.get("error")}

            return {
                "tool": "get_industry_news",
                "status": "success",
                "data": result,
                "interpretation_hint": f"Found {len(result.get('articles', []))} news items. Summarize the key trends for the user."
            }
        except Exception as e:
            return {"tool": "get_industry_news", "status": "error", "error": str(e)}

    @staticmethod
    def find_learning_videos(
        topic: str,
        max_results: int = 5
    ) -> Dict[str, Any]:
        """
        📺 Find learning videos on YouTube
        
        Args:
            topic: Skill or concept to learn
            max_results: Number of videos
        """
        try:
            result = search_videos(topic, max_results)
            if not result.get("success"):
                return {"tool": "find_learning_videos", "status": "error", "error": result.get("error")}

            return {
                "tool": "find_learning_videos",
                "status": "success",
                "data": result,
                "interpretation_hint": f"Found {len(result.get('videos', []))} videos. Recommend the top 2-3 with links."
            }
        except Exception as e:
            return {"tool": "find_learning_videos", "status": "error", "error": str(e)}

    # ... (existing methods: search_live_jobs, get_salary_data, etc.)

    @staticmethod
    def search_live_jobs(
        query: str,
        location: str = "bangalore",
        salary_min_lpa: Optional[float] = None,
        max_results: int = 5
    ) -> Dict[str, Any]:
        """
        🔍 Search for live job postings
        
        Use this tool when the user asks about:
        - Current job openings for a role
        - Jobs in a specific city/location
        - Jobs within a salary range
        
        Args:
            query: Job title or skills (e.g., "react developer", "data scientist")
            location: City name (e.g., "bangalore", "mumbai", "hyderabad")
            salary_min_lpa: Minimum salary in LPA (e.g., 10 for ₹10L+)
            max_results: Number of jobs to return (default 5, max 10)
            
        Returns:
            Live job postings with title, company, salary, and apply links
        """
        try:
            # Convert LPA to annual salary
            salary_min = int(salary_min_lpa * 100000) if salary_min_lpa else None
            
            result = search_jobs(
                query=query,
                location=location,
                results_per_page=min(max_results, 10),
                salary_min=salary_min
            )
            
            # Format for AI consumption
            return {
                "tool": "search_live_jobs",
                "status": "success",
                "data": {
                    "query": query,
                    "location": location,
                    "total_available": result.get("total_count", 0),
                    "jobs_returned": len(result.get("jobs", [])),
                    "jobs": result.get("jobs", [])[:max_results],
                    "is_live_data": result.get("source") == "adzuna_live",
                    "timestamp": result.get("timestamp")
                },
                "interpretation_hint": f"Found {result.get('total_count', 0)} jobs for '{query}' in {location}. Present the top results to the user with company names, salaries, and mention they can apply via the links."
            }
            
        except Exception as e:
            logger.error(f"search_live_jobs error: {e}")
            return {
                "tool": "search_live_jobs",
                "status": "error",
                "error": str(e),
                "interpretation_hint": "Job search failed. Apologize and suggest trying again."
            }
    
    @staticmethod
    def get_salary_data(
        job_title: str,
        location: str = "india"
    ) -> Dict[str, Any]:
        """
        💰 Get salary insights for a job role
        
        Use this tool when the user asks about:
        - Expected salary for a role
        - Salary ranges at different experience levels
        - How much they can earn
        
        Args:
            job_title: The job role (e.g., "software engineer", "product manager")
            location: City or "india" for national average
            
        Returns:
            Salary statistics including average, min, max, and percentiles
        """
        try:
            result = get_salary_insights(job_title, location)
            
            return {
                "tool": "get_salary_data",
                "status": "success",
                "data": {
                    "job_title": job_title,
                    "location": location,
                    "salary_insights": result.get("insights", {}),
                    "raw_data": result.get("salary_data", {}),
                    "is_live_data": result.get("source") == "adzuna_live"
                },
                "interpretation_hint": f"Share the salary ranges for {job_title}. Mention entry, mid, and senior level salaries. These are real market rates."
            }
            
        except Exception as e:
            logger.error(f"get_salary_data error: {e}")
            return {
                "tool": "get_salary_data",
                "status": "error",
                "error": str(e)
            }
    
    @staticmethod
    def get_trending_skills(
        domain: str = "software engineering",
        location: str = "bangalore"
    ) -> Dict[str, Any]:
        """
        📈 Analyze trending skills from job postings
        
        Use this tool when the user asks about:
        - What skills are in demand
        - What they should learn
        - Market trends in tech/their field
        
        Args:
            domain: The field to analyze (e.g., "software engineering", "data science")
            location: City to focus on
            
        Returns:
            List of trending skills extracted from recent job postings
        """
        try:
            # Get a batch of recent jobs to analyze
            result = search_jobs(
                query=domain,
                location=location,
                results_per_page=20
            )
            
            # Extract skills from job descriptions (simple keyword analysis)
            skills_count = {}
            tech_keywords = [
                "python", "javascript", "react", "node.js", "aws", "docker", 
                "kubernetes", "sql", "mongodb", "typescript", "java", "golang",
                "machine learning", "ai", "data science", "devops", "cloud",
                "microservices", "rest api", "graphql", "ci/cd", "agile",
                "tensorflow", "pytorch", "spark", "kafka", "redis", "postgresql"
            ]
            
            for job in result.get("jobs", []):
                desc = job.get("description", "").lower()
                title = job.get("title", "").lower()
                combined = f"{desc} {title}"
                
                for skill in tech_keywords:
                    if skill in combined:
                        skills_count[skill] = skills_count.get(skill, 0) + 1
            
            # Sort by frequency
            trending = sorted(skills_count.items(), key=lambda x: x[1], reverse=True)[:10]
            
            return {
                "tool": "get_trending_skills",
                "status": "success",
                "data": {
                    "domain": domain,
                    "location": location,
                    "jobs_analyzed": len(result.get("jobs", [])),
                    "trending_skills": [{"skill": s[0], "mentions": s[1]} for s in trending],
                    "top_5": [s[0] for s in trending[:5]]
                },
                "interpretation_hint": f"Share the top trending skills in {domain} based on {len(result.get('jobs', []))} recent job postings. Recommend learning the top 3-5 skills."
            }
            
        except Exception as e:
            logger.error(f"get_trending_skills error: {e}")
            return {
                "tool": "get_trending_skills",
                "status": "error",
                "error": str(e)
            }
    
    @staticmethod
    def get_company_job_count(
        company_name: str,
        location: str = "india"
    ) -> Dict[str, Any]:
        """
        🏢 Get job openings at a specific company
        
        Use this when user asks about jobs at a specific company.
        
        Args:
            company_name: Company to search for
            location: City or country
            
        Returns:
            Number of open positions and sample job listings
        """
        try:
            result = search_jobs(
                query=company_name,
                location=location,
                results_per_page=10
            )
            
            # Filter to only jobs from this company
            company_jobs = [
                job for job in result.get("jobs", [])
                if company_name.lower() in job.get("company", "").lower()
            ]
            
            return {
                "tool": "get_company_job_count",
                "status": "success",
                "data": {
                    "company": company_name,
                    "location": location,
                    "open_positions": len(company_jobs),
                    "sample_jobs": company_jobs[:5],
                    "total_market_jobs": result.get("total_count", 0)
                },
                "interpretation_hint": f"Found {len(company_jobs)} jobs at {company_name}. Share the job titles and encourage the user to explore."
            }
            
        except Exception as e:
            logger.error(f"get_company_job_count error: {e}")
            return {
                "tool": "get_company_job_count",
                "status": "error",
                "error": str(e)
            }


# Tool registry for AI to discover available tools
MCP_TOOLS = {
    "search_live_jobs": {
        "function": MCPJobTools.search_live_jobs,
        "description": "Search for real-time job postings by role, location, and salary",
        "parameters": ["query", "location", "salary_min_lpa", "max_results"]
    },
    "get_salary_data": {
        "function": MCPJobTools.get_salary_data,
        "description": "Get salary statistics for a job role",
        "parameters": ["job_title", "location"]
    },
    "get_trending_skills": {
        "function": MCPJobTools.get_trending_skills,
        "description": "Analyze in-demand skills from recent job postings",
        "parameters": ["domain", "location"]
    },
    "get_company_job_count": {
        "function": MCPJobTools.get_company_job_count,
        "description": "Find job openings at a specific company",
        "parameters": ["company_name", "location"]
    },
    "get_industry_news": {
        "function": MCPJobTools.get_industry_news,
        "description": "Get latest news and trends for an industry/company",
        "parameters": ["topic", "max_results"]
    },
    "find_learning_videos": {
        "function": MCPJobTools.find_learning_videos,
        "description": "Find learning videos on YouTube",
        "parameters": ["topic", "max_results"]
    }
}


def execute_tool(tool_name: str, **kwargs) -> Dict:
    """Execute an MCP tool by name"""
    if tool_name not in MCP_TOOLS:
        return {"status": "error", "error": f"Unknown tool: {tool_name}"}
    
    tool = MCP_TOOLS[tool_name]
    return tool["function"](**kwargs)


def get_tool_descriptions() -> str:
    """Get formatted descriptions of all available tools for AI context"""
    descriptions = []
    for name, tool in MCP_TOOLS.items():
        descriptions.append(f"- {name}: {tool['description']}")
    return "\n".join(descriptions)
