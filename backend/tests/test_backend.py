import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app

TEST_DB_URL = "sqlite:///./test_lms.db"
engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True, scope="module")
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    engine.dispose()
    if os.path.exists("./test_lms.db"):
        try:
            os.remove("./test_lms.db")
        except Exception:
            pass

client = TestClient(app)

@pytest.fixture(scope="module")
def admin_token():
    reg_resp = client.post("/api/auth/register", json={
        "name": "Suite Admin",
        "email": "suiteadmin@test.com",
        "password": "password123",
        "role": "ADMIN"
    })
    assert reg_resp.status_code == 200

    login_resp = client.post("/api/auth/login", data={
        "username": "suiteadmin@test.com",
        "password": "password123"
    })
    assert login_resp.status_code == 200
    return login_resp.json()["access_token"]

def test_user_registration_and_login():
    reg_resp = client.post("/api/auth/register", json={
        "name": "Test Learner",
        "email": "testlearner@test.com",
        "password": "password123",
        "role": "LEARNER"
    })
    assert reg_resp.status_code == 200
    assert reg_resp.json()["email"] == "testlearner@test.com"

    login_resp = client.post("/api/auth/login", data={
        "username": "testlearner@test.com",
        "password": "password123"
    })
    assert login_resp.status_code == 200
    assert login_resp.json()["role"] == "LEARNER"

def test_course_and_quiz_flow(admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Create Course
    course_resp = client.post("/api/courses", headers=headers, json={
        "title": "Python Testing Course",
        "description": "Learn Pytest",
        "category": "Testing"
    })
    assert course_resp.status_code == 200
    course_id = course_resp.json()["id"]

    # 2. Add Module
    mod_resp = client.post(f"/api/courses/{course_id}/modules", headers=headers, json={
        "title": "Module 1: Intro to Pytest",
        "description": "Pytest basics",
        "content_type": "TEXT",
        "content_body": "Pytest is great",
        "order_index": 1
    })
    assert mod_resp.status_code == 200
    module_id = mod_resp.json()["id"]

    # 3. Create Quiz for Module
    quiz_resp = client.post("/api/quizzes", headers=headers, json={
        "module_id": module_id,
        "title": "Pytest Quiz",
        "passing_score_pct": 50.0,
        "max_attempts": 3,
        "questions": [
            {
                "question_text": "What tool runs Pytest tests?",
                "explanation": "Command line pytest",
                "points": 10,
                "options": [
                    {"option_text": "pytest command", "is_correct": True},
                    {"option_text": "npm test", "is_correct": False}
                ]
            }
        ]
    })
    assert quiz_resp.status_code == 200
    quiz_id = quiz_resp.json()["id"]
    question_id = quiz_resp.json()["questions"][0]["id"]
    correct_opt_id = quiz_resp.json()["questions"][0]["options"][0]["id"]

    # 4. Submit Correct Quiz Answer
    submit_resp = client.post("/api/quizzes/submit", headers=headers, json={
        "quiz_id": quiz_id,
        "answers": [
            {"question_id": question_id, "selected_option_id": correct_opt_id}
        ]
    })
    assert submit_resp.status_code == 200
    res = submit_resp.json()
    assert res["is_passed"] is True
    assert res["score_pct"] == 100.0

    # 5. Check Progress & Certificate Generation
    prog_resp = client.get(f"/api/progress/course/{course_id}", headers=headers)
    assert prog_resp.status_code == 200
    assert prog_resp.json()["is_course_completed"] is True

    cert_resp = client.post(f"/api/certificates/generate/{course_id}", headers=headers)
    assert cert_resp.status_code == 200
    assert cert_resp.json()["course_name"] == "Python Testing Course"
