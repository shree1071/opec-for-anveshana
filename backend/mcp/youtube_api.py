"""
YouTube/Video API for OPEC
Uses DuckDuckGo Video Search (more reliable context) to fetch learning videos.
"""
import logging
from typing import List, Dict, Any
from duckduckgo_search import DDGS

logger = logging.getLogger(__name__)

def search_videos(query: str, max_results: int = 5) -> Dict[str, Any]:
    """
    Search for videos using DuckDuckGo (proxied to YouTube/others).
    """
    try:
        videos = []
        with DDGS() as ddgs:
            ddgs_videos = ddgs.videos(query, max_results=max_results)
            if ddgs_videos:
                for v in ddgs_videos:
                    videos.append({
                        "title": v.get('title'),
                        "link": v.get('content'), # DDG returns link in 'content' or 'url'
                        "description": v.get('description'),
                        "duration": v.get('duration'),
                        "views": v.get('views'),
                        "channel": v.get('publisher'),
                        "thumbnail": v.get('images', {}).get('large') or v.get('image')
                    })

        return {
            "success": True,
            "query": query,
            "videos": videos,
            "count": len(videos)
        }

    except Exception as e:
        logger.error(f"Video Search Error: {e}")
        return {
            "success": False,
            "error": str(e),
            "videos": []
        }
