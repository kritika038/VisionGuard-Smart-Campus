# backend/app/routes/timetable.py

from fastapi import APIRouter
from sqlalchemy import text
from app.core.db import engine

router = APIRouter(prefix="/timetable", tags=["Timetable"])


@router.get("/")
def get_timetable():
    with engine.connect() as conn:
        rows = conn.execute(
            text("SELECT * FROM timetable ORDER BY id DESC")
        ).mappings().all()

    return rows


@router.post("/add")
def add_timetable(data: dict):
    with engine.connect() as conn:
        conn.execute(text("""
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
        """), data)

        conn.commit()

    return {"success": True}


@router.delete("/{row_id}")
def delete_timetable(row_id: int):
    with engine.connect() as conn:
        conn.execute(
            text(
              "DELETE FROM timetable WHERE id=:id"
            ),
            {"id": row_id}
        )
        conn.commit()

    return {"success": True}