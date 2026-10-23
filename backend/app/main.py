from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base
from .seed import seed_data
from .routers import auth, admin, courses, quizzes, progress, certificates, dashboard

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LMS Training Platform API",
    description="Full-stack training application backend API for managing courses, modules, quizzes, grading, progress, and certificates.",
    version="1.0.0"
)

# Enable CORS for frontend Vite dev server (and any origin locally)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(courses.router)
app.include_router(quizzes.router)
app.include_router(progress.router)
app.include_router(certificates.router)
app.include_router(dashboard.router)

@app.on_event("startup")
def startup_event():
    seed_data()

@app.get("/")
def root():
    return {"message": "LMS Training Platform API is running", "docs": "/docs"}
