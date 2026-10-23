from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: int
    name: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# User Schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str = "LEARNER"

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Option Schemas
class QuestionOptionBase(BaseModel):
    option_text: str
    is_correct: bool = False

class QuestionOptionCreate(QuestionOptionBase):
    pass

class QuestionOptionOut(QuestionOptionBase):
    id: int

    class Config:
        from_attributes = True

# Question Schemas
class QuestionBase(BaseModel):
    question_text: str
    explanation: Optional[str] = None
    points: int = 10

class QuestionCreate(QuestionBase):
    options: List[QuestionOptionCreate]

class QuestionOut(QuestionBase):
    id: int
    options: List[QuestionOptionOut]

    class Config:
        from_attributes = True

# Quiz Schemas
class QuizBase(BaseModel):
    title: str
    passing_score_pct: float = 70.0
    max_attempts: int = 5

class QuizCreate(QuizBase):
    module_id: int
    questions: List[QuestionCreate]

class QuizOut(QuizBase):
    id: int
    module_id: int
    questions: List[QuestionOut]

    class Config:
        from_attributes = True

# Module Schemas
class ModuleBase(BaseModel):
    title: str
    description: Optional[str] = None
    content_type: str = "TEXT"
    content_body: Optional[str] = None
    video_url: Optional[str] = None
    order_index: int = 1

class ModuleCreate(ModuleBase):
    pass

class ModuleOut(ModuleBase):
    id: int
    course_id: int
    quiz: Optional[QuizOut] = None

    class Config:
        from_attributes = True

# Course Schemas
class CourseBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: str = "General"
    thumbnail_url: Optional[str] = None

class CourseCreate(CourseBase):
    pass

class CourseOut(CourseBase):
    id: int
    instructor_id: Optional[int] = None
    created_at: datetime
    modules: List[ModuleOut] = []

    class Config:
        from_attributes = True

# Quiz Submission
class AnswerSubmit(BaseModel):
    question_id: int
    selected_option_id: int

class QuizSubmit(BaseModel):
    quiz_id: int
    answers: List[AnswerSubmit]

class QuizResultOut(BaseModel):
    attempt_id: int
    score_pct: float
    is_passed: bool
    passing_score_pct: float
    total_questions: int
    correct_count: int
    answers_review: List[dict]

# Progress & Certificate
class ModuleProgressOut(BaseModel):
    module_id: int
    is_completed: bool
    score_pct: float

    class Config:
        from_attributes = True

class CourseProgressOut(BaseModel):
    course_id: int
    total_modules: int
    completed_modules: int
    overall_progress_pct: float
    is_course_completed: bool
    certificate_id: Optional[str] = None
    modules: List[ModuleProgressOut]

class CertificateOut(BaseModel):
    id: str
    participant_name: str
    course_name: str
    issue_date: datetime
    final_score: float
    verification_code: str

    class Config:
        from_attributes = True

class AssignCourseRequest(BaseModel):
    user_id: int
    course_id: int
