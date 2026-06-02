from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.schemas.inventory import InventorySummary, InventoryMetrics
from app.models.product import Product
from decimal import Decimal

router = APIRouter(prefix="/inventory", tags=["Inventory"])

@router.get("", response_model=InventorySummary)
def get_inventory_summary(db: Session = Depends(get_db)):
    # 1. Fetch total products
    total_products = db.query(Product).count()
    
    # 2. Fetch sum of stock quantities and total valuation
    # We do func.sum(Product.stock_quantity) and func.sum(Product.price * Product.stock_quantity)
    # Using coalesce to handle cases where there are no products
    stock_stats = db.query(
        func.coalesce(func.sum(Product.stock_quantity), 0),
        func.coalesce(func.sum(Product.price * Product.stock_quantity), 0.0)
    ).first()
    
    total_stock_units = stock_stats[0]
    total_valuation = Decimal(stock_stats[1])
    
    # 3. Low stock threshold is defined as stock_quantity < 10 (and stock_quantity > 0 to differentiate from out of stock)
    LOW_STOCK_THRESHOLD = 10
    
    low_stock_items = db.query(Product).filter(
        Product.stock_quantity > 0,
        Product.stock_quantity < LOW_STOCK_THRESHOLD
    ).order_by(Product.stock_quantity).all()
    
    out_of_stock_items = db.query(Product).filter(
        Product.stock_quantity == 0
    ).order_by(Product.name).all()
    
    metrics = InventoryMetrics(
        total_products=total_products,
        total_stock_units=total_stock_units,
        total_valuation=total_valuation,
        low_stock_count=len(low_stock_items),
        out_of_stock_count=len(out_of_stock_items)
    )
    
    return InventorySummary(
        metrics=metrics,
        low_stock_items=low_stock_items,
        out_of_stock_items=out_of_stock_items
    )
