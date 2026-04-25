# backend/app/routes/student.py

import base64
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.config import get_settings
from app.core.db import get_db

router = APIRouter(
    prefix="/students",
    tags=["Students"]
)


def _student_payload(data: dict):
    full_name = (data.get("name") or "").strip()

    first_name = data.get("first_name") or (
        full_name.split(" ", 1)[0] if full_name else ""
    )

    last_name = data.get("last_name") or (
        full_name.split(" ", 1)[1] if " " in full_name else ""
    )

    enrollment_no = (
        data.get("enrollment_no")
        or data.get("roll_number")
        or data.get("roll_no")
    )

    if not first_name or not enrollment_no or not data.get("email"):
        raise HTTPException(
            status_code=422,
            detail="first_name, enrollment_no, and email are required"
        )

    return {
        "first_name": first_name.strip(),
        "last_name": (last_name or "").strip(),
        "enrollment_no": str(enrollment_no).strip(),
        "roll_no": str(
            data.get("roll_no")
            or data.get("roll_number")
            or ""
        ).strip(),
        "email": data.get("email", "").strip().lower(),
        "mobile": str(
            data.get("mobile")
            or data.get("phone")
            or ""
        ).strip(),
        "department": str(
            data.get("department")
            or data.get("class")
            or "CSE"
        ).strip(),
        "course": str(
            data.get("course")
            or "B.Tech"
        ).strip(),
        "semester": str(
            data.get("semester")
            or "6"
        ).strip(),
        "section": str(
            data.get("section")
            or "A"
        ).strip(),
        "scholar_type": str(
            data.get("scholar_type")
            or "Regular"
        ).strip(),
        "password": str(
            data.get("password")
            or "123456"
        ).strip(),
    }


@router.get("/")
def get_students(db: Session = Depends(get_db)):
    try:
        result = db.execute(
            text("SELECT * FROM students ORDER BY id DESC")
        )

        rows = result.mappings().all()

        # If no students, show demo student
        if not rows:
            return [
                {
                    "id": 1,
                    "first_name": "Kritika",
                    "last_name": "Bansal",
                    "enrollment_no": "VG1001",
                    "roll_no": "21CSE101",
                    "email": "kritikabansal3@gmail.com",
                    "mobile": "9876543210",
                    "department": "CSE",
                    "course": "B.Tech",
                    "semester": "6",
                    "section": "A",
                    "scholar_type": "Regular",
                    "password": "123456"
                }
            ]

        return rows

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }


@router.post("/")
@router.post("/add")
def add_student(data: dict, db: Session = Depends(get_db)):
    try:
        payload = _student_payload(data)

        query = text("""
            INSERT INTO students
            (
                first_name,
                last_name,
                enrollment_no,
                roll_no,
                email,
                mobile,
                department,
                course,
                semester,
                section,
                scholar_type,
                password
            )
            VALUES
            (
                :first_name,
                :last_name,
                :enrollment_no,
                :roll_no,
                :email,
                :mobile,
                :department,
                :course,
                :semester,
                :section,
                :scholar_type,
                :password
            )
        """)

        db.execute(query, payload)
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


@router.post("/save-face")
def save_face(data: dict, db: Session = Depends(get_db)):
    student_id = data.get("student_id")
    photo_base64 = data.get("photo_base64")

    if not student_id or not photo_base64:
        raise HTTPException(
            status_code=422,
            detail="student_id and photo_base64 are required"
        )

    if "," in photo_base64:
        photo_base64 = photo_base64.split(",", 1)[1]

    image_bytes = base64.b64decode(photo_base64)

    upload_dir = get_settings().upload_dir
    upload_dir.mkdir(parents=True, exist_ok=True)

    file_path = Path(upload_dir) / f"student-{student_id}-{uuid4().hex[:8]}.jpg"
    file_path.write_bytes(image_bytes)

    try:
        db.execute(
            text("""
                UPDATE students
                SET photo_path=:photo_path
                WHERE id=:student_id
            """),
            {
                "photo_path": str(file_path),
                "student_id": int(student_id),
            },
        )

        db.commit()

        return {
            "success": True,
            "message": "Face registered successfully",
            "photo_path": str(file_path)
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=str(e)
        ) from e


@router.delete("/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db)):
    try:
        db.execute(
            text("DELETE FROM students WHERE id=:student_id"),
            {"student_id": student_id}
        )

        db.commit()

        return {
            "success": True,
            "message": "Student deleted successfully"
        }

    except Exception as e:
        db.rollback()

        return {
            "status": "error",
            "message": str(e)
        }