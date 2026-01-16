import os
import time
from typing import Optional, List

class APIKeyManager:
    """
    Manages multiple Gemini API keys with automatic rotation and cooldown tracking.
    Provides automatic failover when quota is exhausted on one key.
    """
    
    def __init__(self):
        # Load all available API keys from environment
        self.keys: List[str] = []
        
        # Try up to 5 keys
        for i in range(1, 6):
            key = os.getenv(f'GEMINI_API_KEY_{i}')
            # For the first key, also check legacy GEMINI_API_KEY env var
            if i == 1 and not key:
                key = os.getenv('GEMINI_API_KEY')
            if key:
                self.keys.append(key)
        
        if not self.keys:
            raise ValueError("No API keys configured. Please set GEMINI_API_KEY_1 in environment.")
        
        self.current_index = 0
        self.quota_exhausted = {}  # key -> timestamp when quota will reset
        
        print(f"[APIKeyManager] Initialized with {len(self.keys)} API key(s)")
    
    def get_available_key(self) -> str:
        """
        Get an available API key that's not currently rate-limited.
        Rotates through keys automatically.
        
        Returns:
            str: Available API key
            
        Raises:
            Exception: If all keys are exhausted
        """
        attempts = 0
        max_attempts = len(self.keys)
        
        while attempts < max_attempts:
            key = self.keys[self.current_index]
            
            # Check if this key is still on cooldown
            if key in self.quota_exhausted:
                cooldown_until = self.quota_exhausted[key]
                if time.time() < cooldown_until:
                    # Still on cooldown, try next key
                    self.current_index = (self.current_index + 1) % len(self.keys)
                    attempts += 1
                    continue
                else:
                    # Cooldown expired, remove from exhausted list
                    del self.quota_exhausted[key]
            
            # This key is available
            return key
        
        # All keys exhausted
        next_reset = min(self.quota_exhausted.values()) - time.time()
        raise QuotaExhaustedError(
            f"All {len(self.keys)} API keys are rate-limited. "
            f"Next key available in {int(next_reset)} seconds."
        )
    
    def mark_exhausted(self, key: str, cooldown_seconds: int = 120):
        """
        Mark a key as quota-exhausted with a cooldown period.
        
        Args:
            key: The API key to mark
            cooldown_seconds: How long to wait before retrying (default: 2 minutes)
        """
        self.quota_exhausted[key] = time.time() + cooldown_seconds
        print(f"[APIKeyManager] Key marked exhausted. Cooldown: {cooldown_seconds}s. "
              f"Keys available: {len(self.keys) - len(self.quota_exhausted)}/{len(self.keys)}")
        
        # Rotate to next key immediately
        self.current_index = (self.current_index + 1) % len(self.keys)
    
    def get_status(self) -> dict:
        """Get current status of all keys"""
        return {
            "total_keys": len(self.keys),
            "available_keys": len(self.keys) - len(self.quota_exhausted),
            "exhausted_keys": len(self.quota_exhausted),
            "current_index": self.current_index
        }


class QuotaExhaustedError(Exception):
    """Raised when all API keys are quota-exhausted"""
    pass


# Global singleton instance
_key_manager: Optional[APIKeyManager] = None


def get_key_manager() -> APIKeyManager:
    """Get or create the global APIKeyManager singleton"""
    global _key_manager
    if _key_manager is None:
        _key_manager = APIKeyManager()
    return _key_manager
