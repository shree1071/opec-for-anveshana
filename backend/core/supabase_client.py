"""
Supabase client configuration for CareerPath application
"""
import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Initialize Supabase client
supabase: Client = None

def get_supabase_client() -> Client:
    """
    Get or create Supabase client instance.
    
    Returns:
        Client: Supabase client instance
    """
    global supabase
    
    if supabase is None:
        if not SUPABASE_URL or not SUPABASE_KEY:
            raise ValueError(
                "Supabase credentials not found. "
                "Please set SUPABASE_URL and SUPABASE_KEY in .env file"
            )
        
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    return supabase

def test_connection():
    """Test Supabase connection"""
    try:
        client = get_supabase_client()
        # Try a simple query to test connection
        response = client.table('colleges').select("count", count='exact').limit(1).execute()
        print(f"✅ Supabase connection successful!")
        return True
    except Exception as e:
        print(f"❌ Supabase connection failed: {str(e)}")
        return False

if __name__ == "__main__":
    test_connection()
