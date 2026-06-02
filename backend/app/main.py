from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine
from app.models.base import Base
from app.api.router import api_router
import time

# Auto-create tables on startup (simplifies Docker container initialization)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Inventory & Order Management System API",
    description="Backend API for managing products, customers, orders, and stock levels.",
    version="1.0.0"
)

# CORS Configuration
# In production, specify allowed origins using environment variables
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production as needed (e.g. Vercel URL)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handlers for uniform error JSON formatting
@app.exception_handler(Exception)
def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "InternalServerError",
            "message": "An unexpected error occurred on the server.",
            "details": str(exc) if app.debug else None
        }
    )

# Welcome endpoint
@app.get("/", tags=["Root"])
def root_index():
    return {
        "message": "Welcome to the Inventory & Order Management System API!",
        "documentation": "/docs",
        "health": "/health"
    }

# Health Check endpoint
@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "database": "connected" # If startup didn't fail, db engine is initialized
    }

# Mount the router under /api prefix
app.include_router(api_router, prefix="/api")
