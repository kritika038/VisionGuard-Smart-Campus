from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import auth, students, teacher, subjects, timetable, attendance, qr

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

app.include_router(auth.router)
app.include_router(students.router)
app.include_router(teacher.router)
app.include_router(subjects.router)
app.include_router(timetable.router)
app.include_router(attendance.router)
app.include_router(qr.router)


@app.get("/")
def home():
    return {
        "message": "VisionGuard Backend Running",
        "cors_origins": settings.cors_origins,
    }
