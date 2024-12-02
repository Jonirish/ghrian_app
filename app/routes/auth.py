# app/routes/auth.py

from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from app.utils.dependencies import get_current_user, require_role
from app.schemas import SchoolCreate, SchoolOut, UserCreate, UserProfile
from app.models import RoleEnum, School, User, Photo
from app.utils.security import oauth2_scheme, pwd_context
from app.utils.db_utils import get_db
from datetime import timedelta
from app.config import ACCESS_TOKEN_EXPIRE_MINUTES
from app.utils.security import create_access_token
from fastapi.background import BackgroundTasks
from app.utils.notifications import send_email_to_admin

router = APIRouter()

@router.post("/register", response_model=dict)
def register_user(
    user: UserCreate,
    background_tasks: BackgroundTasks,  # Remove Depends() here
    db: Session = Depends(get_db)
):
    if user.role == RoleEnum.PRINCIPAL:
        selected_school = db.query(School).filter(School.id == user.school_id).first()
        if not selected_school:
            raise HTTPException(status_code=400, detail="Invalid school selected")
    
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = pwd_context.hash(user.password)
    new_user = User(
        email=user.email,
        hashed_password=hashed_password,
        role=user.role,
        school_id=user.school_id,
        status="PENDING"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Notify the Admin
    background_tasks.add_task(
        send_email_to_admin,
        subject="Principal Registration Pending Approval",
        message=f"New Principal registration for {user.email}. Please review and approve.",
    )

    return {"message": f"User registered successfully. Admin approval is required for activation."}


@router.post("/create-school", response_model=SchoolOut)
def create_school(
    school: SchoolCreate,
    current_user: User = Depends(require_role([RoleEnum.ADMIN])),
    db: Session = Depends(get_db)
):
    # Check if the school name is unique
    existing_school = db.query(School).filter(School.name == school.name).first()
    if existing_school:
        raise HTTPException(status_code=400, detail="School already exists")

    # Create the school
    new_school = School(name=school.name)
    db.add(new_school)
    db.commit()
    db.refresh(new_school)

    return new_school

@router.post("/login", response_model=dict)
def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == form_data.username).first()
    if not db_user or not pwd_context.verify(form_data.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": db_user.email, "role": db_user.role}, expires_delta=access_token_expires)

    return {
        "message": f"Welcome back, {db_user.email}!",
        "access_token": access_token,
        "token_type": "bearer",
    }

@router.get("/profile", response_model=UserProfile)
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    total_photos = db.query(Photo).filter(Photo.user_id == current_user.id).count()
    return {
        "email": current_user.email,
        "role": current_user.role,
        "total_photos": total_photos,
    }

@router.post("/create-staff", response_model=dict)
def create_staff(user: UserCreate, current_user: User = Depends(require_role([RoleEnum.PRINCIPAL])), db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = pwd_context.hash(user.password)
    new_user = User(email=user.email, hashed_password=hashed_password, role=RoleEnum.STAFF)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": f"{user.role.title()} account created for {new_user.email}"}

@router.get("/users", response_model=List[UserProfile])
def get_all_users(
    current_user: User = Depends(require_role([RoleEnum.ADMIN])),
    db: Session = Depends(get_db),
):
    users = db.query(User).all()
    return [
        {"email": user.email, "role": user.role, "total_photos": len(user.photos)}
        for user in users
    ]

@router.post("/create-parent", response_model=dict)
def create_parent(
    user: UserCreate,
    school_id: int,
    current_user: User = Depends(require_role([RoleEnum.PRINCIPAL, RoleEnum.STAFF])),
    db: Session = Depends(get_db)
):
    # Check if the email is already registered
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Check if the school exists
    school = db.query(School).filter(School.id == school_id).first()
    if not school:
        raise HTTPException(status_code=404, detail="School not found")

    # Hash the password for the new parent account
    hashed_password = pwd_context.hash(user.password)

    # Create the Parent user and associate with the school
    new_user = User(
        email=user.email,
        hashed_password=hashed_password,
        role=RoleEnum.PARENT,
        school_id=school.id  # Associate the Parent with the School
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": f"Parent account created for {new_user.email}, associated with school: {school.name}"}

@router.get("/available-schools", response_model=List[SchoolOut])
def get_available_schools(db: Session = Depends(get_db)):
    # Retrieve all schools from the database
    schools = db.query(School).all()
    return schools

@router.post("/approve-principal", response_model=UserProfile)
def approve_principal(
    principal_email: str,
    current_user = Depends(require_role([RoleEnum.ADMIN])),
    db: Session = Depends(get_db)
):
    # Check if the user exists
    principal = db.query(User).filter(User.email == principal_email, User.role == RoleEnum.PRINCIPAL).first()
    if not principal:
        raise HTTPException(status_code=404, detail="Principal not found or not a Principal")

    # Ensure the Principal is in PENDING status
    if principal.status != "PENDING":
        raise HTTPException(status_code=400, detail="Principal is not pending approval")

    # Approve the Principal
    principal.status = "ACTIVE"
    db.commit()
    db.refresh(principal)

    # Count the total photos uploaded by the Principal
    total_photos = db.query(Photo).filter(Photo.user_id == principal.id).count()

    return {
        "email": principal.email,
        "role": principal.role,
        "status": principal.status,
        "total_photos": total_photos,
    }