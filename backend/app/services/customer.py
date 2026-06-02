from sqlalchemy.orm import Session
from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerUpdate
from fastapi import HTTPException, status
from typing import List, Optional

class CustomerService:
    @staticmethod
    def get_all(db: Session) -> List[Customer]:
        return db.query(Customer).order_by(Customer.name).all()

    @staticmethod
    def get_by_id(db: Session, customer_id: int) -> Optional[Customer]:
        customer = db.query(Customer).filter(Customer.id == customer_id).first()
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Customer with ID {customer_id} not found"
            )
        return customer

    @staticmethod
    def create(db: Session, customer_in: CustomerCreate) -> Customer:
        # Check if email is unique
        existing_email = db.query(Customer).filter(Customer.email == customer_in.email).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Customer with email '{customer_in.email}' already exists"
            )
        
        customer = Customer(
            name=customer_in.name,
            email=customer_in.email,
            phone=customer_in.phone
        )
        db.add(customer)
        db.commit()
        db.refresh(customer)
        return customer

    @staticmethod
    def update(db: Session, customer_id: int, customer_in: CustomerUpdate) -> Customer:
        customer = CustomerService.get_by_id(db, customer_id)
        
        update_data = customer_in.model_dump(exclude_unset=True)
        
        # Check email uniqueness if it is being updated
        if "email" in update_data and update_data["email"] != customer.email:
            existing_email = db.query(Customer).filter(Customer.email == update_data["email"]).first()
            if existing_email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Customer with email '{update_data['email']}' already exists"
                )
        
        for key, value in update_data.items():
            setattr(customer, key, value)
            
        db.commit()
        db.refresh(customer)
        return customer

    @staticmethod
    def delete(db: Session, customer_id: int) -> None:
        customer = CustomerService.get_by_id(db, customer_id)
        
        # Safe check to make sure database integrity is not broken if RESTRICT foreign key constraint fails
        try:
            db.delete(customer)
            db.commit()
        except Exception:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot delete customer '{customer.name}' as they have active orders associated."
            )
