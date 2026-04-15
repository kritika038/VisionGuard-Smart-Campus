# backend/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import auth
from app.routes import student
from app.routes import teacher
from app.routes import subject
from app.routes import timetable
from app.routes import attendance
from app.routes import qr_attendance

app = FastAPI(
    title="VisionGuard Backend",
    version="1.0.0"
)

# ---------------------------------
# CORS
# ---------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------
# ROUTES
# ---------------------------------
app.include_router(auth.router)
app.include_router(student.router)
app.include_router(teacher.router)
app.include_router(subject.router)
app.include_router(timetable.router)
app.include_router(attendance.router)
app.include_router(qr_attendance.router)

# ---------------------------------
# ROOT
# ---------------------------------
@app.get("/")
def root():
    return {
        "status": "running",
        "message": "VisionGuard Backend Live"
    }

# ---------------------------------
# HEALTH CHECK
# ---------------------------------
@app.get("/health")
def health():
    return {
        "success": True
    }