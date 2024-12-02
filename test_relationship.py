# test_relationship.py

from app.db import SessionLocal
from app.models import User, Photo

db = SessionLocal()

user = db.query(User).filter(User.email == "testuser@example.com").first()
if user:
    print(f"User: {user.email}, Role: {user.role}, Created At: {user.created_at}")
    if user.photos:
        print(f"Photos: {user.photos}")
    else:
        print("No photos uploaded by this user.")
else:
    print("User not found.")