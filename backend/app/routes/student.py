# backend/app/routes/student.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.db import get_db

router = APIRouter(
    prefix="/students",
    tags=["Students"]
)

# -----------------------------------
# GET ALL STUDENTS
# -----------------------------------
@router.get("/")
def get_students(db: Session = Depends(get_db)):
    try:
        result = db.execute(text("SELECT * FROM students"))
        rows = result.mappings().all()
        return rows
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

# -----------------------------------
# ADD STUDENT
# -----------------------------------
@router.post("/")
def add_student(data: dict, db: Session = Depends(get_db)):
    try:
        query = text("""
            INSERT INTO students
            (first_name, last_name, roll_no, email, phone, course, department, semester, section, password)
            VALUES
            (:first_name, :last_name, :roll_no, :email, :phone, :course, :department, :semester, :section, :password)
        """)

        db.execute(query, {
            "first_name": data.get("first_name"),
            "last_name": data.get("last_name"),
            "roll_no": data.get("roll_no"),
            "email": data.get("email"),
            "phone": data.get("phone"),
            "course": data.get("course"),
            "department": data.get("department"),
            "semester": data.get("semester"),
            "section": data.get("section"),
            "password": data.get("password")
        })

        db.commit()

        return {
            "status": "success",
            "message": "Student added successfully"
        }

    except Exception as e:
        db.rollback()
        return {
            "status": "error",
            "message": str(e)
        }