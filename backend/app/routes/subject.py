# backend/app/routes/subject.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.db import get_db

router = APIRouter(
    prefix="/subjects",
    tags=["Subjects"]
)

# -----------------------------------
# GET ALL SUBJECTS
# -----------------------------------
@router.get("/")
def get_subjects(db: Session = Depends(get_db)):
    try:
        result = db.execute(text("SELECT * FROM subjects"))
        rows = result.mappings().all()
        return rows
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

# -----------------------------------
# ADD SUBJECT
# -----------------------------------
@router.post("/")
def add_subject(data: dict, db: Session = Depends(get_db)):
    try:
        query = text("""
            INSERT INTO subjects
            (subject_name, subject_code, department, semester, teacher_name)
            VALUES
            (:subject_name, :subject_code, :department, :semester, :teacher_name)
        """)

        db.execute(query, {
            "subject_name": data.get("subject_name"),
            "subject_code": data.get("subject_code"),
            "department": data.get("department"),
            "semester": data.get("semester"),
            "teacher_name": data.get("teacher_name")
        })

        db.commit()

        return {
            "status": "success",
            "message": "Subject added successfully"
        }

    except Exception as e:
        db.rollback()
        return {
            "status": "error",
            "message": str(e)
        }