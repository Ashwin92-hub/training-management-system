# 🎓 ApexLMS — Full-Stack Learning Management System

> **Hiring Challenge Submission** — Built for enterprise training delivery, interactive quiz assessments, role-based administration, and verifiable PDF certificate generation.

---

## 🌐 Live Demo Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| 🔴 **Admin** | `admin@lms.com` | `admin123` |
| 🔵 **Instructor** | `instructor@lms.com` | `instructor123` |
| 🟢 **Learner** | `learner@lms.com` | `learner123` |

> Use the **Quick Role Switcher** pill in the top navigation bar to instantly switch between demo personas without logging out.

---

## ✅ All Mandatory Requirements Implemented

| # | Requirement | Status |
| :- | :--- | :---: |
| 1 | Admins/Instructors create & manage courses, modules, content | ✅ |
| 2 | Admins/Instructors create & manage quizzes, questions, passing scores | ✅ |
| 3 | Admins manage users & assign courses | ✅ |
| 4 | Admin/Instructor analytics dashboard | ✅ |
| 5 | Display list of available courses to users | ✅ |
| 6 | Allow users to select and start a course | ✅ |
| 7 | Display text/video training content module-by-module | ✅ |
| 8 | Multiple-choice questions at the end of each module | ✅ |
| 9 | Validate submitted answers (server-side grading) | ✅ |
| 10 | Calculate & display quiz score | ✅ |
| 11 | Define minimum passing score per quiz | ✅ |
| 12 | Allow retry on failed quiz | ✅ |
| 13 | Mark module as completed after user passes | ✅ |
| 14 | Track completed & pending modules | ✅ |
| 15 | Generate certificate after all modules completed | ✅ |
| 16 | Certificate includes name, course, date, final score, cert number | ✅ |
| 17 | View & download certificate (PDF) | ✅ |
| 18 | Save user progress & quiz results in database | ✅ |
| 19 | Frontend & backend automated tests | ✅ |

---

## 🏗 Tech Stack

### Frontend
| Technology | Purpose |
| :--- | :--- |
| **React 18 + Vite** | SPA framework and dev tooling |
| **Vanilla CSS** | Custom glassmorphism dark theme design system |
| **React Router v6** | Client-side routing + role-based protected routes |
| **Axios** | HTTP client with JWT interceptors |
| **Lucide React** | Icon library |
| **jsPDF + html2canvas** | Client-side PDF certificate generation |
| **Canvas-Confetti** | Quiz pass celebration animation |
| **Vitest + Testing Library** | Frontend component testing |

### Backend
| Technology | Purpose |
| :--- | :--- |
| **Python FastAPI** | High-performance REST API framework |
| **SQLAlchemy 2.x** | ORM — Relational database modeling |
| **Pydantic v2** | Request/response schema validation |
| **python-jose (JWT)** | Stateless authentication tokens |
| **passlib + bcrypt** | Secure password hashing |
| **pytest + httpx** | Backend integration testing |

### Database
| Technology | Purpose |
| :--- | :--- |
| **SQLite** | Zero-config default for local development |
| **PostgreSQL** | Production-ready (set `DATABASE_URL` env var) |

---

## 📁 Project Structure

```
training-management-system/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entrypoint & CORS
│   │   ├── database.py          # SQLAlchemy engine + session
│   │   ├── models.py            # ORM Models (10 tables)
│   │   ├── schemas.py           # Pydantic request/response schemas
│   │   ├── auth.py              # JWT auth + password hashing + RBAC
│   │   ├── seed.py              # Demo data seeder (users, courses, quizzes)
│   │   └── routers/
│   │       ├── auth.py          # POST /login, /register, GET /me
│   │       ├── admin.py         # User management + course assignment
│   │       ├── courses.py       # Course & module CRUD
│   │       ├── quizzes.py       # Quiz creation + submission + grading
│   │       ├── progress.py      # Module progress tracking
│   │       ├── certificates.py  # Certificate issuance & retrieval
│   │       └── dashboard.py     # Admin analytics stats
│   ├── tests/
│   │   └── test_backend.py      # pytest integration tests
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Global nav with role switcher
│   │   │   ├── QuizEngine.jsx       # Interactive MCQ quiz player
│   │   │   ├── CertificateView.jsx  # Printable PDF certificate
│   │   │   ├── StatCard.jsx         # Dashboard metric card
│   │   │   └── VideoPlayer.jsx      # YouTube/HTML5 embed player
│   │   ├── pages/
│   │   │   ├── Login.jsx            # Auth + quick demo login
│   │   │   ├── Catalog.jsx          # Course catalog with search/filter
│   │   │   ├── CoursePlayer.jsx     # Module reader + quiz screen
│   │   │   ├── LearnerDashboard.jsx # Student progress & certificates
│   │   │   ├── AdminDashboard.jsx   # Analytics overview
│   │   │   ├── CourseManagement.jsx # Course & quiz builder
│   │   │   └── UserManagement.jsx   # User & enrollment manager
│   │   ├── context/AuthContext.jsx  # Global auth state
│   │   ├── services/api.js          # Axios instance with JWT interceptor
│   │   ├── App.jsx                  # Router + protected routes
│   │   └── index.css                # Design system (glassmorphism)
│   ├── src/tests/
│   │   └── QuizEngine.test.jsx      # Vitest component tests
│   └── package.json
│
└── README.md
```

---

## 🚀 Setup & Execution Instructions

### Prerequisites
- **Python** 3.10+
- **Node.js** 18+
- **npm** 9+

---

### 1. Clone the Repository

```bash
git clone https://github.com/Ashwin92-hub/training-management-system.git
cd training-management-system
```

---

### 2. Backend Setup (FastAPI)

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install email-validator "bcrypt==4.0.1"

# Start the backend API server
python -m uvicorn app.main:app --reload --port 8000
```

The backend will:
- Auto-create the SQLite database (`lms.db`) on first run
- Auto-seed demo users, sample courses, modules, and quizzes
- Serve the API at **http://localhost:8000**
- Serve interactive Swagger docs at **http://localhost:8000/docs**

> **PostgreSQL**: Set the `DATABASE_URL` environment variable to use PostgreSQL:
> ```bash
> set DATABASE_URL=postgresql://user:password@localhost:5432/apexlms
> ```

---

### 3. Frontend Setup (React + Vite)

Open a **new terminal**:

```bash
cd frontend

# Install dependencies
npm install

# Start the Vite dev server
npm run dev
```

Frontend will be available at **http://localhost:5173**

---

### 4. Running Automated Tests

**Backend tests (pytest):**
```bash
cd backend
.\venv\Scripts\python -m pytest
# Expected: 2 passed
```

**Frontend tests (vitest):**
```bash
cd frontend
npm run test
# Expected: 2 passed
```

---

## 📊 Database Schema (10 Tables)

```
users              → id, name, email, hashed_password, role, created_at
courses            → id, title, description, category, instructor_id, thumbnail_url
modules            → id, course_id, title, content_type, content_body, video_url, order_index
quizzes            → id, module_id, title, passing_score_pct, max_attempts
questions          → id, quiz_id, question_text, explanation, points
question_options   → id, question_id, option_text, is_correct
enrollments        → id, user_id, course_id, assigned_by_id, enrolled_at
module_progress    → id, user_id, module_id, is_completed, score_pct, completed_at
quiz_attempts      → id, user_id, quiz_id, score_pct, is_passed, answers_json
certificates       → id (CERT-XXXX-XXXX), user_id, course_id, issue_date, final_score, verification_code
```

---

## 🔑 API Endpoints Summary

| Method | Endpoint | Description | Role |
| :--- | :--- | :--- | :--- |
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login → JWT token | Public |
| GET | `/api/auth/me` | Get current user | All |
| GET | `/api/courses` | List all courses (search, filter) | All |
| POST | `/api/courses` | Create new course | Admin/Instructor |
| POST | `/api/courses/{id}/modules` | Add module to course | Admin/Instructor |
| POST | `/api/quizzes` | Create quiz with questions | Admin/Instructor |
| POST | `/api/quizzes/submit` | Submit & auto-grade quiz | All |
| GET | `/api/progress/course/{id}` | Get course progress | All |
| POST | `/api/certificates/generate/{id}` | Issue course certificate | All |
| GET | `/api/certificates/user` | List user's certificates | All |
| GET | `/api/admin/users` | List all users | Admin/Instructor |
| POST | `/api/admin/assign-course` | Assign course to user | Admin/Instructor |
| GET | `/api/dashboard/stats` | Analytics statistics | Admin/Instructor |

---

## 🧪 Test Results

```
Backend (pytest):   2 passed in 5.03s  ✅
Frontend (vitest):  2 passed in 147ms  ✅
```

---

## 🎨 Key Design Decisions

1. **Zero-Config SQLite Default**: Works out of the box without any database setup — just run and go.
2. **Dual DB Support**: Switch to PostgreSQL by setting the `DATABASE_URL` env var — no code changes needed.
3. **Server-Side Grading**: All quiz answers are validated on the backend to prevent client-side tampering.
4. **Auto Certificate Issuance**: Certificates are auto-generated in the database when all modules are passed, and also triggered manually via the `/generate` endpoint.
5. **Role-Based Route Protection**: Both frontend routes (React Router guards) and backend endpoints (`require_role` dependency) enforce role permissions.
6. **Quick Demo Switcher**: Top-navbar role switcher for easy evaluation of all three user personas without manual credential input.

---

## 👤 Author

**Ashwin GR**  
GitHub: [@Ashwin92-hub](https://github.com/Ashwin92-hub)
