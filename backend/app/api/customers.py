from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerResponse
from app.services.customer import CustomerService

router = APIRouter(prefix="/customers", tags=["Customers"])

@router.get("", response_model=List[CustomerResponse])
def get_customers(db: Session = Depends(get_db)):
    return CustomerService.get_all(db)

@router.get("/{id}", response_model=CustomerResponse)
def get_customer(id: int, db: Session = Depends(get_db)):
    return CustomerService.get_by_id(db, id)

@router.post("", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(customer_in: CustomerCreate, db: Session = Depends(get_db)):
    return CustomerService.create(db, customer_in)

@router.put("/{id}", response_model=CustomerResponse)
def update_customer(id: int, customer_in: CustomerUpdate, db: Session = Depends(get_db)):
    return CustomerService.update(db, id, customer_in)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(id: int, db: Session = Depends(get_db)):
    CustomerService.delete(db, id)
    return None
