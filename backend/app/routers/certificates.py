import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Course, Module, ModuleProgress, Certificate
from ..schemas import CertificateOut
from ..auth import get_current_user

router = APIRouter(prefix="/api/certificates", tags=["certificates"])

@router.get("/user", response_model=List[CertificateOut])
def get_user_certificates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    certs = db.query(Certificate).filter(Certificate.user_id == current_user.id).all()
    result = []
    for c in certs:
        result.append(CertificateOut(
            id=c.id,
            participant_name=c.user.name,
            course_name=c.course.title,
            issue_date=c.issue_date,
            final_score=c.final_score,
            verification_code=c.verification_code
        ))
    return result

@router.get("/{cert_id}", response_model=CertificateOut)
def get_certificate_by_id(
    cert_id: str,
    db: Session = Depends(get_db)
):
    cert = db.query(Certificate).filter(Certificate.id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
    
    return CertificateOut(
        id=cert.id,
        participant_name=cert.user.name,
        course_name=cert.course.title,
        issue_date=cert.issue_date,
        final_score=cert.final_score,
        verification_code=cert.verification_code
    )

@router.post("/generate/{course_id}", response_model=CertificateOut)
def generate_certificate_for_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    modules = db.query(Module).filter(Module.course_id == course_id).all()
    if not modules:
        raise HTTPException(status_code=400, detail="Course has no modules")

    mod_ids = [m.id for m in modules]
    progresses = db.query(ModuleProgress).filter(
        ModuleProgress.user_id == current_user.id,
        ModuleProgress.module_id.in_(mod_ids),
        ModuleProgress.is_completed == True
    ).all()

    if len(progresses) < len(modules):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot generate certificate. You have completed {len(progresses)} of {len(modules)} modules."
        )

    avg_score = round(sum(p.score_pct for p in progresses) / len(progresses), 1)

    existing = db.query(Certificate).filter(
        Certificate.user_id == current_user.id,
        Certificate.course_id == course_id
    ).first()

    if existing:
        return CertificateOut(
            id=existing.id,
            participant_name=current_user.name,
            course_name=course.title,
            issue_date=existing.issue_date,
            final_score=existing.final_score,
            verification_code=existing.verification_code
        )

    cert = Certificate(
        user_id=current_user.id,
        course_id=course_id,
        final_score=avg_score,
        verification_code=f"VERIFY-{current_user.id}-{course_id}-{int(datetime.datetime.utcnow().timestamp())}"
    )
    db.add(cert)
    db.commit()
    db.refresh(cert)

    return CertificateOut(
        id=cert.id,
        participant_name=current_user.name,
        course_name=course.title,
        issue_date=cert.issue_date,
        final_score=cert.final_score,
        verification_code=cert.verification_code
    )
