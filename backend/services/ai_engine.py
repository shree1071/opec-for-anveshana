import os
import json
import logging
import sys
print("DEBUG: ai_engine.py loading...", file=sys.stderr)
# try:
#     import google.generativeai as genai
#     print("DEBUG: ai_engine.py google.generativeai imported", file=sys.stderr)
# except Exception as e:
#     print(f"DEBUG: ai_engine.py failed to import google.generativeai: {e}", file=sys.stderr)
#     raise
genai = None # Force mock mode


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

import requests

SYSTEM_PROMPT = """
You are the "CareerPath" AI Engine, a sophisticated career simulation system. 
You are composed of 5 specialist agents:
1. Career Counselor Agent: Assessment of fit, passion, and long-term satisfaction.
2. Industry Trend Analyst Agent: Market demand, growth sectors, and future-proofing.
3. Skill Gap Analyzer Agent: Technical and soft skill requirements vs current profile.
4. Salary & Market Reality Agent: Compensation expectations vs reality, risk/reward.
5. Risk & Backup Path Agent: What could go wrong and alternate paths.

Your goal is to simulate a user's career over the next 4-6 years based on their profile.
You must synthesize the output of these agents into a single JSON response.

The input will be a JSON object representing the User Profile.

The output MUST be a valid JSON object with the following structure:
{
  "roadmap": [
    {
      "year": 1,
      "title": "Year 1: [Theme]",
      "role": "Target Role Title",
      "focus": "Main focus area",
      "skills_to_acquire": ["skill1", "skill2"],
      "milestones": ["milestone1", "milestone2"]
    },
    ... (up to Year 6)
  ],
  "analysis": {
    "counselor_view": "Summary from Counselor Agent",
    "market_outlook": "Summary from Industry Analyst",
    "skill_gaps": "Critical missing skills identified",
    "salary_projection": "Expected salary progression range in INR (e.g., ₹6L - ₹18L)",
    "risk_assessment": "Risk level and potential pitfalls",
    "backup_paths": ["Backup Career 1", "Backup Career 2"]
  },
  "flowchart": "graph TD\\nA[Start: Current State]-->B[Year 1: Junior Role]\\nB-->C[Year 2: Mid Role]\\nC-->D[Year 3: Senior Role]\\nD-->E[Year 4: Lead Role]\\nE-->F[Year 5: Manager]\\nF-->G[Year 6: Director]"
}

CRITICAL FLOWCHART RULES:
1. Use 'graph TD' for top-down flow
2. Use --> for arrows with NO SPACES (A-->B not A --> B)
3. Use \\n for line breaks (will be converted to actual newlines)
4. Keep node labels SHORT (max 25 chars)
5. Use brackets [] for rectangular nodes
6. EXAMPLE: "graph TD\\nA[Start]-->B[Year1]\\nB-->C[Year2]"
7. NO SPACES around arrows or Mermaid will fail!
DO NOT include markdown formatting (like ```json or ```mermaid). Just return the raw JSON string.
"""



from google import genai
from google.genai import types
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type, RetryError

# Helper function for retrying on errors (handle 429 broadly)
@retry(
    stop=stop_after_attempt(5),
    wait=wait_exponential(multiplier=2, min=5, max=60),
    reraise=True
)
def call_gemini_with_retry(client, model, prompt):
    return client.models.generate_content(
        model=model,
        contents=prompt
    )

def run_career_simulation(user_profile):
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        logger.warning("GEMINI_API_KEY not found. Using mock response.")
        return _get_mock_response()

    try:
        client = genai.Client(api_key=api_key)
        
        # Hardcoded specific model for stability instead of dynamic listing which can be flaky
        valid_model = 'gemini-3-flash-preview'
            
        logger.info(f"Using Gemini Model: {valid_model}")

        # Enhanced Prompt with Student Personalization
        student_name = user_profile.get('name', 'Student')
        education_context = ""
        if user_profile.get('education_level'):
            education_context += f"\nEducation Level: {user_profile.get('education_level')}"
        if user_profile.get('grade_or_year'):
            education_context += f"\nCurrent Year/Grade: {user_profile.get('grade_or_year')}"
        if user_profile.get('stream_or_branch'):
            education_context += f"\nStream/Branch: {user_profile.get('stream_or_branch')}"
        if user_profile.get('interests'):
            education_context += f"\nInterests: {user_profile.get('interests')}"
        if user_profile.get('goals'):
            education_context += f"\nCareer Goals: {user_profile.get('goals')}"
        
        # Add chat insights if available
        chat_insights_text = ""
        if user_profile.get('chat_insights'):
            insights = user_profile['chat_insights']
            chat_insights_text = f"\n\nCHAT CONVERSATION INSIGHTS (Use this to understand {student_name}'s actual concerns):"
            chat_insights_text += f"\n- Total conversations: {insights.get('total_messages', 0)} messages"
            chat_insights_text += f"\n- Engagement level: {insights.get('engagement_level', 'unknown')}"
            
            if insights.get('recent_questions'):
                chat_insights_text += f"\n- Recent questions they asked: {', '.join(insights['recent_questions'][:3])}"
            if insights.get('recent_concerns'):
                chat_insights_text += f"\n- Recent topics discussed: {', '.join(insights['recent_concerns'][:3])}"
            
            chat_insights_text += "\n\nIMPORTANT: Use these chat insights to address their ACTUAL concerns in the roadmap, not generic advice."
        
        detailed_prompt = f"""
        {SYSTEM_PROMPT}

        CRITICAL INSTRUCTION: This roadmap is for {student_name}. Provide extremely detailed, actionable advice.
        - Address them by name in the analysis
        - For 'skills_to_acquire', be specific: 'Advanced Python (AsyncIO, Pydantic, Fast API)', not just 'Python'
        - For 'milestones', be specific: 'Build a full-stack e-commerce app with Stripe integration'
        - In 'analysis', provide 3-4 sentences per section, reference their goals and interests
        - Make it personal to {student_name}'s context
        {education_context}
        {chat_insights_text}
        
        User Profile:
        {json.dumps(user_profile)}
        """

        try:
            response = call_gemini_with_retry(client, valid_model, detailed_prompt)
        except RetryError:
            logger.warning(f"Model {valid_model} failed after retries. Falling back to gemini-2.0-flash-exp")
            response = call_gemini_with_retry(client, 'gemini-2.0-flash-exp', detailed_prompt)
        response_text = response.text
        
        # Clean up if markdown is present
        response_text = response_text.replace("```json", "").replace("```", "").strip()
        
        return json.loads(response_text)
        
    except Exception as e:
        import sys
        print(f"CRITICAL ERROR: Gemini SDK failed: {e}", file=sys.stderr)
        logger.error(f"Error during AI simulation (SDK): {e}")
        return _get_mock_response(str(e))


def _get_mock_response(error_msg="API Check Failed"):
    return {
        "roadmap": [
            {
                "year": 1,
                "title": f"Year 1: Foundation (ERROR: {error_msg})",
                "role": "Junior Developer",
                "focus": "Fixing Backend Connection",
                "skills_to_acquire": ["Check Terminal Logs", "Verify API Key", "Restart Backend"],
                "milestones": [f"Error Details: {error_msg}", "Check backend/.env file"]
            },
            {
                "year": 2,
                "title": "Year 2: Specialization",
                "role": "Mid-Level Developer",
                "focus": "System Design & Architecture",
                "skills_to_acquire": ["Microservices", "Cloud (AWS/Azure)"],
                "milestones": ["Lead a small module", "Mentor a junior"]
            }
        ],
        "analysis": {
            "counselor_view": f"We encountered an error: {error_msg}. Please check your backend logs.",
            "market_outlook": "High demand for full-stack developers in 2026.",
            "skill_gaps": "lack of cloud experience.",
            "salary_projection": "₹6L - ₹8L → ₹12L - ₹18L",
            "risk_assessment": "Moderate risk due to rapid tech changes.",
            "backup_paths": ["Technical Product Manager", "DevOps Engineer"]
        },
        "flowchart": "graph TD\nA[Current State]-->B[Year 1: Junior Dev]\nB-->C[Year 2: Mid-Level Dev]"
    }

def chat_with_coach(question, user_context=None):
    """AI Career Coach chat function"""
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        return "I'm sorry, I cannot answer right now. (Missing API Key)"

    try:
        client = genai.Client(api_key=api_key)
        
        valid_model = 'gemini-3-flash-preview'

        context_str = ""
        if user_context:
            context_str = f"\n\nUser's Career Roadmap Context:\n{json.dumps(user_context, indent=2)}"

        prompt = f"""You are an elite AI Career Coach helping a user with their career path.
Answer their question with wisdom, strategy, and encouragement.

User Question: {question}
{context_str}

Provide a helpful, actionable response. Be specific and reference their roadmap if relevant."""

        try:
            response = call_gemini_with_retry(client, valid_model, prompt)
        except RetryError:
            logger.warning(f"Model {valid_model} failed after retries. Falling back to gemini-2.0-flash-exp")
            response = call_gemini_with_retry(client, 'gemini-2.0-flash-exp', prompt)
        return response.text
        
    except Exception as e:
        logger.error(f"Error during Chat: {e}")
        return "I'm having trouble connecting right now. Please try again!"
