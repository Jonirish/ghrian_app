# init_db.py

from app.db import Base, engine
from app.models import User, Photo, School

print("Creating database tables...")
Base.metadata.create_all(bind=engine)
print("Tables created successfully!")

