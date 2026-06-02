from pydantic import BaseModel
from decimal import Decimal
from typing import List
from app.schemas.product import ProductResponse

class InventoryMetrics(BaseModel):
    total_products: int
    total_stock_units: int
    total_valuation: Decimal
    low_stock_count: int
    out_of_stock_count: int

class InventorySummary(BaseModel):
    metrics: InventoryMetrics
    low_stock_items: List[ProductResponse]
    out_of_stock_items: List[ProductResponse]
