from sqlalchemy import Column, Integer, String, Numeric, DateTime, CheckConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    sku = Column(String(100), unique=True, index=True, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    stock_quantity = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    order_items = relationship("OrderItem", back_populates="product", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint('stock_quantity >= 0', name='check_stock_positive'),
        CheckConstraint('price >= 0.0', name='check_price_positive'),
    )
