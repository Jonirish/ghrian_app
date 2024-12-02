# app/models.py

from enum import Enum
from sqlalchemy import Column, Integer, String, ForeignKey, Enum as SQLAlchemyEnum, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db import Base

# Define RoleEnum as a string-based Enum for SQLAlchemy and FastAPI
class RoleEnum(str, Enum):
    ADMIN = "ADMIN"
    PRINCIPAL = "PRINCIPAL"
    STAFF = "STAFF"
    PARENT = "PARENT"

# School model
class School(Base):
    __tablename__ = "schools"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now())  # Auto-set timestamp

    # Relationships
    users = relationship("User", back_populates="school")

class UserStatus(str, Enum):
    PENDING = "PENDING"
    ACTIVE = "ACTIVE"
    REJECTED = "REJECTED"
    
# User model
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(SQLAlchemyEnum(RoleEnum), nullable=False, default=RoleEnum.STAFF)
    status = Column(String, nullable=False, default="PENDING")  # e.g., PENDING, ACTIVE
    school_id = Column(Integer, ForeignKey("schools.id"), nullable=True)  # New field
    created_at = Column(DateTime, server_default=func.now())  # Auto-set timestamp

    # Relationship with School
    school = relationship("School", back_populates="users")

    # Relationship with Photos
    photos = relationship("Photo", back_populates="user")

# Define the PhotoStatusEnum
class PhotoStatusEnum(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

# Photo model
class Photo(Base):
    __tablename__ = "photos"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_path = Column(String, nullable=False)
    story = Column(String, nullable=True, default="No story provided.")
    created_at = Column(DateTime, server_default=func.now())
    school_id = Column(Integer, ForeignKey("schools.id"), nullable=True)
    status = Column(SQLAlchemyEnum(PhotoStatusEnum), default=PhotoStatusEnum.PENDING, nullable=False)

    # Relationship with User
    user = relationship("User", back_populates="photos")


