from pydantic import BaseModel, Field
from decimal import Decimal
from datetime import datetime
from typing import List
from app.schemas.customer import CustomerResponse
from app.schemas.product import ProductResponse

class OrderItemCreate(BaseModel):
    product_id: int = Field(..., ge=1, description="ID of the product to order")
    quantity: int = Field(..., ge=1, description="Quantity to purchase")

class OrderCreate(BaseModel):
    customer_id: int = Field(..., ge=1, description="ID of the purchasing customer")
    items: List[OrderItemCreate] = Field(..., min_length=1, description="List of products and quantities in the order")

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: Decimal
    product: ProductResponse  # Includes product details

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: int
    customer_id: int
    created_at: datetime
    customer: CustomerResponse  # Includes customer details
    items: List[OrderItemResponse]
    total_price: Decimal

    class Config:
        from_attributes = True
