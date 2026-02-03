import os
from tavily import TavilyClient
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

class TavilyAPI:
    """
    Wrapper for Tavily AI Search API.
    Provides autonomous research capabilities for the agents.
    """
    
    def __init__(self):
        self.api_key = os.environ.get("TAVILY_API_KEY")
        if not self.api_key:
            logger.warning("TAVILY_API_KEY not found. Research features will be disabled.")
            self.client = None
        else:
            try:
                self.client = TavilyClient(api_key=self.api_key)
            except Exception as e:
                logger.error(f"Failed to initialize Tavily client: {e}")
                self.client = None

    def research_company(self, company_name: str) -> Dict[str, Any]:
        """
        Conducts a deep-dive research on a company.
        Returns a structured summary of culture, interview process, and values.
        """
        if not self.client:
            return {"status": "error", "error": "Tavily API key missing"}

        try:
            # We perform a "search" but with advanced depth
            query = f"working at {company_name} engineering culture interview process values"
            
            response = self.client.search(
                query=query,
                search_depth="advanced",
                include_answer=True,
                max_results=5,
                include_raw_content=False
            )
            
            return {
                "status": "success",
                "summary": response.get("answer", "No summary available."),
                "sources": [
                    {"title": res["title"], "url": res["url"], "content": res["content"][:200] + "..."} 
                    for res in response.get("results", [])
                ]
            }
            
        except Exception as e:
            logger.error(f"Tavily research failed: {e}")
            return {"status": "error", "error": str(e)}

    def find_similar_jobs(self, role: str, location: str) -> Dict[str, Any]:
        """
        Finds live job listings across the web using Tavily.
        """
        if not self.client:
            return {"status": "error", "error": "Tavily API key missing"}

        try:
            query = f"latest {role} jobs in {location} apply now"
            
            response = self.client.search(
                query=query,
                search_depth="basic",
                max_results=7
            )
            
            return {
                "status": "success",
                "jobs": [
                    {"title": res["title"], "url": res["url"], "snippet": res["content"]} 
                    for res in response.get("results", [])
                ]
            }
        except Exception as e:
            return {"status": "error", "error": str(e)}
