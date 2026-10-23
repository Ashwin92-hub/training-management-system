from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Course, Module, Enrollment, QuizAttempt, Certificate
from ..auth import require_role

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "INSTRUCTOR"]))
):
    total_users = db.query(User).count()
    learners_count = db.query(User).filter(User.role == "LEARNER").count()
    total_courses = db.query(Course).count()
    total_modules = db.query(Module).count()
    total_enrollments = db.query(Enrollment).count()
    total_certificates = db.query(Certificate).count()
    
    attempts = db.query(QuizAttempt).all()
    total_attempts = len(attempts)
    passed_attempts = sum(1 for a in attempts if a.is_passed)
    pass_rate = round((passed_attempts / total_attempts * 100.0), 1) if total_attempts > 0 else 0.0

    # User enrollment details list
    enrollments_data = []
    enrollments = db.query(Enrollment).limit(10).all()
    for e in enrollments:
        enrollments_data.append({
            "id": e.id,
            "user_name": e.user.name,
            "user_email": e.user.email,
            "course_title": e.course.title,
            "enrolled_at": e.enrolled_at
        })

    # Recent Certificates Issued
    recent_certs = []
    certs = db.query(Certificate).order_by(Certificate.issue_date.desc()).limit(5).all()
    for c in certs:
        recent_certs.append({
            "certificate_id": c.id,
            "user_name": c.user.name,
            "course_title": c.course.title,
            "final_score": c.final_score,
            "issue_date": c.issue_date
        })

    return {
        "total_users": total_users,
        "learners_count": learners_count,
        "total_courses": total_courses,
        "total_modules": total_modules,
        "total_enrollments": total_enrollments,
        "total_certificates": total_certificates,
        "total_quiz_attempts": total_attempts,
        "quiz_pass_rate_pct": pass_rate,
        "recent_enrollments": enrollments_data,
        "recent_certificates": recent_certs
    }
