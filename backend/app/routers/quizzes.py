import json
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Module, Quiz, Question, QuestionOption, QuizAttempt, ModuleProgress, Certificate, Course
from ..schemas import QuizCreate, QuizOut, QuizSubmit, QuizResultOut
from ..auth import get_current_user, require_role

router = APIRouter(prefix="/api/quizzes", tags=["quizzes"])

@router.post("", response_model=QuizOut)
def create_quiz(
    quiz_in: QuizCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["ADMIN", "INSTRUCTOR"]))
):
    module = db.query(Module).filter(Module.id == quiz_in.module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    existing = db.query(Quiz).filter(Quiz.module_id == quiz_in.module_id).first()
    if existing:
        db.delete(existing)
        db.commit()

    quiz = Quiz(
        module_id=quiz_in.module_id,
        title=quiz_in.title,
        passing_score_pct=quiz_in.passing_score_pct,
        max_attempts=quiz_in.max_attempts
    )
    db.add(quiz)
    db.commit()
    db.refresh(quiz)

    for q_data in quiz_in.questions:
        q = Question(
            quiz_id=quiz.id,
            question_text=q_data.question_text,
            explanation=q_data.explanation,
            points=q_data.points
        )
        db.add(q)
        db.commit()
        db.refresh(q)

        for opt_data in q_data.options:
            opt = QuestionOption(
                question_id=q.id,
                option_text=opt_data.option_text,
                is_correct=opt_data.is_correct
            )
            db.add(opt)
        db.commit()

    db.refresh(quiz)
    return quiz

@router.get("/module/{module_id}", response_model=QuizOut)
def get_quiz_by_module(
    module_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    quiz = db.query(Quiz).filter(Quiz.module_id == module_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="No quiz found for this module")
    return quiz

@router.post("/submit", response_model=QuizResultOut)
def submit_quiz(
    sub: QuizSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    quiz = db.query(Quiz).filter(Quiz.id == sub.quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    questions = db.query(Question).filter(Question.quiz_id == quiz.id).all()
    if not questions:
        raise HTTPException(status_code=400, detail="Quiz has no questions")

    user_answers_map = {ans.question_id: ans.selected_option_id for ans in sub.answers}
    
    total_score = 0.0
    max_possible_score = 0.0
    correct_count = 0
    answers_review = []

    for q in questions:
        max_possible_score += q.points
        user_selected_opt_id = user_answers_map.get(q.id)
        
        correct_option = next((opt for opt in q.options if opt.is_correct), None)
        user_option = next((opt for opt in q.options if opt.id == user_selected_opt_id), None)

        is_correct = (user_option and user_option.is_correct)
        if is_correct:
            total_score += q.points
            correct_count += 1

        answers_review.append({
            "question_id": q.id,
            "question_text": q.question_text,
            "selected_option_id": user_selected_opt_id,
            "selected_option_text": user_option.option_text if user_option else "None",
            "correct_option_id": correct_option.id if correct_option else None,
            "correct_option_text": correct_option.option_text if correct_option else "None",
            "is_correct": is_correct,
            "explanation": q.explanation
        })

    score_pct = round((total_score / max_possible_score) * 100.0, 1) if max_possible_score > 0 else 0.0
    is_passed = score_pct >= quiz.passing_score_pct

    # Record Attempt
    attempt = QuizAttempt(
        user_id=current_user.id,
        quiz_id=quiz.id,
        score_pct=score_pct,
        is_passed=is_passed,
        answers_json=json.dumps(user_answers_map)
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    # If passed, update ModuleProgress
    if is_passed:
        prog = db.query(ModuleProgress).filter(
            ModuleProgress.user_id == current_user.id,
            ModuleProgress.module_id == quiz.module_id
        ).first()

        if not prog:
            prog = ModuleProgress(
                user_id=current_user.id,
                module_id=quiz.module_id,
                is_completed=True,
                score_pct=score_pct,
                completed_at=datetime.datetime.utcnow()
            )
            db.add(prog)
        else:
            prog.is_completed = True
            prog.score_pct = max(prog.score_pct, score_pct)
            prog.completed_at = datetime.datetime.utcnow()
        db.commit()

        # Check if course is 100% completed to generate certificate automatically!
        module = db.query(Module).filter(Module.id == quiz.module_id).first()
        if module:
            course = db.query(Course).filter(Course.id == module.course_id).first()
            all_course_modules = db.query(Module).filter(Module.course_id == course.id).all()
            all_module_ids = [m.id for m in all_course_modules]

            completed_progs = db.query(ModuleProgress).filter(
                ModuleProgress.user_id == current_user.id,
                ModuleProgress.module_id.in_(all_module_ids),
                ModuleProgress.is_completed == True
            ).all()

            if len(completed_progs) == len(all_course_modules):
                # Calculate average score
                avg_score = round(sum(p.score_pct for p in completed_progs) / len(completed_progs), 1)
                existing_cert = db.query(Certificate).filter(
                    Certificate.user_id == current_user.id,
                    Certificate.course_id == course.id
                ).first()
                if not existing_cert:
                    cert = Certificate(
                        user_id=current_user.id,
                        course_id=course.id,
                        final_score=avg_score,
                        verification_code=f"VERIFY-{current_user.id}-{course.id}-{int(datetime.datetime.utcnow().timestamp())}"
                    )
                    db.add(cert)
                    db.commit()

    return {
        "attempt_id": attempt.id,
        "score_pct": score_pct,
        "is_passed": is_passed,
        "passing_score_pct": quiz.passing_score_pct,
        "total_questions": len(questions),
        "correct_count": correct_count,
        "answers_review": answers_review
    }
