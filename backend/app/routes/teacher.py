from fastapi import APIRouter, HTTPException
from sqlalchemy import text
from app.core.db import engine

router = APIRouter(prefix="/teachers", tags=["Teachers"])


@router.get("/")
def get_teachers():
    with engine.connect() as conn:
        rows = conn.execute(
            text("SELECT * FROM teachers ORDER BY id DESC")
        ).mappings().all()
    return rows


@router.post("/add")
def add_teacher(data: dict):
    try:
        with engine.connect() as conn:
            conn.execute(text("""
                INSERT INTO teachers
                (name,email,subject)
                VALUES
                (:name,:email,:department)
            """), {
                "name": data.get("name"),
                "email": data.get("email"),
                "department": data.get("department")
            })
            conn.commit()

        return {"success": True}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{teacher_id}")
def delete_teacher(teacher_id: int):
    with engine.connect() as conn:
        conn.execute(
            text("DELETE FROM teachers WHERE id=:id"),
            {"id": teacher_id}
        )
        conn.commit()

    return {"success": True}