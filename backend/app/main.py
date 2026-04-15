from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import auth, student, teacher, subject, timetable, attendance, qr_attendance

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(student.router)
app.include_router(teacher.router)
app.include_router(subject.router)
app.include_router(timetable.router)
app.include_router(attendance.router)
app.include_router(qr_attendance.router)

@app.get("/")
def root():
    return {"status": "running"}