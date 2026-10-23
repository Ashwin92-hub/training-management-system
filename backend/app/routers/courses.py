from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Course, Module, Enrollment
from ..schemas import CourseOut, CourseCreate, ModuleOut, ModuleCreate
from ..auth import get_current_user, require_role

router = APIRouter(prefix="/api/courses", tags=["courses"])

@router.get("", response_model=List[CourseOut])
def get_courses(
    search: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Course)
    if search:
        query = query.filter(Course.title.ilike(f"%{search}%") | Course.description.ilike(f"%{search}%"))
    if category and category != "All":
        query = query.filter(Course.category == category)
    
    courses = query.all()

    # If learner, filter or tag assigned status
    if current_user.role == "LEARNER":
        enrolled_course_ids = {e.course_id for e in db.query(Enrollment).filter(Enrollment.user_id == current_user.id).all()}
        # Show assigned courses + public courses
        # For full clarity, return all courses but front end will mark active enrollments
    return courses

@router.post("", response_model=CourseOut)
def create_course(
    course_in: CourseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "INSTRUCTOR"]))
):
    course = Course(
        title=course_in.title,
        description=course_in.description,
        category=course_in.category,
        thumbnail_url=course_in.thumbnail_url,
        instructor_id=current_user.id
    )
    db.add(course)
    db.commit()
    db.refresh(course)
    return course

@router.get("/{course_id}", response_model=CourseOut)
def get_course_detail(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@router.post("/{course_id}/modules", response_model=ModuleOut)
def add_module_to_course(
    course_id: int,
    module_in: ModuleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "INSTRUCTOR"]))
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    module = Module(
        course_id=course_id,
        title=module_in.title,
        description=module_in.description,
        content_type=module_in.content_type,
        content_body=module_in.content_body,
        video_url=module_in.video_url,
        order_index=module_in.order_index
    )
    db.add(module)
    db.commit()
    db.refresh(module)
    return module

@router.delete("/{course_id}")
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN"]))
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    db.delete(course)
    db.commit()
    return {"message": "Course deleted successfully"}
