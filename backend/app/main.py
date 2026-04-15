from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import (
    auth,
    student,
    teacher,
    subject,
    timetable,
    attendance,
    qr_attendance,
    face_attendance
)

app = FastAPI(
    title="VisionGuard Backend",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://vision-guard-smart-campus-green.vercel.app",
        "https://vision-guard-smart-campus.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth.router)
app.include_router(student.router)
app.include_router(teacher.router)
app.include_router(subject.router)
app.include_router(timetable.router)
app.include_router(attendance.router)
app.include_router(qr_attendance.router)
app.include_router(face_attendance.router)


@app.get("/")
def root():
    return {
        "message": "VisionGuard Backend Running",
        "status": "success"
    }