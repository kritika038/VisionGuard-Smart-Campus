from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.auth import router as auth_router
from app.routes.student import router as student_router
from app.routes.teacher import router as teacher_router
from app.routes.subjects import router as subjects_router
from app.routes.timetable import router as timetable_router
from app.routes.attendance import router as attendance_router
from app.routes.qr import router as qr_router

app = FastAPI(title="VisionGuard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {
        "message": "VisionGuard Backend Running",
        "status": "success"
    }

app.include_router(auth_router)
app.include_router(student_router)
app.include_router(teacher_router)
app.include_router(subjects_router)
app.include_router(timetable_router)
app.include_router(attendance_router)
app.include_router(qr_router)