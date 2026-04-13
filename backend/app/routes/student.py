from fastapi import APIRouter, HTTPException
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from app.core.db import engine
import base64
import os

router = APIRouter(prefix="/students", tags=["Students"])

UPLOAD_DIR = "uploads/students"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# -----------------------------
# Get All Students
# -----------------------------
@router.get("/")
def all_students():
    with engine.connect() as conn:
        rows = conn.execute(
            text("SELECT * FROM students ORDER BY id DESC")
        ).mappings().all()

    return rows


# -----------------------------
# Create Student Details Only
# -----------------------------
@router.post("/create-only")
def create_student(data: dict):

    if not data["first_name"].strip():
        raise HTTPException(
            status_code=400,
            detail="First name required"
        )

    if not data["enrollment_no"].strip():
        raise HTTPException(
            status_code=400,
            detail="Enrollment number required"
        )

    if not data["email"].strip():
        raise HTTPException(
            status_code=400,
            detail="Email required"
        )

    try:
        with engine.connect() as conn:

            conn.execute(text("""
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
            """), data)

            conn.commit()

            row = conn.execute(
                text("SELECT LAST_INSERT_ID() AS id")
            ).mappings().first()

        return {
            "success": True,
            "id": row["id"]
        }

    except IntegrityError:
        raise HTTPException(
            status_code=400,
            detail="Enrollment or Email already exists"
        )


# -----------------------------
# Save Face After Registration
# -----------------------------
@router.post("/save-face")
def save_face(data: dict):

    import cv2
    import numpy as np

    if not data["photo_base64"]:
        raise HTTPException(
            status_code=400,
            detail="Face image required"
        )

    student_id = data["student_id"]

    try:
        image_data = data["photo_base64"].split(",")[1]
        img_bytes = base64.b64decode(image_data)

        nparr = np.frombuffer(
            img_bytes,
            np.uint8
        )

        img = cv2.imdecode(
            nparr,
            cv2.IMREAD_COLOR
        )

        gray = cv2.cvtColor(
            img,
            cv2.COLOR_BGR2GRAY
        )

        detector = cv2.CascadeClassifier(
            cv2.data.haarcascades +
            "haarcascade_frontalface_default.xml"
        )

        faces = detector.detectMultiScale(
            gray,
            1.3,
            5
        )

        if len(faces) == 0:
            raise HTTPException(
                status_code=400,
                detail="No face detected"
            )

        if len(faces) > 1:
            raise HTTPException(
                status_code=400,
                detail="Multiple faces detected"
            )

        filename = f"{student_id}.jpg"
        path = f"{UPLOAD_DIR}/{filename}"

        with open(path, "wb") as f:
            f.write(img_bytes)

        with engine.connect() as conn:
            conn.execute(text("""
            UPDATE students
            SET photo_path=:photo_path
            WHERE id=:id
            """), {
                "photo_path": path,
                "id": student_id
            })

            conn.commit()

        return {
            "success": True,
            "message": "Face Registered"
        }

    except HTTPException as e:
        raise e

    except:
        raise HTTPException(
            status_code=400,
            detail="Invalid image"
        )

# -----------------------------
# Delete Student
# -----------------------------
@router.delete("/{student_id}")
def delete_student(student_id: int):

    with engine.connect() as conn:

        row = conn.execute(
            text("""
            SELECT photo_path
            FROM students
            WHERE id=:id
            """),
            {"id": student_id}
        ).mappings().first()

        conn.execute(
            text("""
            DELETE FROM students
            WHERE id=:id
            """),
            {"id": student_id}
        )

        conn.commit()

    if row and row["photo_path"]:
        try:
            if os.path.exists(row["photo_path"]):
                os.remove(row["photo_path"])
        except:
            pass

    return {
        "success": True
    }