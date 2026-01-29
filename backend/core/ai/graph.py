from typing import TypedDict, Annotated, List, Dict, Any, Union
import json
import os
from langgraph.graph import StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage
from .api_key_manager import get_key_manager, QuotaExhaustedError
import time
import re

# --- State Definition ---
class AgentState(TypedDict):
    message: str
    context_messages: List[Dict[str, str]]
    student_context: Dict[str, Any]
    mcp_data: Dict[str, Any]
    
    # Internal Agent Outputs
    observation: Dict[str, Any]
    patterns: Dict[str, Any]
    evaluation: Dict[str, Any]
    
    # Final Output
    final_response: str

# --- Node Implementations ---

# --- Node Implementations ---

# --- Helper Functions ---

def get_llm_instance(api_key: str):
    """Create LLM instance with specific key"""
    safety_settings = {}
    try:
        from langchain_google_genai import HarmBlockThreshold, HarmCategory
        safety_settings = {
            HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
        }
    except ImportError:
        pass
    except Exception:
        pass

    return ChatGoogleGenerativeAI(
        model="gemini-3-flash-preview", 
        google_api_key=api_key,
        temperature=0.7,
        safety_settings=safety_settings
    )

def invoke_model_with_rotation(messages: list) -> Any:
    """
    Invokes the model with automatic API key rotation on 429 errors.
    If all keys are exhausted, waits for the cooldown and retries.
    """
    key_manager = get_key_manager()
    max_retries = 5  # Increased retries to handle waits
    
    for attempt in range(max_retries + 1):
        try:
            # Get a fresh key and instance
            api_key = key_manager.get_available_key()
            llm = get_llm_instance(api_key)
            
            return llm.invoke(messages)
        
        except Exception as e:
            # Check for QuotaExhaustedError by name (robust to reloads)
            if type(e).__name__ == "QuotaExhaustedError":
                # All keys are exhausted. Parse wait time or default to 60s.
                wait_time = 60
                try:
                    match = re.search(r'in (\d+) seconds', str(e))
                    if match:
                        wait_time = int(match.group(1)) + 1 
                except:
                    pass
                
                print(f"All API keys exhausted. Waiting {wait_time}s before retry...")
                time.sleep(wait_time)
                continue

            error_str = str(e)
            
            # Check for rate limit errors (429 or Resource Exhausted)
            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str or "quota" in error_str.lower():
                print(f"Warning: API Key exhausted (Attempt {attempt+1}). Rotating...")
                try:
                    # Mark the specific key as exhausted for 60 seconds
                    key_manager.mark_exhausted(api_key, cooldown_seconds=60)
                except Exception as ex:
                    print(f"Error marking key exhausted: {ex}")
                continue
            else:
                # For non-retriable errors, raise immediately
                raise e
                
    raise Exception("Max retries exceeded for model invocation")

def extract_json(content: Union[str, List[Any]]) -> Dict[str, Any]:
    """
    Robustly extract JSON from LLM response content.
    """
    try:
        # Handle list response from Gemini 3
        if isinstance(content, list):
            parts = []
            for c in content:
                if hasattr(c, 'text'):
                    parts.append(c.text)
                elif isinstance(c, dict) and 'text' in c:
                    parts.append(c['text'])
                elif isinstance(c, str):
                    parts.append(c)
            content = "".join(parts)
        
        # Handle object with .text attribute
        if hasattr(content, 'text'):
            content = content.text
        
        text = str(content).strip()
        
        if not text:
            print("Warning: LLM returned empty response.")
            return {}

        # 1. Try to find JSON block in markdown
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].strip()
            
        # 2. Try to find braces if not pure JSON
        if not (text.startswith("{") and text.endswith("}")):
            start = text.find("{")
            end = text.rfind("}")
            if start != -1 and end != -1:
                text = text[start:end+1]
        
        # 3. Parsers
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            import ast
            try:
                return ast.literal_eval(text)
            except:
                pass
            raise ValueError(f"Could not parse JSON from: {text[:100]}...")
            
    except Exception as e:
        print(f"JSON Extraction Failed: {e}")
        print(f"FAILED CONTENT REPR: {repr(content)}")
        return {}

def observation_node(state: AgentState):
    """
    Agent O: Empathetic listener that understands emotions and concerns.
    """
    prompt = f"""You are the OBSERVATION AGENT (O).
    Analyze the user's message deeply.
    
    USER MESSAGE: {state['message']}
    
    STUDENT PROFILE:
    {json.dumps(state.get('student_context', {}), indent=2)}
    
    Output ONLY valid JSON.
    - No markdown formatting (no ```json).
    - Use double quotes for all keys and strings.
    - No trailing commas.
    
    {{
        "core_concern": "summary",
        "emotional_tone": "tone",
        "unspoken_needs": ["need1", "need2"]
    }}"""
    
    try:
        response = invoke_model_with_rotation([HumanMessage(content=prompt)])
        data = extract_json(response.content)
        if not data:
            return {"observation": {"core_concern": state['message'], "emotional_tone": "neutral"}}
        return {"observation": data}
    except Exception as e:
        print(f"Observation Agent Error: {e}")
        return {"observation": {"core_concern": state['message'], "emotional_tone": "neutral"}}

def pattern_node(state: AgentState):
    """
    Agent P: Detects psychological patterns.
    """
    observation = state.get('observation', {})
    
    prompt = f"""You are the PATTERN AGENT (P).
    Detect psychological patterns based on this analysis.
    
    OBSERVATION:
    {json.dumps(observation, indent=2)}
    
    USER MESSAGE: {state['message']}
    
    Detect: external_pressure, internal_conflict, circular_thinking, identity_uncertainty.
    
    Output ONLY valid JSON.
    - No markdown formatting (no ```json).
    - Use double quotes.
    
    {{
        "detected_patterns": {{ "pattern_name": score_0_to_10 }}
    }}"""
    
    try:
        response = invoke_model_with_rotation([HumanMessage(content=prompt)])
        data = extract_json(response.content)
        return {"patterns": data.get("detected_patterns", {})}
    except Exception as e:
        print(f"Pattern Agent Error: {e}")
        return {"patterns": {}}

def evaluation_node(state: AgentState):
    """
    Agent E: Market reality check.
    """
    prompt = f"""You are the EVALUATION AGENT (E).
    Provide a reality check and market insights.
    
    USER MESSAGE: {state['message']}
    MCP DATA: {json.dumps(state.get('mcp_data', {}), indent=2)}
    
    Output ONLY valid JSON.
    - No markdown formatting.
    - Use double quotes.

    {{
        "market_insight": "key insight",
        "reality_check": "honest assessment"
    }}"""
    
    try:
        response = invoke_model_with_rotation([HumanMessage(content=prompt)])
        data = extract_json(response.content)
        return {"evaluation": data}
    except Exception as e:
        print(f"Evaluation Agent Error: {e}")
        return {"evaluation": {}}

def clarity_node(state: AgentState):
    """
    Agent C: Synthesizes everything into the final response.
    """
    student_name = state.get('student_context', {}).get('name', 'there')
    
    prompt = f"""You are the CLARITY AGENT (C).
    Synthesize all insights into a warm, helpful response for {student_name}.
    
    OBSERVATION: {json.dumps(state.get('observation', {}))}
    PATTERNS: {json.dumps(state.get('patterns', {}))}
    EVALUATION: {json.dumps(state.get('evaluation', {}))}
    
    USER MESSAGE: {state['message']}
    
    Write a natural response (no JSON). Be a wise mentor."""
    
    try:
        response = invoke_model_with_rotation([HumanMessage(content=prompt)])
        content = response.content
        if isinstance(content, list):
            # Extract text from each content block properly
            parts = []
            for c in content:
                if hasattr(c, 'text'):
                    parts.append(c.text)
                elif isinstance(c, dict) and 'text' in c:
                    parts.append(c['text'])
                elif isinstance(c, str):
                    parts.append(c)
                # Skip non-text blocks (like signatures)
            content = "".join(parts)
        elif hasattr(content, 'text'):
            content = content.text
        return {"final_response": content}
    except Exception as e:
        return {"final_response": "I'm having a bit of trouble thinking clearly right now, but I'm here to listen."}

# --- Graph Construction ---

workflow = StateGraph(AgentState)

# Add Nodes
workflow.add_node("observation", observation_node)
workflow.add_node("pattern", pattern_node)
workflow.add_node("evaluation", evaluation_node)
workflow.add_node("clarity", clarity_node)

# Add Edges
# O -> (P, E) -> C
workflow.set_entry_point("observation")
workflow.add_edge("observation", "pattern")
workflow.add_edge("observation", "evaluation")
workflow.add_edge("pattern", "clarity")
workflow.add_edge("evaluation", "clarity")
workflow.add_edge("clarity", END)

# Compile
opec_graph = workflow.compile()
