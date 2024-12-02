# app/utils/security.py

from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from app.config import SECRET_KEY, ALGORITHM

# Define OAuth2PasswordBearer with the correct token URL
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# Define password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Utility function to verify passwords
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Utility function to hash passwords
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# Utility function to create a JWT access token
def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

