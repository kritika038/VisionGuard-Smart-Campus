from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.db import bootstrap_database, ping_database
from app.routes import auth
from app.routes import student
from app.routes import teacher
from app.routes import subject
from app.routes import timetable
from app.routes import attendance
from app.routes import qr_attendance

settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI):
    bootstrap_database()
    yield

app = FastAPI(
    title="VisionGuard Backend",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=settings.cors_origin_regex,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(auth.plain_router)
app.include_router(student.router)
app.include_router(teacher.router)
app.include_router(subject.router)
app.include_router(timetable.router)
app.include_router(attendance.router)
app.include_router(qr_attendance.router)


@app.get("/")
def root():
    return {
        "status": "running",
        "message": "VisionGuard Backend Live",
        "service": "visionguard-backend",
    }


@app.get("/health")
def health():
    return {
        "success": True,
        "database": ping_database(),
    }
