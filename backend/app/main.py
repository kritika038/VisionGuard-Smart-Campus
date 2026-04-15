# backend/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import auth
from app.routes import students
from app.routes import teachers
from app.routes import subjects
from app.routes import timetable
from app.routes import attendance
from app.routes import qr
from app.routes import face_attendance

app = FastAPI(
    title="VisionGuard Backend"
)

# ---------------------------------------------------
# CORS FIX
# ---------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",

        "https://vision-guard-smart-campus-green.vercel.app",
        "https://vision-guard-smart-campus.vercel.app",

        "https://*.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------
# ROUTES
# ---------------------------------------------------

app.include_router(auth.router)
app.include_router(students.router)
app.include_router(teachers.router)
app.include_router(subjects.router)
app.include_router(timetable.router)
app.include_router(attendance.router)
app.include_router(qr.router)
app.include_router(face_attendance.router)

# ---------------------------------------------------
# ROOT
# ---------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "VisionGuard Backend Running",
        "status": "success"
    }