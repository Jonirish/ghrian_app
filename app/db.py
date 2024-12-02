# app/db.py

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()
# Database URL
SQLALCHEMY_DATABASE_URL = os.getenv("SQLALCHEMY_DATABASE_URL")

# Create the database engine with error handling
try:
    engine = create_engine(SQLALCHEMY_DATABASE_URL, echo=True)  # Set echo=False in production

    print("Database engine created successfully!")
except Exception as e:
    print(f"Error creating engine: {e}")
    raise

# Create the session factory with error handling
try:
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    print("SessionLocal created successfully!")
except Exception as e:
    print(f"Error creating session factory: {e}")
    raise

# Base class for ORM models
Base = declarative_base()

# Test database connection
def test_connection():
    try:
        with engine.connect() as connection:
            print("Database connection successful! You can now perform database operations.")
    except Exception as e:
        print(f"Database connection failed: {e}")
        raise

