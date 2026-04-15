# backend/app/routes/timetable.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.db import get_db

router = APIRouter(
    prefix="/timetable",
    tags=["Timetable"]
)

# -----------------------------------
# GET ALL TIMETABLE
# -----------------------------------
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

# -----------------------------------
# ADD TIMETABLE
# -----------------------------------
@router.post("/")
def add_timetable(data: dict, db: Session = Depends(get_db)):
    try:
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

        db.execute(query, {
            "day_name": data.get("day_name"),
            "start_time": data.get("start_time"),
            "end_time": data.get("end_time"),
            "subject_name": data.get("subject_name"),
            "teacher_name": data.get("teacher_name"),
            "room_no": data.get("room_no"),
            "semester": data.get("semester"),
            "section": data.get("section")
        })

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