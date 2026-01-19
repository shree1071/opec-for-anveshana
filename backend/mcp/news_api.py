"""
News API for OPEC
Uses DuckDuckGo to fetch real-time news and industry trends.
"""
import logging
from typing import List, Dict, Any
from duckduckgo_search import DDGS

logger = logging.getLogger(__name__)

def search_news(query: str, max_results: int = 5) -> Dict[str, Any]:
    """
    Search for news articles using DuckDuckGo.
    """
    try:
        results = []
        with DDGS() as ddgs:
            # 'n' for news search
            ddgs_news = ddgs.news(query, max_results=max_results)
            if ddgs_news:
                for r in ddgs_news:
                    results.append({
                        "title": r.get('title'),
                        "body": r.get('body'), # Snippet
                        "url": r.get('url'),
                        "source": r.get('source'),
                        "date": r.get('date'),
                        "image": r.get('image')
                    })
        
        return {
            "success": True,
            "query": query,
            "articles": results,
            "count": len(results)
        }
        
    except Exception as e:
        logger.error(f"News Search Error: {e}")
        return {
            "success": False,
            "error": str(e),
            "articles": []
        }
