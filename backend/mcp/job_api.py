"""
Adzuna Job API Client
Provides real-time job market data for the CareerPath AI
"""

import os
import requests
import logging
from typing import Optional, Dict, Any, List
from functools import lru_cache
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

# Cache for API responses (simple in-memory cache)
_cache: Dict[str, tuple] = {}
CACHE_TTL_SECONDS = 300  # 5 minutes


class AdzunaClient:
    """Client for the Adzuna Job Search API"""
    
    BASE_URL = "https://api.adzuna.com/v1/api"
    
    def __init__(self, app_id: Optional[str] = None, api_key: Optional[str] = None):
        self.app_id = app_id or os.environ.get("ADZUNA_APP_ID")
        self.api_key = api_key or os.environ.get("ADZUNA_API_KEY")
        
        if not self.app_id or not self.api_key:
            logger.warning("Adzuna API credentials not found. Job search will use mock data.")
    
    def _get_cached(self, cache_key: str) -> Optional[Dict]:
        """Get cached response if still valid"""
        if cache_key in _cache:
            data, timestamp = _cache[cache_key]
            if datetime.now() - timestamp < timedelta(seconds=CACHE_TTL_SECONDS):
                logger.info(f"Cache hit for: {cache_key[:50]}...")
                return data
            else:
                del _cache[cache_key]
        return None
    
    def _set_cache(self, cache_key: str, data: Dict):
        """Cache response with timestamp"""
        _cache[cache_key] = (data, datetime.now())
    
    def search_jobs(
        self,
        query: str,
        location: str = "india",
        country: str = "in",
        results_per_page: int = 10,
        page: int = 1,
        salary_min: Optional[int] = None,
        salary_max: Optional[int] = None,
        full_time: bool = True
    ) -> Dict[str, Any]:
        """
        Search for jobs using the Adzuna API
        
        Args:
            query: Job title or keywords (e.g., "software engineer")
            location: City or region (e.g., "bangalore", "mumbai")
            country: Country code (default: "in" for India)
            results_per_page: Number of results (max 50)
            page: Page number for pagination
            salary_min: Minimum salary filter
            salary_max: Maximum salary filter
            full_time: Filter for full-time positions only
            
        Returns:
            Dictionary with job results and metadata
        """
        # Check cache first
        cache_key = f"{query}_{location}_{country}_{page}_{salary_min}_{salary_max}"
        cached = self._get_cached(cache_key)
        if cached:
            return cached
        
        # If no API credentials, return mock data
        if not self.app_id or not self.api_key:
            return self._get_mock_jobs(query, location)
        
        try:
            url = f"{self.BASE_URL}/jobs/{country}/search/{page}"
            
            params = {
                "app_id": self.app_id,
                "app_key": self.api_key,
                "what": query,
                "where": location,
                "results_per_page": min(results_per_page, 50),
                "content-type": "application/json"
            }
            
            if salary_min:
                params["salary_min"] = salary_min
            if salary_max:
                params["salary_max"] = salary_max
            if full_time:
                params["full_time"] = 1
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            # Transform to our format
            result = {
                "success": True,
                "total_count": data.get("count", 0),
                "query": query,
                "location": location,
                "jobs": self._transform_jobs(data.get("results", [])),
                "source": "adzuna_live",
                "timestamp": datetime.now().isoformat()
            }
            
            # Cache the result
            self._set_cache(cache_key, result)
            
            logger.info(f"Adzuna API returned {len(result['jobs'])} jobs for '{query}' in '{location}'")
            return result
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Adzuna API error: {e}")
            return self._get_mock_jobs(query, location, error=str(e))
    
    def _transform_jobs(self, jobs: List[Dict]) -> List[Dict]:
        """Transform Adzuna job format to our standard format"""
        transformed = []
        for job in jobs:
            transformed.append({
                "id": job.get("id"),
                "title": job.get("title", "Unknown Title"),
                "company": job.get("company", {}).get("display_name", "Company Not Listed"),
                "location": job.get("location", {}).get("display_name", "India"),
                "salary_min": job.get("salary_min"),
                "salary_max": job.get("salary_max"),
                "salary_display": self._format_salary(job.get("salary_min"), job.get("salary_max")),
                "description": job.get("description", "")[:500] + "...",
                "url": job.get("redirect_url", ""),
                "posted_date": job.get("created", ""),
                "contract_type": job.get("contract_type", "Full-time"),
                "category": job.get("category", {}).get("label", "")
            })
        return transformed
    
    def _format_salary(self, min_sal: Optional[float], max_sal: Optional[float]) -> str:
        """Format salary range in Indian format (LPA)"""
        if not min_sal and not max_sal:
            return "Not Disclosed"
        
        # Adzuna returns annual salary
        min_lpa = round(min_sal / 100000, 1) if min_sal else None
        max_lpa = round(max_sal / 100000, 1) if max_sal else None
        
        if min_lpa and max_lpa:
            return f"₹{min_lpa}L - ₹{max_lpa}L per annum"
        elif min_lpa:
            return f"₹{min_lpa}L+ per annum"
        elif max_lpa:
            return f"Up to ₹{max_lpa}L per annum"
        return "Not Disclosed"
    
    def _get_mock_jobs(self, query: str, location: str, error: str = None) -> Dict:
        """Return mock data when API is unavailable"""
        return {
            "success": True,
            "total_count": 3,
            "query": query,
            "location": location,
            "jobs": [
                {
                    "id": "mock-1",
                    "title": f"Senior {query.title()}",
                    "company": "TechCorp India",
                    "location": location.title(),
                    "salary_display": "₹12L - ₹18L per annum",
                    "description": f"We are looking for an experienced {query} to join our team...",
                    "url": "https://example.com/job/1",
                    "posted_date": datetime.now().isoformat(),
                    "contract_type": "Full-time",
                    "category": "IT Jobs"
                },
                {
                    "id": "mock-2",
                    "title": f"{query.title()} - Fresher",
                    "company": "StartupXYZ",
                    "location": location.title(),
                    "salary_display": "₹4L - ₹6L per annum",
                    "description": f"Great opportunity for freshers in {query}...",
                    "url": "https://example.com/job/2",
                    "posted_date": datetime.now().isoformat(),
                    "contract_type": "Full-time",
                    "category": "IT Jobs"
                },
                {
                    "id": "mock-3",
                    "title": f"Lead {query.title()}",
                    "company": "Enterprise Solutions",
                    "location": location.title(),
                    "salary_display": "₹20L - ₹30L per annum",
                    "description": f"Leadership role for {query} with 5+ years experience...",
                    "url": "https://example.com/job/3",
                    "posted_date": datetime.now().isoformat(),
                    "contract_type": "Full-time",
                    "category": "IT Jobs"
                }
            ],
            "source": "mock_data" if not error else f"mock_fallback (error: {error})",
            "timestamp": datetime.now().isoformat()
        }
    
    def get_salary_histogram(self, job_title: str, location: str = "india", country: str = "in") -> Dict:
        """
        Get salary distribution data for a job title
        """
        cache_key = f"salary_{job_title}_{location}"
        cached = self._get_cached(cache_key)
        if cached:
            return cached
        
        if not self.app_id or not self.api_key:
            return self._get_mock_salary(job_title, location)
        
        try:
            url = f"{self.BASE_URL}/jobs/{country}/history"
            params = {
                "app_id": self.app_id,
                "app_key": self.api_key,
                "what": job_title,
                "location0": location
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            result = {
                "success": True,
                "job_title": job_title,
                "location": location,
                "salary_data": data,
                "source": "adzuna_live",
                "timestamp": datetime.now().isoformat()
            }
            
            self._set_cache(cache_key, result)
            return result
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Salary API error: {e}")
            return self._get_mock_salary(job_title, location)
    
    def _get_mock_salary(self, job_title: str, location: str) -> Dict:
        """Mock salary data"""
        return {
            "success": True,
            "job_title": job_title,
            "location": location,
            "salary_data": {
                "average": 1200000,  # 12 LPA
                "min": 400000,       # 4 LPA
                "max": 3000000,      # 30 LPA
                "percentile_25": 600000,
                "percentile_75": 1800000
            },
            "insights": {
                "average_lpa": "₹12L",
                "entry_level": "₹4L - ₹6L",
                "mid_level": "₹8L - ₹15L",
                "senior_level": "₹18L - ₹30L"
            },
            "source": "mock_data",
            "timestamp": datetime.now().isoformat()
        }


# Singleton instance
_client: Optional[AdzunaClient] = None


def get_adzuna_client() -> AdzunaClient:
    """Get or create the Adzuna client singleton"""
    global _client
    if _client is None:
        _client = AdzunaClient()
    return _client


# Convenience functions
def search_jobs(query: str, location: str = "bangalore", **kwargs) -> Dict:
    """Search for jobs (convenience function)"""
    return get_adzuna_client().search_jobs(query, location, **kwargs)


def get_salary_insights(job_title: str, location: str = "india") -> Dict:
    """Get salary insights (convenience function)"""
    return get_adzuna_client().get_salary_histogram(job_title, location)
