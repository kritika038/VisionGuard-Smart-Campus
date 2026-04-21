from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.db import get_db

router = APIRouter(
    prefix="/teachers",
    tags=["Teachers"]
)


def _teacher_payload(data: dict):
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    if not name or not email:
        raise HTTPException(status_code=422, detail="name and email are required")

    return {
        "name": name,
        "employee_id": str(data.get("employee_id") or f"TCH-{uuid4().hex[:8].upper()}").strip(),
        "department": str(data.get("department") or data.get("subject") or "").strip(),
        "email": email,
        "mobile": str(data.get("mobile") or data.get("phone") or "").strip(),
        "qualification": str(data.get("qualification") or "").strip(),
        "password": str(data.get("password") or "123456").strip(),
    }


@router.get("/")
def get_teachers(db: Session = Depends(get_db)):
    try:
        result = db.execute(text("SELECT * FROM teachers ORDER BY id DESC"))
        rows = result.mappings().all()
        return rows
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }


@router.post("/")
@router.post("/add")
def add_teacher(data: dict, db: Session = Depends(get_db)):
    try:
        payload = _teacher_payload(data)
        query = text("""
            INSERT INTO teachers
            (
                name,
                employee_id,
                department,
                email,
                mobile,
                qualification,
                password
            )
            VALUES
            (
                :name,
                :employee_id,
                :department,
                :email,
                :mobile,
                :qualification,
                :password
            )
        """)
        db.execute(query, payload)

        db.commit()

        return {
            "status": "success",
            "message": "Teacher added successfully"
        }

    except Exception as e:
        db.rollback()
        return {
            "status": "error",
            "message": str(e)
        }


@router.delete("/{teacher_id}")
def delete_teacher(teacher_id: int, db: Session = Depends(get_db)):
    try:
        db.execute(text("DELETE FROM teachers WHERE id=:teacher_id"), {"teacher_id": teacher_id})
        db.commit()
        return {
            "success": True,
            "message": "Teacher deleted successfully",
        }
    except Exception as e:
        db.rollback()
        return {
            "status": "error",
            "message": str(e)
        }
