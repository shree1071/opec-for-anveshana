from google import genai
from google.genai import types
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type, RetryError
import os
import json
import hashlib
import time
import sys
from functools import lru_cache
from .prompts import OPEC_UNIFIED_PROMPT
from core.ai.api_key_manager import get_key_manager, QuotaExhaustedError
from middleware.error_handler import APIError

# Simple in-memory cache for responses
response_cache = {}

def configure_gemini():
    """Initialize Gemini with API key from key manager"""
    try:
        key_manager = get_key_manager()
        api_key = key_manager.get_available_key()
        client = genai.Client(api_key=api_key)
        return client, api_key
    except QuotaExhaustedError as e:
        raise APIError(
            message=str(e),
            status_code=429,
            error_code="QUOTA_EXCEEDED"
        )

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=3, min=10, max=120),
    reraise=True
)
def call_gemini_with_retry(client, model, prompt, current_key):
    """Call Gemini API with retry logic and quota tracking"""
    try:
        return client.models.generate_content(
            model=model,
            contents=prompt
        )
    except Exception as e:
        error_msg = str(e).lower()
        # Check if it's a quota error
        if '429' in error_msg or 'quota' in error_msg or 'resource_exhausted' in error_msg:
            # Mark this key as exhausted
            key_manager = get_key_manager()
            key_manager.mark_exhausted(current_key)
            raise QuotaExhaustedError(
                "API quota exceeded on this key. Rotating to next key."
            )
        raise

def call_gemini_no_retry(client, model, prompt):
    return client.models.generate_content(
        model=model,
        contents=prompt
    )

def detect_signals(message, context=""):
    # DISABLED: Signal detection is consuming quota but not critical
    # Return empty signals to save API quota for actual chat responses
    print("DEBUG: Signal detection disabled to conserve API quota")
    return {"signals": {}}

def get_cache_key(message, context_messages):
    """Generate cache key from message and context"""
    context_str = str([m.get('content', '')[:50] for m in context_messages[-3:]])
    combined = f"{message}_{context_str}"
    return hashlib.md5(combined.encode()).hexdigest()

def generate_chat_response(message, context_messages=None, active_patterns=None, student_context=None, use_search=False):
    """
    Generate a chat response using Gemini with pattern detection integration.
    Now includes student context from onboarding for personalization.
    Uses API key rotation for better quota management.
    """
    # Generate cache key (include use_search in key)
    cache_key = hashlib.md5(f"{message}{json.dumps(context_messages or [])}{use_search}".encode()).hexdigest()
    
    # Check cache first
    if cache_key in response_cache:
        print("[CACHE HIT] Returning cached response")
        return response_cache[cache_key]
    
    # Legacy pattern formatting removed - handled by OPEC Unified Prompt internally
    
    # Format student context for the prompt
    student_context_str = ""
    if student_context:
        student_context_str = "\n".join([f"{k}: {v}" for k, v in student_context.items() if v])
    
    # MCP Context Injection
    mcp_context = ""
    if use_search:
        try:
            # Inline import to prevent circular dependency
            from services.ai_engine import enhance_with_mcp_data
            print(f"DEBUG: Search Mode ON. Fetching MCP data for: {message}")
            mcp_data = enhance_with_mcp_data(message)
            if mcp_data:
                mcp_context = f"\n\n[REAL-TIME SEARCH RESULT]:\n{json.dumps(mcp_data, indent=2)}\n\nINSTRUCTION: Use the above real-time data to answer the user's question accurately. Cite the source if available (e.g. 'According to recent job postings...')."
                print("DEBUG: MCP Data found and injected.")
            else:
                print("DEBUG: No relevant MCP data found.")
        except Exception as e:
            print(f"ERROR: MCP Search failed: {e}")

    
    # Unified OPEC Prompt Construction
    system_prompt = OPEC_UNIFIED_PROMPT.format(
        student_context=student_context_str,
        mcp_context=mcp_context
    )

    
    # Build chat history
    history = [
        {"role": "user", "parts": [system_prompt]}
    ]
    
    # Add context messages (simplified)
    if context_messages:
        for msg in context_messages[-5:]:
            role = "user" if msg['role'] == 'user' else "model"
            history.append({"role": role, "parts": [msg['content']]})
        
    history.append({"role": "user", "parts": [message]})
    
    try:
        client, current_key = configure_gemini()
        
        # Build full prompt
        full_prompt = system_prompt + "\n\n"
        for m in history[1:]:
             full_prompt += f"{m['role'].upper()}: {m['parts'][0]}\n"
        full_prompt += "MODEL:"
        
        try:
            response = call_gemini_with_retry(client, 'gemini-3-flash-preview', full_prompt, current_key)
        except RetryError:
            print("Chat generation 3.0 failed. Falling back to 2.0-flash-exp")
            try:
                response = call_gemini_with_retry(client, 'gemini-2.0-flash-exp', full_prompt, current_key)
            except:
                raise # Re-raise if fallback also fails
        
        raw_response = response.text
        
        # Parse the structured OPEC response
        final_response_text = raw_response
        
        try:
            if "[[CLARITY]]" in raw_response:
                parts = raw_response.split("[[CLARITY]]")
                final_response_text = parts[1].strip()
                
                # Log the internal thought process
                internal_thoughts = parts[0]
                print(f"\n--- OPEC INTERNAL PROCESS ---\n{internal_thoughts}\n-----------------------------")
            else:
                print("WARNING: OPEC structured signals not found in response. Returning raw text.")
                
        except Exception as parse_error:
            print(f"Error parsing OPEC response: {parse_error}")
            # Fallback to raw response if parsing fails
            final_response_text = raw_response

        # Cache the clean response
        response_cache[cache_key] = final_response_text
        
        return final_response_text
    except QuotaExhaustedError as e:
        # Try one more time with a different key
        try:
            client, current_key = configure_gemini()
            # Build full prompt again (if needed, or reuse from above)
            full_prompt = system_prompt + "\n\n"
            for m in history[1:]:
                 full_prompt += f"{m['role'].upper()}: {m['parts'][0]}\n"
            full_prompt += "MODEL:"
            response = call_gemini_with_retry(client, 'gemini-3-flash-preview', full_prompt, current_key) # Try primary model again
            response_text = response.text
            response_cache[cache_key] = response_text
            return response_text
        except QuotaExhaustedError:
            raise APIError(
                message="All API keys are currently rate-limited. Please try again in a few minutes.",
                status_code=429,
                error_code="QUOTA_EXCEEDED"
            )
        except Exception as e:
            error_msg = str(e)
            print(f"Error generating response after key rotation: {error_msg}")
            raise APIError(
                message="Failed to generate response after key rotation. Please try again.",
                status_code=500,
                error_code="AI_ERROR"
            )
    except APIError:
        raise # Re-raise APIError from configure_gemini
    except Exception as e:
        error_msg = str(e)
        print(f"Error generating response: {error_msg}")
        raise APIError(
            message="Failed to generate response. Please try again.",
            status_code=500,
            error_code="AI_ERROR"
        )
