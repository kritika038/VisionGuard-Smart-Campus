# backend/app/routes/subject.py

from fastapi import APIRouter
from sqlalchemy import text
from app.core.db import engine

router = APIRouter(prefix="/subjects", tags=["Subjects"])


@router.get("/")
def get_subjects():
    with engine.connect() as conn:
        rows = conn.execute(
            text("SELECT * FROM subjects ORDER BY id DESC")
        ).mappings().all()

    return rows


@router.post("/add")
def add_subject(data: dict):
    with engine.connect() as conn:
        conn.execute(text("""
        INSERT INTO subjects
        (
          subject_name,
          subject_code,
          semester,
          department,
          teacher_name,
          credits
        )
        VALUES
        (
          :subject_name,
          :subject_code,
          :semester,
          :department,
          :teacher_name,
          :credits
        )
        """), data)

        conn.commit()

    return {"success": True}


@router.delete("/{subject_id}")
def delete_subject(subject_id: int):
    with engine.connect() as conn:
        conn.execute(
            text(
              "DELETE FROM subjects WHERE id=:id"
            ),
            {"id": subject_id}
        )
        conn.commit()

    return {"success": True}