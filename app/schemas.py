# app/schemas.py

from pydantic import BaseModel, EmailStr
from typing import List, Optional
from app.models import RoleEnum

# Schema for creating a new user
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: RoleEnum = RoleEnum.STAFF  # Default role is STAFF
    school_id: Optional[int] = None  # Required for PRINCIPAL

# Schema for displaying a user's profile
class UserProfile(BaseModel):
    email: str
    role: RoleEnum
    total_photos: int
    photos: Optional[List[str]] = []  # List of photo file paths uploaded by the user
    created_at: Optional[str] = None

# Schema for creating or displaying photos
class PhotoBase(BaseModel):
    file_path: str
    story: Optional[str] = "No story provided."

class PhotoCreate(PhotoBase):
    pass

class PhotoOut(PhotoBase):
    id: int

    class Config:
        orm_mode = True

class SchoolBase(BaseModel):
    name: str

class SchoolCreate(SchoolBase):
    pass

class SchoolOut(SchoolBase):
    id: int

    class Config:
        orm_mode = True
