# app/utils/dependencies.py

from fastapi import Depends, HTTPException
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.models import User, RoleEnum
from app.utils.db_utils import get_db
from app.config import SECRET_KEY, ALGORITHM
from app.utils.security import oauth2_scheme


# Dependency to get the current authenticated user
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user


# Dependency to enforce role-based access control
def require_role(required_roles: list[RoleEnum]):
    def role_dependency(current_user: User = Depends(get_current_user)):
        if current_user.role not in required_roles:
            raise HTTPException(
                status_code=403,
                detail=f"Access forbidden for role: {current_user.role}",
            )
        return current_user
    return role_dependency
