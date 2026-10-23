from sqlalchemy.orm import Session
from .database import engine, Base, SessionLocal
from .models import User, Course, Module, Quiz, Question, QuestionOption, Enrollment
from .auth import get_password_hash

def seed_data():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Create Default Users if not existing
        admin = db.query(User).filter(User.email == "admin@lms.com").first()
        if not admin:
            admin = User(
                name="System Administrator",
                email="admin@lms.com",
                hashed_password=get_password_hash("admin123"),
                role="ADMIN"
            )
            db.add(admin)

        instructor = db.query(User).filter(User.email == "instructor@lms.com").first()
        if not instructor:
            instructor = User(
                name="Prof. Sarah Jenkins",
                email="instructor@lms.com",
                hashed_password=get_password_hash("instructor123"),
                role="INSTRUCTOR"
            )
            db.add(instructor)

        learner = db.query(User).filter(User.email == "learner@lms.com").first()
        if not learner:
            learner = User(
                name="Alex Rivera",
                email="learner@lms.com",
                hashed_password=get_password_hash("learner123"),
                role="LEARNER"
            )
            db.add(learner)

        db.commit()
        db.refresh(admin)
        db.refresh(instructor)
        db.refresh(learner)

        # 2. Check if courses already seeded
        if db.query(Course).count() > 0:
            print("Database already contains courses.")
            return

        # Course 1: Full-Stack Web Development
        course1 = Course(
            title="Full-Stack Web Development BootCamp",
            description="Master modern web app development with React, FastAPI, and Postgres database integration.",
            category="Software Engineering",
            instructor_id=instructor.id,
            thumbnail_url="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80"
        )
        db.add(course1)
        db.commit()
        db.refresh(course1)

        # Course 1 - Module 1
        m1 = Module(
            course_id=course1.id,
            title="1. Modern Frontend Architecture with React",
            description="Understand React components, state hooks, props, and modern JSX UI rendering patterns.",
            content_type="TEXT",
            content_body="""# Welcome to Modern Frontend Architecture

React is a powerful library for building interactive user interfaces based on components.

## Core Concepts
1. **Components**: Declarative, reusable UI building blocks.
2. **State & Hooks**: Functional state management using `useState`, `useEffect`, and `useContext`.
3. **Virtual DOM**: High-performance DOM reconciliation for instant UI updates.

```jsx
function Greeting({ name }) {
  return <h1>Hello, {name}! Welcome to LMS Training.</h1>;
}
```

### Best Practices
- Keep components small and single-purpose.
- Prefer controlled UI components for forms.
- Use CSS variable tokens for clean design systems.
""",
            video_url="https://www.youtube.com/embed/SqcY0GlETPk",
            order_index=1
        )
        db.add(m1)
        db.commit()
        db.refresh(m1)

        # Quiz for Module 1
        q1 = Quiz(
            module_id=m1.id,
            title="React Fundamentals Quiz",
            passing_score_pct=70.0,
            max_attempts=5
        )
        db.add(q1)
        db.commit()
        db.refresh(q1)

        quest1 = Question(
            quiz_id=q1.id,
            question_text="What hook is used in React to manage state inside functional components?",
            explanation="`useState` is the primary React Hook for adding local component state.",
            points=10
        )
        db.add(quest1)
        db.commit()
        db.refresh(quest1)

        db.add_all([
            QuestionOption(question_id=quest1.id, option_text="useEffect()", is_correct=False),
            QuestionOption(question_id=quest1.id, option_text="useState()", is_correct=True),
            QuestionOption(question_id=quest1.id, option_text="useContext()", is_correct=False),
            QuestionOption(question_id=quest1.id, option_text="useReducer()", is_correct=False)
        ])

        quest2 = Question(
            quiz_id=q1.id,
            question_text="Which tool is typically used to bundle modern Vite React applications?",
            explanation="Vite uses ESBuild for fast development bundling and Rollup for production builds.",
            points=10
        )
        db.add(quest2)
        db.commit()
        db.refresh(quest2)

        db.add_all([
            QuestionOption(question_id=quest2.id, option_text="Webpack 1", is_correct=False),
            QuestionOption(question_id=quest2.id, option_text="ESBuild / Rollup via Vite", is_correct=True),
            QuestionOption(question_id=quest2.id, option_text="Gulp", is_correct=False),
            QuestionOption(question_id=quest2.id, option_text="Babel standalone", is_correct=False)
        ])
        db.commit()

        # Course 1 - Module 2
        m2 = Module(
            course_id=course1.id,
            title="2. Backend APIs with Python & FastAPI",
            description="Learn async route handlers, dependency injection, and Pydantic validation schemas.",
            content_type="VIDEO",
            content_body="""# FastAPI Framework Essentials

FastAPI is a modern, fast (high-performance), web framework for building APIs with Python 3.8+ based on standard Python type hints.

## Key Features
- **Fast**: Very high performance, on par with NodeJS and Go.
- **Automatic Docs**: Interactive Swagger UI auto-generated at `/docs`.
- **Validation**: Strict schema validation powered by Pydantic.

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}
```
""",
            video_url="https://www.youtube.com/embed/GN6ICac3OXY",
            order_index=2
        )
        db.add(m2)
        db.commit()
        db.refresh(m2)

        # Quiz for Module 2
        q2 = Quiz(
            module_id=m2.id,
            title="FastAPI & REST APIs Quiz",
            passing_score_pct=70.0,
            max_attempts=5
        )
        db.add(q2)
        db.commit()
        db.refresh(q2)

        quest3 = Question(
            quiz_id=q2.id,
            question_text="What library provides schema validation and serialization in FastAPI?",
            explanation="FastAPI relies heavily on Pydantic for data validation and parsing.",
            points=10
        )
        db.add(quest3)
        db.commit()
        db.refresh(quest3)

        db.add_all([
            QuestionOption(question_id=quest3.id, option_text="Pydantic", is_correct=True),
            QuestionOption(question_id=quest3.id, option_text="Marshmallow", is_correct=False),
            QuestionOption(question_id=quest3.id, option_text="Django ORM", is_correct=False),
            QuestionOption(question_id=quest3.id, option_text="Cerberus", is_correct=False)
        ])
        db.commit()

        # Course 2: Cloud Architecture & DevOps
        course2 = Course(
            title="Cloud Architecture & DevOps Masterclass",
            description="Containerize applications using Docker and orchestrate microservices with Kubernetes.",
            category="Cloud Computing",
            instructor_id=instructor.id,
            thumbnail_url="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80"
        )
        db.add(course2)
        db.commit()
        db.refresh(course2)

        m3 = Module(
            course_id=course2.id,
            title="1. Docker Fundamentals & Multi-Stage Builds",
            description="Understand Docker containers, images, Dockerfiles, and multi-stage build optimization.",
            content_type="TEXT",
            content_body="""# Docker Containerization

Containers allow developers to package an application with all of its parts, such as libraries and dependencies, and deploy it as one package.

## Dockerfile Example
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```
""",
            video_url="https://www.youtube.com/embed/gAkwW2tuIqE",
            order_index=1
        )
        db.add(m3)
        db.commit()
        db.refresh(m3)

        q3 = Quiz(
            module_id=m3.id,
            title="Docker Basics Quiz",
            passing_score_pct=70.0,
            max_attempts=5
        )
        db.add(q3)
        db.commit()
        db.refresh(q3)

        quest4 = Question(
            quiz_id=q3.id,
            question_text="Which Docker command builds an image from a Dockerfile?",
            explanation="`docker build -t <name> .` compiles a Dockerfile into an executable container image.",
            points=10
        )
        db.add(quest4)
        db.commit()
        db.refresh(quest4)

        db.add_all([
            QuestionOption(question_id=quest4.id, option_text="docker run", is_correct=False),
            QuestionOption(question_id=quest4.id, option_text="docker build", is_correct=True),
            QuestionOption(question_id=quest4.id, option_text="docker compile", is_correct=False),
            QuestionOption(question_id=quest4.id, option_text="docker compose up", is_correct=False)
        ])
        db.commit()

        # Enroll learner into Course 1 & Course 2
        e1 = Enrollment(user_id=learner.id, course_id=course1.id, assigned_by_id=admin.id)
        e2 = Enrollment(user_id=learner.id, course_id=course2.id, assigned_by_id=admin.id)
        db.add_all([e1, e2])
        db.commit()

        print("Database successfully seeded with demo users, courses, modules, and quizzes.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
