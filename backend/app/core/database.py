from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# Create SQLAlchemy Database Engine
engine = create_engine(
    settings.DATABASE_URL,
    # pool_pre_ping checks connections to prevent working with stale connections
    pool_pre_ping=True
)

# Create SessionLocal class for database transactions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for database models
Base = declarative_base()

def get_db():
    """
    Dependency to yield database sessions.
    Automatically closes the session after request lifecycle is complete.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
