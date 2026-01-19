
"""
Verify new MCP Conversational Tools (News & YouTube)
"""
import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from backend.mcp.tools import execute_tool, MCP_TOOLS

def test_news():
    print("\n📰 Testing News MCP...")
    # Test getting news about "AI jobs"
    result = execute_tool("get_industry_news", topic="Artificial Intelligence jobs India", max_results=3)
    
    if result.get("status") == "success":
        print("✅ News Search Successful")
        print(f"Query: {result['data']['query']}")
        print(f"Articles Found: {len(result['data']['articles'])}")
        if len(result['data']['articles']) > 0:
            print(f"Top Headline: {result['data']['articles'][0]['title']}")
    else:
        print(f"❌ News Search Failed: {result.get('error')}")

def test_youtube():
    print("\n📺 Testing YouTube MCP (Searching for API Key Tutorial)...")
    # Test searching for help on the user's current problem
    result = execute_tool("find_learning_videos", topic="How to get free google gemini api key 2025", max_results=1)
    
    if result.get("status") == "success":
        print("✅ YouTube Search Successful")
        print(f"Query: {result['data']['query']}")
        if len(result['data']['videos']) > 0:
            v = result['data']['videos'][0]
            print(f"Title: {v['title']}")
            print(f"Link: {v['link']}")
            print(f"Duration: {v['duration']}")
            print(f"Description: {v.get('description')}")
    else:
        print(f"❌ YouTube Search Failed: {result.get('error')}")

if __name__ == "__main__":
    print(f"Available Tools: {list(MCP_TOOLS.keys())}")
    test_news()
    test_youtube()
