from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models import RoleEnum, School, User
from app.schemas import SchoolCreate, SchoolOut
from app.utils.db_utils import get_db
from app.utils.dependencies import require_role

router = APIRouter()

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

