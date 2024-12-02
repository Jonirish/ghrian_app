# app/utils/db_utils.py

from sqlalchemy.orm import Session
from app.db import SessionLocal
from typing import Generator

# Dependency to get the database session
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        print(f"Database error: {e}")
        raise
    finally:
        db.close()

