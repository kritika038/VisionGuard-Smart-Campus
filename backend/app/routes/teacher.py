# backend/app/routes/teacher.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.db import get_db

router = APIRouter(
    prefix="/teachers",
    tags=["Teachers"]
)

# -----------------------------------
# GET ALL TEACHERS
# -----------------------------------
@router.get("/")
def get_teachers(db: Session = Depends(get_db)):
    try:
        result = db.execute(text("SELECT * FROM teachers"))
        rows = result.mappings().all()
        return rows
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

# -----------------------------------
# ADD TEACHER
# -----------------------------------
@router.post("/")
def add_teacher(data: dict, db: Session = Depends(get_db)):
    try:
        query = text("""
            INSERT INTO teachers
            (name, email, phone, department, subject, password)
            VALUES
            (:name, :email, :phone, :department, :subject, :password)
        """)

        db.execute(query, {
            "name": data.get("name"),
            "email": data.get("email"),
            "phone": data.get("phone"),
            "department": data.get("department"),
            "subject": data.get("subject"),
            "password": data.get("password")
        })

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