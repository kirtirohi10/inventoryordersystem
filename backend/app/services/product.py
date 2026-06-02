from sqlalchemy.orm import Session
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate
from fastapi import HTTPException, status
from typing import List, Optional

class ProductService:
    @staticmethod
    def get_all(db: Session) -> List[Product]:
        return db.query(Product).order_by(Product.name).all()

    @staticmethod
    def get_by_id(db: Session, product_id: int) -> Optional[Product]:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {product_id} not found"
            )
        return product

    @staticmethod
    def create(db: Session, product_in: ProductCreate) -> Product:
        # Check if SKU is unique
        existing_sku = db.query(Product).filter(Product.sku == product_in.sku).first()
        if existing_sku:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product with SKU '{product_in.sku}' already exists"
            )
        
        product = Product(
            name=product_in.name,
            sku=product_in.sku,
            price=product_in.price,
            stock_quantity=product_in.stock_quantity
        )
        db.add(product)
        db.commit()
        db.refresh(product)
        return product

    @staticmethod
    def update(db: Session, product_id: int, product_in: ProductUpdate) -> Product:
        product = ProductService.get_by_id(db, product_id)
        
        update_data = product_in.model_dump(exclude_unset=True)
        
        # Check SKU uniqueness if SKU is being updated
        if "sku" in update_data and update_data["sku"] != product.sku:
            existing_sku = db.query(Product).filter(Product.sku == update_data["sku"]).first()
            if existing_sku:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Product with SKU '{update_data['sku']}' already exists"
                )
        
        for key, value in update_data.items():
            setattr(product, key, value)
            
        db.commit()
        db.refresh(product)
        return product

    @staticmethod
    def delete(db: Session, product_id: int) -> None:
        product = ProductService.get_by_id(db, product_id)
        
        # Check if this product is part of any orders
        # If Cascade delete is block, check references
        try:
            db.delete(product)
            db.commit()
        except Exception:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot delete product '{product.name}' as it is referenced in existing orders."
            )
