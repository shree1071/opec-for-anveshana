"""
OPEC 4-Agent Orchestrator (LangGraph)

This module implements the OPEC methodology using a LangGraph workflow:
- O (Observation): Empathetic listener
- P (Pattern): Psychological pattern detector
- E (Evaluation): Market reality checker
- C (Clarity): Synthesis and response generator
"""

import json
import logging
from .graph import opec_graph
from .prompts import OPEC_UNIFIED_PROMPT

logger = logging.getLogger(__name__)

class OPECOrchestrator:
    """
    Orchestrates the 4 OPEC agents using LangGraph or fast single-call mode.
    """
    
    def __init__(self, fast_mode: bool = True):
        """
        Initialize orchestrator.
        
        Args:
            fast_mode: If True, uses single API call (faster). If False, uses 4 LangGraph calls.
        """
        self.fast_mode = fast_mode
    
    def process_message(
        self, 
        message: str, 
        context_messages: list = None,
        student_context: dict = None,
        mcp_data: dict = None
    ) -> tuple[str, dict, dict]:
        """
        Process a message through the OPEC system.
        
        Returns:
            tuple: (response_text, detected_patterns, thinking_sections)
        """
        if self.fast_mode:
            return self._process_fast(message, context_messages, student_context, mcp_data)
        else:
            return self._process_langgraph(message, context_messages, student_context, mcp_data)
    
    def _process_fast(
        self, 
        message: str,
        context_messages: list = None,
        student_context: dict = None,
        mcp_data: dict = None
    ) -> tuple[str, dict]:
        """
        Fast single-call processing using unified OPEC prompt.
        Uses 1 API call instead of 4, ~3-4x faster.
        """
        from .graph import invoke_model_with_rotation
        from langchain_core.messages import HumanMessage
        
        try:
            # Build context strings
            student_context_str = ""
            if student_context:
                student_context_str = "\n".join([f"{k}: {v}" for k, v in student_context.items() if v])
            
            mcp_context = ""
            if mcp_data:
                mcp_context = f"\n\nREAL-TIME DATA:\n{json.dumps(mcp_data, indent=2)}"
            
            # Build the unified prompt
            prompt = OPEC_UNIFIED_PROMPT.format(
                student_context=student_context_str,
                mcp_context=mcp_context
            )
            
            # Add conversation context
            if context_messages:
                prompt += "\n\nRECENT CONVERSATION:\n"
                for msg in context_messages[-5:]:
                    role = msg.get('role', 'user').upper()
                    content = msg.get('content', '')[:200]
                    prompt += f"{role}: {content}\n"
            
            prompt += f"\nUSER MESSAGE: {message}\n\nRESPONSE STARTS HERE:"
            
            # Single API call
            response = invoke_model_with_rotation([HumanMessage(content=prompt)])
            
            # Extract content
            content = response.content
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
            elif hasattr(content, 'text'):
                content = content.text
            
            raw_response = str(content)
            
            # Parse structured OPEC response - extract all sections
            final_response = raw_response
            patterns = {}
            thinking = {
                "observation": "",
                "pattern": "",
                "evaluation": ""
            }
            
            # Extract [[OBSERVATION]] section
            if "[[OBSERVATION]]" in raw_response:
                obs_parts = raw_response.split("[[OBSERVATION]]")
                if len(obs_parts) > 1:
                    obs_content = obs_parts[1]
                    if "[[PATTERN]]" in obs_content:
                        thinking["observation"] = obs_content.split("[[PATTERN]]")[0].strip()
                    elif "[[EVALUATION]]" in obs_content:
                        thinking["observation"] = obs_content.split("[[EVALUATION]]")[0].strip()
                    elif "[[CLARITY]]" in obs_content:
                        thinking["observation"] = obs_content.split("[[CLARITY]]")[0].strip()
            
            # Extract [[PATTERN]] section
            if "[[PATTERN]]" in raw_response:
                pat_parts = raw_response.split("[[PATTERN]]")
                if len(pat_parts) > 1:
                    pat_content = pat_parts[1]
                    if "[[EVALUATION]]" in pat_content:
                        thinking["pattern"] = pat_content.split("[[EVALUATION]]")[0].strip()
                    elif "[[CLARITY]]" in pat_content:
                        thinking["pattern"] = pat_content.split("[[CLARITY]]")[0].strip()
                    
                    # Simple pattern detection from pattern section
                    for pattern in ["external_pressure", "sunk_cost", "analysis_paralysis", "imposter_syndrome"]:
                        if pattern.lower() in thinking["pattern"].lower():
                            patterns[pattern] = 1.0
            
            # Extract [[EVALUATION]] section
            if "[[EVALUATION]]" in raw_response:
                eval_parts = raw_response.split("[[EVALUATION]]")
                if len(eval_parts) > 1:
                    eval_content = eval_parts[1]
                    if "[[CLARITY]]" in eval_content:
                        thinking["evaluation"] = eval_content.split("[[CLARITY]]")[0].strip()
            
            # Extract [[CLARITY]] section (final response)
            if "[[CLARITY]]" in raw_response:
                clarity_parts = raw_response.split("[[CLARITY]]")
                final_response = clarity_parts[1].strip()
            
            return final_response, patterns, thinking
            
        except Exception as e:
            logger.error(f"Fast OPEC processing failed: {e}")
            return "I'm having trouble processing your request right now.", {}, {}
    
    def _process_langgraph(
        self, 
        message: str,
        context_messages: list = None,
        student_context: dict = None,
        mcp_data: dict = None
    ) -> tuple[str, dict, dict]:
        """
        Original LangGraph-based processing (4 separate API calls).
        More detailed but slower.
        """
        try:
            inputs = {
                "message": message,
                "context_messages": context_messages or [],
                "student_context": student_context or {},
                "mcp_data": mcp_data or {}
            }
            
            result = opec_graph.invoke(inputs)
            
            final_response = result.get("final_response", "I'm here to help.")
            patterns = result.get("patterns", {})
            
            # Extract thinking from langgraph results
            thinking = {
                "observation": str(result.get("observation", {})),
                "pattern": str(result.get("patterns", {})),
                "evaluation": str(result.get("evaluation", {}))
            }
            
            if "detected_patterns" in patterns:
                patterns = patterns["detected_patterns"]
                
            return final_response, patterns, thinking
            
        except Exception as e:
            logger.error(f"LangGraph execution failed: {e}")
            return f"I encountered an issue processing your request. Error: {str(e)[:50]}", {}, {}

# Singleton instance
_orchestrator = None

def get_orchestrator(fast_mode: bool = True) -> OPECOrchestrator:
    """Get or create the OPEC orchestrator singleton"""
    global _orchestrator
    if _orchestrator is None or _orchestrator.fast_mode != fast_mode:
        _orchestrator = OPECOrchestrator(fast_mode=fast_mode)
    return _orchestrator

