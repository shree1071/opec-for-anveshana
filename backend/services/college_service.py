"""
College service - Business logic for VTU college operations
"""
from core.supabase_client import get_supabase_client

class CollegeService:
    """Service class for college-related operations"""
    
    def __init__(self):
        self.supabase = get_supabase_client()
        self.table = 'colleges'
    
    def get_all_colleges(self, page=1, limit=20):
        """
        Get all colleges with pagination
        
        Args:
            page (int): Page number (1-indexed)
            limit (int): Number of results per page
            
        Returns:
            dict: Paginated colleges data
        """
        try:
            offset = (page - 1) * limit
            
            # Get total count
            count_response = self.supabase.table(self.table).select("*", count='exact').execute()
            total_count = count_response.count
            
            # Get paginated data
            response = self.supabase.table(self.table)\
                .select("*")\
                .range(offset, offset + limit - 1)\
                .order('name')\
                .execute()
            
            return {
                'success': True,
                'data': response.data,
                'pagination': {
                    'page': page,
                    'limit': limit,
                    'total': total_count,
                    'total_pages': (total_count + limit - 1) // limit
                }
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def search_colleges(self, query):
        """
        Search colleges by name using PostgreSQL full-text search
        
        Args:
            query (str): Search query
            
        Returns:
            dict: Search results
        """
        try:
            response = self.supabase.table(self.table)\
                .select("*")\
                .ilike('name', f'%{query}%')\
                .order('name')\
                .execute()
            
            return {
                'success': True,
                'data': response.data,
                'count': len(response.data)
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def filter_colleges(self, region=None, college_type=None, autonomous=None):
        """
        Filter colleges by various criteria
        
        Args:
            region (str): Filter by region
            college_type (str): Filter by type (government/private/aided)
            autonomous (bool): Filter by autonomous status
            
        Returns:
            dict: Filtered colleges
        """
        try:
            query = self.supabase.table(self.table).select("*")
            
            if region:
                query = query.eq('region', region)
            
            if college_type:
                query = query.eq('type', college_type)
            
            if autonomous is not None:
                query = query.eq('autonomous', autonomous)
            
            response = query.order('name').execute()
            
            return {
                'success': True,
                'data': response.data,
                'count': len(response.data)
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_college_by_id(self, college_id):
        """
        Get a specific college by ID
        
        Args:
            college_id (str): College UUID
            
        Returns:
            dict: College details
        """
        try:
            response = self.supabase.table(self.table)\
                .select("*")\
                .eq('id', college_id)\
                .single()\
                .execute()
            
            return {
                'success': True,
                'data': response.data
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_college_by_code(self, code):
        """
        Get a specific college by VTU code
        
        Args:
            code (str): VTU college code
            
        Returns:
            dict: College details
        """
        try:
            response = self.supabase.table(self.table)\
                .select("*")\
                .eq('code', code)\
                .single()\
                .execute()
            
            return {
                'success': True,
                'data': response.data
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_statistics(self):
        """
        Get college statistics
        
        Returns:
            dict: Statistics by region, type, etc.
        """
        try:
            # Get all colleges
            all_colleges = self.supabase.table(self.table).select("*").execute()
            colleges = all_colleges.data
            
            # Calculate statistics
            stats = {
                'total_colleges': len(colleges),
                'by_region': {},
                'by_type': {},
                'autonomous_count': sum(1 for c in colleges if c.get('autonomous')),
                'non_autonomous_count': sum(1 for c in colleges if not c.get('autonomous'))
            }
            
            # Count by region
            for college in colleges:
                region = college.get('region', 'Unknown')
                stats['by_region'][region] = stats['by_region'].get(region, 0) + 1
            
            # Count by type
            for college in colleges:
                college_type = college.get('type', 'Unknown')
                stats['by_type'][college_type] = stats['by_type'].get(college_type, 0) + 1
            
            return {
                'success': True,
                'data': stats
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
