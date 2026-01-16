import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'you-will-never-guess'
    SUPABASE_URL = os.environ.get('SUPABASE_URL')
    SUPABASE_KEY = os.environ.get('SUPABASE_KEY')
    
    # Support multiple Gemini API keys for rotation
    @staticmethod
    def get_gemini_api_keys():
        """Get all available Gemini API keys from environment variables"""
        keys = []
        # Try GEMINI_API_KEY first (backward compatibility)
        if os.environ.get('GEMINI_API_KEY'):
            keys.append(os.environ.get('GEMINI_API_KEY'))
        
        # Then try numbered keys
        i = 1
        while True:
            key = os.environ.get(f'GEMINI_API_KEY_{i}')
            if key:
                keys.append(key)
                i += 1
            else:
                break
        
        return keys if keys else [os.environ.get('GEMINI_API_KEY', '')]
    
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')  # Keep for backward compatibility
