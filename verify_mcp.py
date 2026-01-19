
import os
import sys

# Ensure backend directory is in path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

# Mock Flask app context for testing
from flask import Flask
app = Flask(__name__)

from backend.mcp.job_api import search_jobs, get_salary_insights
from backend.services.ai_engine import enhance_with_mcp_data

def test_mcp_direct():
    print("\n--- Testing Direct MCP API Calls ---")
    
    # Test Job Search
    print("Searching for 'software engineer' in 'bangalore'...")
    jobs = search_jobs('software engineer', 'bangalore', max_results=3)
    print(f"Success: {jobs['success']}")
    print(f"Source: {jobs['source']}")
    print(f"Jobs Found: {len(jobs.get('jobs', []))}")
    if jobs.get('jobs'):
        print(f"Sample Job: {jobs['jobs'][0]['title']} at {jobs['jobs'][0]['company']}")
        print(f"Salary: {jobs['jobs'][0]['salary_display']}")
    
    # Test Salary
    print("\nGetting salary for 'product manager' in 'india'...")
    salary = get_salary_insights('product manager', 'india')
    print(f"Success: {salary['success']}")
    print(f"Insights: {salary.get('insights')}")

def test_ai_integration():
    print("\n--- Testing AI Engine Integration ---")
    
    queries = [
        "Find me python developer jobs in Mumbai",
        "What is the salary of a data scientist?",
        "Tell me about trending skills in software engineering"
    ]
    
    for q in queries:
        print(f"\nQuery: '{q}'")
        data = enhance_with_mcp_data(q)
        if data:
            print("MCP Data Fetched: YES")
            print(f"Data type: {data.get('tool') if 'tool' in data else 'Raw Data'}")
        else:
            print("MCP Data Fetched: NO (Expected for some queries if logic filters it)")

if __name__ == "__main__":
    try:
        test_mcp_direct()
        test_ai_integration()
        print("\n✅ Verification Complete!")
    except Exception as e:
        print(f"\n❌ Verification Failed: {e}")
        import traceback
        traceback.print_exc()
