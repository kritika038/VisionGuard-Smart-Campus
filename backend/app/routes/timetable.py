from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.db import get_db

router = APIRouter(
    prefix="/timetable",
    tags=["Timetable"]
)


def _timetable_payload(data: dict):
    required_fields = ("day_name", "start_time", "end_time", "subject_name", "teacher_name")
    missing = [field for field in required_fields if not str(data.get(field) or "").strip()]
    if missing:
        raise HTTPException(
            status_code=422,
            detail=f"Missing required fields: {', '.join(missing)}",
        )

    return {
        "day_name": str(data.get("day_name")).strip(),
        "start_time": str(data.get("start_time")).strip(),
        "end_time": str(data.get("end_time")).strip(),
        "subject_name": str(data.get("subject_name")).strip(),
        "teacher_name": str(data.get("teacher_name")).strip(),
        "room_no": str(data.get("room_no") or "").strip(),
        "semester": str(data.get("semester") or "").strip(),
        "section": str(data.get("section") or "").strip(),
    }


@router.get("/")
def get_timetable(db: Session = Depends(get_db)):
    try:
        result = db.execute(text("SELECT * FROM timetable ORDER BY id DESC"))
        rows = result.mappings().all()
        return rows
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }


@router.post("/")
@router.post("/add")
def add_timetable(data: dict, db: Session = Depends(get_db)):
    try:
        payload = _timetable_payload(data)
        query = text("""
            INSERT INTO timetable
            (
                day_name,
                start_time,
                end_time,
                subject_name,
                teacher_name,
                room_no,
                semester,
                section
            )
            VALUES
            (
                :day_name,
                :start_time,
                :end_time,
                :subject_name,
                :teacher_name,
                :room_no,
                :semester,
                :section
            )
        """)
        db.execute(query, payload)

        db.commit()

        return {
            "status": "success",
            "message": "Timetable added successfully"
        }

    except Exception as e:
        db.rollback()
        return {
            "status": "error",
            "message": str(e)
        }


@router.delete("/{timetable_id}")
def delete_timetable(timetable_id: int, db: Session = Depends(get_db)):
    try:
        db.execute(text("DELETE FROM timetable WHERE id=:timetable_id"), {"timetable_id": timetable_id})
        db.commit()
        return {
            "success": True,
            "message": "Timetable deleted successfully",
        }
    except Exception as e:
        db.rollback()
        return {
            "status": "error",
            "message": str(e)
        }
