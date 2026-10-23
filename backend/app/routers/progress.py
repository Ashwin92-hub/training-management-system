from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Course, Module, ModuleProgress, Certificate
from ..schemas import CourseProgressOut, ModuleProgressOut
from ..auth import get_current_user

router = APIRouter(prefix="/api/progress", tags=["progress"])

@router.get("/course/{course_id}", response_model=CourseProgressOut)
def get_course_progress(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    modules = db.query(Module).filter(Module.course_id == course_id).order_by(Module.order_index).all()
    if not modules:
        return {
            "course_id": course_id,
            "total_modules": 0,
            "completed_modules": 0,
            "overall_progress_pct": 0.0,
            "is_course_completed": False,
            "certificate_id": None,
            "modules": []
        }

    mod_ids = [m.id for m in modules]
    progress_records = db.query(ModuleProgress).filter(
        ModuleProgress.user_id == current_user.id,
        ModuleProgress.module_id.in_(mod_ids)
    ).all()

    prog_map = {p.module_id: p for p in progress_records}
    completed_count = sum(1 for p in progress_records if p.is_completed)

    module_progress_list = []
    for m in modules:
        p = prog_map.get(m.id)
        module_progress_list.append(ModuleProgressOut(
            module_id=m.id,
            is_completed=p.is_completed if p else False,
            score_pct=p.score_pct if p else 0.0
        ))

    overall_pct = round((completed_count / len(modules)) * 100.0, 1)
    is_completed = completed_count == len(modules)

    cert = db.query(Certificate).filter(
        Certificate.user_id == current_user.id,
        Certificate.course_id == course_id
    ).first()

    return {
        "course_id": course_id,
        "total_modules": len(modules),
        "completed_modules": completed_count,
        "overall_progress_pct": overall_pct,
        "is_course_completed": is_completed,
        "certificate_id": cert.id if cert else None,
        "modules": module_progress_list
    }
