from pydantic import BaseModel, Field, field_validator
from decimal import Decimal
from datetime import datetime
from typing import Optional

class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Product Name")
    sku: str = Field(..., min_length=1, max_length=100, description="Unique Stock Keeping Unit ID")
    price: Decimal = Field(..., ge=0.0, description="Product price in local currency")
    stock_quantity: int = Field(..., ge=0, description="Current stock level")

    @field_validator('sku')
    def sku_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('SKU cannot be blank or whitespace')
        return v.strip().upper()

    @field_validator('name')
    def name_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Product name cannot be blank or whitespace')
        return v.strip()

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    sku: Optional[str] = Field(None, min_length=1, max_length=100)
    price: Optional[Decimal] = Field(None, ge=0.0)
    stock_quantity: Optional[int] = Field(None, ge=0)

    @field_validator('sku')
    def sku_must_not_be_empty(cls, v):
        if v is not None:
            if not v.strip():
                raise ValueError('SKU cannot be blank or whitespace')
            return v.strip().upper()
        return v

    @field_validator('name')
    def name_must_not_be_empty(cls, v):
        if v is not None:
            if not v.strip():
                raise ValueError('Product name cannot be blank or whitespace')
            return v.strip()
        return v

class ProductResponse(ProductBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
