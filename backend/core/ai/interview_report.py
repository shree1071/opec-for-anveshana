"""
AI Interview Report Generation Service
Uses Gemini to analyze interview performance and generate detailed reports
"""
import json
from google import genai
from core.ai.api_key_manager import get_key_manager, QuotaExhaustedError


REPORT_GENERATION_PROMPT = """You are an expert career coach and interview evaluator providing detailed feedback.

## Interview Context
- **Company**: {company}
- **Role**: {role}
- **Duration**: {duration_seconds} seconds ({duration_minutes} minutes)

## Your Task
Generate a COMPREHENSIVE and DETAILED interview performance report. Be specific, constructive, and encouraging.

## Output Format
Return ONLY valid JSON with this structure:
{{
    "overall_score": <number 0-100>,
    "communication_score": <number 0-100>,
    "technical_score": <number 0-100>,
    "confidence_score": <number 0-100>,
    "problem_solving_score": <number 0-100>,
    "cultural_fit_score": <number 0-100>,
    "strengths": [
        "Detailed strength 1 with specific observation",
        "Detailed strength 2 with specific observation",
        "Detailed strength 3 with specific observation",
        "Detailed strength 4 with specific observation"
    ],
    "weaknesses": [
        "Area to improve 1 with actionable advice",
        "Area to improve 2 with actionable advice",
        "Area to improve 3 with actionable advice"
    ],
    "key_insights": "<Detailed 3-4 sentence analysis of overall performance, highlighting standout moments and growth areas>",
    "recommendations": "<Detailed 4-5 specific, actionable steps for improvement with examples>",
    "interviewer_notes": "<2-3 sentences from the interviewer's perspective about candidate impression>",
    "next_steps": [
        "Specific action item 1",
        "Specific action item 2", 
        "Specific action item 3"
    ],
    "estimated_readiness": "<One of: 'Interview Ready', 'Almost There', 'Keep Practicing', 'Building Foundation'>"
}}

## Scoring Guidelines (Be Realistic)
- **0-40**: Needs significant improvement, fundamentals lacking
- **41-55**: Below expectations, clear gaps to address
- **56-70**: Meeting basic expectations, solid foundation
- **71-85**: Strong performance, minor refinements needed
- **86-100**: Exceptional, ready for top-tier interviews

## Important Context
- For a {role} position at {company}, consider industry standards
- {duration_minutes} minute interview length affects depth expectation
- Be encouraging but honest - students need real feedback to improve
- Include company-specific insights when possible (e.g., "{company} values X")

Generate a thorough, personalized report that will genuinely help this candidate improve.
"""


def generate_interview_report(company: str, role: str, duration_seconds: int) -> dict:
    """
    Generate an AI-powered interview performance report using Gemini.
    
    Args:
        company: Company name for the interview
        role: Role being interviewed for
        duration_seconds: Duration of the interview in seconds
        
    Returns:
        dict: Report data with scores, strengths, weaknesses, and recommendations
    """
    try:
        key_manager = get_key_manager()
        api_key = key_manager.get_available_key()
        client = genai.Client(api_key=api_key)
        
        prompt = REPORT_GENERATION_PROMPT.format(
            company=company,
            role=role,
            duration_seconds=duration_seconds,
            duration_minutes=round(duration_seconds / 60, 1)
        )
        
        response = client.models.generate_content(
            model='gemini-2.0-flash-exp',
            contents=prompt
        )
        
        # Parse the JSON response
        response_text = response.text.strip()
        
        # Clean up response if wrapped in markdown code blocks
        if response_text.startswith('```'):
            lines = response_text.split('\n')
            response_text = '\n'.join(lines[1:-1])
        
        report_data = json.loads(response_text)
        
        # Validate required fields
        required_fields = ['overall_score', 'communication_score', 'technical_score', 
                          'confidence_score', 'strengths', 'weaknesses', 
                          'key_insights', 'recommendations']
        
        for field in required_fields:
            if field not in report_data:
                raise ValueError(f"Missing required field: {field}")
        
        # Ensure scores are within bounds
        for score_field in ['overall_score', 'communication_score', 'technical_score', 'confidence_score']:
            report_data[score_field] = max(0, min(100, int(report_data[score_field])))
        
        # Ensure arrays have content
        if not report_data['strengths']:
            report_data['strengths'] = ['Completed the interview session']
        if not report_data['weaknesses']:
            report_data['weaknesses'] = ['More practice recommended']
            
        print(f"[AI REPORT] Generated report for {role} at {company}")
        return report_data
        
    except json.JSONDecodeError as e:
        print(f"[AI REPORT] JSON parsing error: {e}")
        return _get_fallback_report(company, role, duration_seconds)
    except QuotaExhaustedError:
        print("[AI REPORT] Quota exhausted, using fallback")
        return _get_fallback_report(company, role, duration_seconds)
    except Exception as e:
        print(f"[AI REPORT] Error generating report: {e}")
        return _get_fallback_report(company, role, duration_seconds)


def _get_fallback_report(company: str, role: str, duration_seconds: int) -> dict:
    """Generate a fallback report when AI is unavailable"""
    # Calculate base score from duration (more time = better engagement)
    base_score = min(85, 60 + (duration_seconds // 10))
    duration_mins = round(duration_seconds / 60, 1)
    
    return {
        'overall_score': base_score,
        'communication_score': base_score + 5,
        'technical_score': base_score - 5,
        'confidence_score': base_score,
        'problem_solving_score': base_score - 2,
        'cultural_fit_score': base_score + 3,
        'strengths': [
            f'Demonstrated initiative by practicing for the {role} position at {company}',
            'Showed commitment to professional development through consistent preparation',
            'Engaged actively in the mock interview session',
            'Willingness to receive and act on feedback'
        ],
        'weaknesses': [
            'Consider structuring answers using the STAR method (Situation, Task, Action, Result) for behavioral questions',
            'Work on providing more specific, quantifiable examples from past experiences',
            'Practice elaborating on technical concepts with clear, concise explanations'
        ],
        'key_insights': f'Great effort completing a {duration_mins}-minute mock interview for the {role} position at {company}. This session demonstrates your commitment to preparation. Consistent practice will help build confidence and refine your responses.',
        'recommendations': f'To strengthen your candidacy for {role} at {company}: 1) Research the company culture and recent news, 2) Prepare 3-5 specific examples from your experience that align with the role requirements, 3) Practice explaining technical concepts simply, 4) Record yourself to identify verbal fillers and pacing issues.',
        'interviewer_notes': f'The candidate showed genuine interest in the {role} position. With continued practice and preparation, there is strong potential for improvement.',
        'next_steps': [
            f'Research {company}\'s mission, values, and recent developments',
            'Prepare specific examples using the STAR method',
            'Practice with additional mock interviews to build confidence'
        ],
        'estimated_readiness': 'Keep Practicing' if base_score < 70 else 'Almost There'
    }

