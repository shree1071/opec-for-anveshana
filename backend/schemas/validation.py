"""
Input validation schemas using Pydantic for type safety and validation.
"""

from pydantic import BaseModel, validator, Field
from typing import Optional, List


class ChatMessageRequest(BaseModel):
    """Request schema for chat message endpoint"""
    clerk_id: str = Field(..., min_length=1, description="Clerk user ID")
    message: str = Field(..., min_length=1, max_length=5000, description="User message")
    
    @validator('message')
    def message_not_empty(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Message cannot be empty')
        # Strip whitespace
        return v.strip()
    
    @validator('clerk_id')
    def clerk_id_valid(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Clerk ID is required')
        return v.strip()


class SimulationRequest(BaseModel):
    """Request schema for career simulation endpoint"""
    clerk_id: Optional[str] = None
    user_profile: dict = Field(..., description="User profile for simulation")
    
    @validator('user_profile')
    def profile_not_empty(cls, v):
        if not v or not isinstance(v, dict):
            raise ValueError('User profile must be a non-empty dictionary')
        return v


class StudentProfileUpdate(BaseModel):
    """Request schema for student profile updates"""
    clerk_id: str = Field(..., min_length=1)
    email: str = Field(..., regex=r'^[\w\.-]+@[\w\.-]+\.\w+$')
    name: Optional[str] = None
    education_level: Optional[str] = None
    grade_or_year: Optional[str] = None
    stream_or_branch: Optional[str] = None
    interests: Optional[str] = None
    goals: Optional[str] = None
    location: Optional[str] = None
    budget: Optional[str] = None
    onboarding_completed: bool = False
    
    @validator('email')
    def email_valid(cls, v):
        if '@' not in v or '.' not in v:
            raise ValueError('Invalid email format')
        return v.lower().strip()


def validate_request(schema_class: BaseModel, data: dict):
    """
    Validate request data against a Pydantic schema.
    
    Args:
        schema_class: The Pydantic model class
        data: Request data to validate
        
    Returns:
        Validated and cleaned data
        
    Raises:
        ValidationError: If validation fails
    """
    try:
        validated = schema_class(**data)
        return validated.dict()
    except Exception as e:
        from middleware.error_handler import ValidationError as APIValidationError
        raise APIValidationError(
            message="Invalid request data",
            details={"errors": str(e)}
        )
