from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.db import get_db

router = APIRouter(
    prefix="/subjects",
    tags=["Subjects"]
)


def _subject_payload(data: dict):
    subject_name = (data.get("subject_name") or "").strip()
    subject_code = (data.get("subject_code") or "").strip()
    if not subject_name or not subject_code:
        raise HTTPException(
            status_code=422,
            detail="subject_name and subject_code are required",
        )
    return {
        "subject_name": subject_name,
        "subject_code": subject_code,
        "department": str(data.get("department") or "").strip(),
        "semester": str(data.get("semester") or "").strip(),
        "teacher_name": str(data.get("teacher_name") or "").strip(),
        "credits": str(data.get("credits") or "").strip(),
    }


@router.get("/")
def get_subjects(db: Session = Depends(get_db)):
    try:
        result = db.execute(text("SELECT * FROM subjects ORDER BY id DESC"))
        rows = result.mappings().all()
        return rows
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }


@router.post("/")
@router.post("/add")
def add_subject(data: dict, db: Session = Depends(get_db)):
    try:
        payload = _subject_payload(data)
        query = text("""
            INSERT INTO subjects
            (
                subject_name,
                subject_code,
                department,
                semester,
                teacher_name,
                credits
            )
            VALUES
            (
                :subject_name,
                :subject_code,
                :department,
                :semester,
                :teacher_name,
                :credits
            )
        """)
        db.execute(query, payload)

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


@router.delete("/{subject_id}")
def delete_subject(subject_id: int, db: Session = Depends(get_db)):
    try:
        db.execute(text("DELETE FROM subjects WHERE id=:subject_id"), {"subject_id": subject_id})
        db.commit()
        return {
            "success": True,
            "message": "Subject deleted successfully",
        }
    except Exception as e:
        db.rollback()
        return {
            "status": "error",
            "message": str(e)
        }
