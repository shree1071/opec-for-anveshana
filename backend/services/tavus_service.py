"""
Tavus 3D Avatar Service
Handles Tavus API interactions for 3D avatar-based interviews
"""
import os
import requests
from typing import Optional, Dict, Any


class TavusService:
    """Service for interacting with Tavus 3D Avatar API"""
    
    BASE_URL = "https://tavusapi.com/v2"
    
    def __init__(self):
        self.api_key = os.environ.get("TAVUS_API_KEY")
        self.replica_id = os.environ.get("TAVUS_REPLICA_ID")
        self.persona_id = os.environ.get("TAVUS_PERSONA_ID")
        
        if not self.api_key:
            raise ValueError("TAVUS_API_KEY environment variable is required")
    
    @property
    def headers(self) -> Dict[str, str]:
        return {
            "x-api-key": self.api_key,
            "Content-Type": "application/json"
        }
    
    def create_conversation(
        self,
        persona_id: Optional[str] = None,
        replica_id: Optional[str] = None,
        custom_greeting: Optional[str] = None,
        conversation_name: Optional[str] = None,
        callback_url: Optional[str] = None,
        conversational_context: Optional[str] = None,
        max_call_duration: int = 1800,  # 30 minutes
    ) -> Dict[str, Any]:
        """
        Create a new Tavus conversation for 3D avatar interview.
        
        Args:
            persona_id: The persona ID defining avatar behavior (uses env default if not provided)
            replica_id: The replica ID for visual appearance (uses env default if not provided)
            custom_greeting: Custom greeting the avatar will say
            conversation_name: Name for the conversation
            callback_url: URL for conversation status webhooks
            conversational_context: Additional context for the AI avatar
            max_call_duration: Maximum call duration in seconds
            
        Returns:
            Dict containing conversation_id, conversation_url, and status
        """
        url = f"{self.BASE_URL}/conversations"
        
        payload = {
            "replica_id": replica_id or self.replica_id,
            "persona_id": persona_id or self.persona_id,
            "max_call_duration": max_call_duration,
        }
        
        if custom_greeting:
            payload["custom_greeting"] = custom_greeting
        
        if conversation_name:
            payload["conversation_name"] = conversation_name
        
        if callback_url:
            payload["callback_url"] = callback_url
            
        if conversational_context:
            payload["conversational_context"] = conversational_context
        
        response = requests.post(url, json=payload, headers=self.headers)
        response.raise_for_status()
        
        return response.json()
    
    def end_conversation(self, conversation_id: str) -> Dict[str, Any]:
        """
        End an active Tavus conversation.
        
        Args:
            conversation_id: The conversation ID to end
            
        Returns:
            Response from Tavus API
        """
        url = f"{self.BASE_URL}/conversations/{conversation_id}/end"
        
        response = requests.post(url, headers=self.headers)
        response.raise_for_status()
        
        return response.json()
    
    def get_conversation(self, conversation_id: str) -> Dict[str, Any]:
        """
        Get details of a specific conversation.
        
        Args:
            conversation_id: The conversation ID to retrieve
            
        Returns:
            Conversation details including status, participants, etc.
        """
        url = f"{self.BASE_URL}/conversations/{conversation_id}"
        
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        
        return response.json()


# Singleton instance
_tavus_service: Optional[TavusService] = None


def get_tavus_service() -> TavusService:
    """Get or create a singleton TavusService instance."""
    global _tavus_service
    if _tavus_service is None:
        _tavus_service = TavusService()
    return _tavus_service
