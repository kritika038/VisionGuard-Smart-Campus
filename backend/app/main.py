from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import (
    auth,
    student,
    teacher,
    subject,
    timetable,
    attendance,
    qr_attendance
)

app = FastAPI(
    title="VisionGuard Backend",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Working Routes
app.include_router(auth.router)
app.include_router(student.router)
app.include_router(teacher.router)
app.include_router(subject.router)
app.include_router(timetable.router)
app.include_router(attendance.router)
app.include_router(qr_attendance.router)

# FACE ROUTE DISABLED FOR RAILWAY
# from app.routes import face_attendance
# app.include_router(face_attendance.router)

@app.get("/")
def root():
    return {
        "message": "VisionGuard Backend Running",
        "status": "success"
    }