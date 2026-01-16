"""
Script to seed VTU colleges data into Supabase
"""
import json
import os
import sys
from pathlib import Path

# Add parent directory to path to import modules
sys.path.append(str(Path(__file__).parent.parent))

from core.supabase_client import get_supabase_client
from dotenv import load_dotenv

load_dotenv()

def seed_colleges():
    """Seed colleges data from JSON file into Supabase"""
    print("🌱 Starting college data seeding...")
    
    # Load JSON data
    json_path = Path(__file__).parent.parent / 'data' / 'vtu_colleges_data.json'
    
    if not json_path.exists():
        print(f"❌ Error: Data file not found at {json_path}")
        return False
    
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        colleges = data.get('colleges', [])
        print(f"📚 Loaded {len(colleges)} colleges from JSON")
        
        # Get Supabase client
        supabase = get_supabase_client()
        
        # Check if table exists and has data
        try:
            existing = supabase.table('colleges').select('code').execute()
            if existing.data and len(existing.data) > 0:
                print(f"⚠️  Warning: Table already contains {len(existing.data)} records")
                response = input("Do you want to clear existing data and reseed? (yes/no): ")
                if response.lower() == 'yes':
                    # Delete all existing records
                    print("🗑️  Clearing existing data...")
                    # Note: Supabase doesn't have a direct truncate, so we'll delete all
                    supabase.table('colleges').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
                else:
                    print("❌ Seeding cancelled")
                    return False
        except Exception as e:
            print(f"Note: {str(e)}")
        
        # Insert colleges in batches
        batch_size = 50
        total = len(colleges)
        success_count = 0
        error_count = 0
        
        for i in range(0, total, batch_size):
            batch = colleges[i:i+batch_size]
            try:
                response = supabase.table('colleges').insert(batch).execute()
                success_count += len(batch)
                print(f"✅ Inserted batch {i//batch_size + 1}: {success_count}/{total} colleges")
            except Exception as e:
                error_count += len(batch)
                print(f"❌ Error inserting batch {i//batch_size + 1}: {str(e)}")
        
        print(f"\n{'='*50}")
        print(f"✅ Seeding complete!")
        print(f"   Successfully inserted: {success_count}")
        print(f"   Errors: {error_count}")
        print(f"{'='*50}\n")
        
        return success_count > 0
        
    except Exception as e:
        print(f"❌ Error during seeding: {str(e)}")
        return False

if __name__ == "__main__":
    success = seed_colleges()
    sys.exit(0 if success else 1)
