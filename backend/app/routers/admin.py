from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Course, Enrollment
from ..schemas import UserOut, UserCreate, AssignCourseRequest
from ..auth import get_current_user, require_role, get_password_hash

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.get("/users", response_model=List[UserOut])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "INSTRUCTOR"]))
):
    return db.query(User).all()

@router.post("/users", response_model=UserOut)
def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User email already exists")
    
    user = User(
        name=user_in.name,
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role.upper()
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/assign-course")
def assign_course(
    req: AssignCourseRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "INSTRUCTOR"]))
):
    user = db.query(User).filter(User.id == req.user_id).first()
    if not user:
        raise HTTPException(status_code=4404, detail="User not found")
    
    course = db.query(Course).filter(Course.id == req.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    existing = db.query(Enrollment).filter(
        Enrollment.user_id == req.user_id,
        Enrollment.course_id == req.course_id
    ).first()

    if existing:
        return {"message": "User is already enrolled in this course"}
    
    enrollment = Enrollment(
        user_id=req.user_id,
        course_id=req.course_id,
        assigned_by_id=current_user.id
    )
    db.add(enrollment)
    db.commit()

    return {"message": f"Successfully assigned '{course.title}' to {user.name}"}
