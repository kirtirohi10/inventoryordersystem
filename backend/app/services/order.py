from sqlalchemy.orm import Session, joinedload
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.models.customer import Customer
from app.schemas.order import OrderCreate
from fastapi import HTTPException, status
from typing import List, Optional
from decimal import Decimal

class OrderService:
    @staticmethod
    def get_all(db: Session) -> List[Order]:
        """
        Retrieves all orders.
        Eagerly loads the related customer and item associations, along with product details.
        """
        orders = db.query(Order)\
            .options(
                joinedload(Order.customer),
                joinedload(Order.items).joinedload(OrderItem.product)
            )\
            .order_by(Order.created_at.desc())\
            .all()

        # Calculate totals dynamically on retrieve for response matching
        for order in orders:
            order.total_price = sum(item.quantity * item.unit_price for item in order.items)
        return orders

    @staticmethod
    def get_by_id(db: Session, order_id: int) -> Optional[Order]:
        """
        Retrieves a single order by ID with details.
        """
        order = db.query(Order)\
            .options(
                joinedload(Order.customer),
                joinedload(Order.items).joinedload(OrderItem.product)
            )\
            .filter(Order.id == order_id)\
            .first()
            
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order with ID {order_id} not found"
            )
            
        order.total_price = sum(item.quantity * item.unit_price for item in order.items)
        return order

    @staticmethod
    def create(db: Session, order_in: OrderCreate) -> Order:
        """
        Processes order creation atomically in a database transaction block.
        Ensures customer exists, checks stock, deducts stock, and saves order.
        """
        # 1. Verify customer exists
        customer = db.query(Customer).filter(Customer.id == order_in.customer_id).first()
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot create order: Customer with ID {order_in.customer_id} does not exist"
            )

        # 2. Check for empty item list
        if not order_in.items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot create an empty order. Please include at least one item."
            )

        # Create Order record (uncommitted)
        db_order = Order(customer_id=order_in.customer_id)
        db.add(db_order)
        db.flush() # Flush to get db_order.id generated before creating order items

        try:
            order_items = []
            # 3. Process each item ordered
            for item in order_in.items:
                product = db.query(Product).filter(Product.id == item.product_id).with_for_update().first()
                if not product:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Product with ID {item.product_id} not found"
                    )

                # Validate stock availability
                if product.stock_quantity < item.quantity:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=(
                            f"Insufficient stock for '{product.name}' (SKU: {product.sku}). "
                            f"Requested: {item.quantity}, Available: {product.stock_quantity}."
                        )
                    )

                # Deduct stock quantity
                product.stock_quantity -= item.quantity
                
                # Create OrderItem
                db_item = OrderItem(
                    order_id=db_order.id,
                    product_id=product.id,
                    quantity=item.quantity,
                    unit_price=product.price
                )
                db.add(db_item)
                order_items.append(db_item)

            db.commit()
        except HTTPException as he:
            # Rollback transaction on business logic exception (e.g. stock shortfall)
            db.rollback()
            raise he
        except Exception as e:
            # Rollback transaction on database/generic exception
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error during order creation: {str(e)}"
            )

        # Retrieve order with eager-loaded attributes for response schema matching
        return OrderService.get_by_id(db, db_order.id)
