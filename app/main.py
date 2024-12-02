# app/main.py

from fastapi import FastAPI
from app.db import Base, engine, test_connection
from app.routes import auth, photos
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

app = FastAPI()

# Mount the 'uploads' directory
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow requests from your React app
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all HTTP headers
)

# Initialize the database
Base.metadata.create_all(bind=engine)

# Test the database connection
test_connection()

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(photos.router, prefix="/photos", tags=["Photos"])