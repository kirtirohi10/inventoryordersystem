from pydantic import BaseModel, Field, EmailStr, field_validator
from datetime import datetime
from typing import Optional

class CustomerBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr = Field(..., description="Customer unique email address")
    phone: str = Field(..., min_length=1, max_length=50)

    @field_validator('name', 'phone')
    def fields_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Field cannot be blank or whitespace')
        return v.strip()

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, min_length=1, max_length=50)

    @field_validator('name', 'phone')
    def fields_must_not_be_empty(cls, v):
        if v is not None:
            if not v.strip():
                raise ValueError('Field cannot be blank or whitespace')
            return v.strip()
        return v

class CustomerResponse(CustomerBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
