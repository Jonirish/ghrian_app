# app/routes/photos.py

from fastapi import APIRouter, File, UploadFile, Form, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pathlib import Path
import shutil
from app.models import Photo, RoleEnum, User
from app.utils.dependencies import get_current_user, require_role
from app.utils.db_utils import get_db
from datetime import datetime
from typing import Optional
from app.utils.notifications import send_email_to_admin

router = APIRouter()

# Directory to store uploaded photos temporarily
UPLOAD_DIRECTORY = "uploads/"
Path(UPLOAD_DIRECTORY).mkdir(parents=True, exist_ok=True)

# Helper function for reviewing photos
def review_photo_helper(photo_id: int, decision: str, db: Session, notify: bool = False):
    valid_decisions = ["APPROVED", "REJECTED"]
    if decision not in valid_decisions:
        raise HTTPException(status_code=400, detail=f"Decision must be one of {valid_decisions}")

    # Fetch the photo
    photo = db.query(Photo).filter(Photo.id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")

    if photo.status != "PENDING":
        raise HTTPException(status_code=400, detail="Photo has already been reviewed")

    # Update status
    photo.status = decision
    db.commit()

    # Notify staff if required
    if notify:
        staff_member = db.query(User).filter(User.id == photo.user_id).first()
        if staff_member:
            subject = "Photo Review Outcome"
            message = f"Your photo '{photo.story}' has been {decision.lower()} by the principal."
            send_email_to_admin(subject, message)

    return {"message": f"Photo has been {decision.lower()}."}

@router.post("/upload", response_model=dict)
def upload_photo(
    file: UploadFile = File(...),
    story: str = Form(...),
    current_user=Depends(require_role([RoleEnum.STAFF, RoleEnum.PRINCIPAL])),
    db: Session = Depends(get_db)
):
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed.")

    # Ensure upload directory exists
    if not Path(UPLOAD_DIRECTORY).exists():
        Path(UPLOAD_DIRECTORY).mkdir(parents=True, exist_ok=True)

    # Save the file to the uploads directory
    file_path = Path(UPLOAD_DIRECTORY) / file.filename
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Save metadata to the database
    photo = Photo(user_id=current_user.id, file_path=str(file_path), story=story)
    db.add(photo)
    db.commit()
    db.refresh(photo)

    return {"message": "Photo uploaded successfully!", "photo_id": photo.id}

@router.get("/my-photos", response_model=list)
def get_my_photos(
    current_user=Depends(require_role([RoleEnum.STAFF, RoleEnum.PRINCIPAL, RoleEnum.ADMIN])),
    db: Session = Depends(get_db)
):
    photos = db.query(Photo).filter(Photo.user_id == current_user.id).all()
    return [{"id": photo.id, "file_path": photo.file_path, "story": photo.story} for photo in photos]

@router.post("/submit-photo", response_model=dict)
def submit_photo(
    file: UploadFile = File(...),
    story: str = Form(...),
    current_user: User = Depends(require_role([RoleEnum.STAFF])),
    db: Session = Depends(get_db),
):
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed.")

    # Save the file
    file_path = Path(UPLOAD_DIRECTORY) / file.filename
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Save to database
    photo = Photo(user_id=current_user.id, file_path=str(file_path), story=story, status="PENDING")
    db.add(photo)
    db.commit()
    db.refresh(photo)

    return {"message": "Photo submitted for approval!", "photo_id": photo.id}

# Review Photo (Approve or Reject)
@router.post("/review-photo", response_model=dict)
def review_photo(
    photo_id: int,
    decision: str,
    notify: bool = False,  # Optional parameter to toggle email notifications
    current_user: User = Depends(require_role([RoleEnum.PRINCIPAL])),
    db: Session = Depends(get_db),
):
    return review_photo_helper(photo_id=photo_id, decision=decision, db=db, notify=notify)

# Get Photos for Review (Pending Status)
@router.get("/photos-to-review", response_model=dict)
def get_photos_for_review(
    page: int = 1,
    limit: int = 10,
    current_user: User = Depends(require_role([RoleEnum.PRINCIPAL])),
    db: Session = Depends(get_db),
):
    offset = (page - 1) * limit
    photos = db.query(Photo).filter(Photo.status == "PENDING").offset(offset).limit(limit).all()
    total = db.query(Photo).filter(Photo.status == "PENDING").count()

    return {
        "photos": [
            {"id": photo.id, "file_path": photo.file_path, "story": photo.story, "created_at": photo.created_at}
            for photo in photos
        ],
        "total": total,
        "page": page,
        "limit": limit,
    }

@router.get("/view-photos", response_model=list)
def view_photos(
    current_user=Depends(require_role([RoleEnum.PARENT, RoleEnum.STAFF, RoleEnum.PRINCIPAL, RoleEnum.ADMIN])),
    db: Session = Depends(get_db)
):
    if current_user.role == RoleEnum.PARENT:
        # Parents can only view pre-authorized photos
        photos = db.query(Photo).filter(Photo.authorized_for_parent == True).all()
        if not photos:
            raise HTTPException(status_code=403, detail="No authorized photos available for viewing.")
    elif current_user.role in [RoleEnum.STAFF, RoleEnum.PRINCIPAL, RoleEnum.ADMIN]:
        # Staff, Principals, and Admins can view all photos
        photos = db.query(Photo).all()
    else:
        raise HTTPException(status_code=403, detail="Unauthorized access")

    return [{"id": photo.id, "file_path": photo.file_path, "story": photo.story} for photo in photos]
