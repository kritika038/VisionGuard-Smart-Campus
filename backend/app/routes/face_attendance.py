# backend/app/routes/face_attendance.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import mysql.connector
import base64
import face_recognition
import numpy as np
from io import BytesIO
from PIL import Image
from datetime import date

router = APIRouter(
    prefix="/face-attendance",
    tags=["AI Attendance"]
)

# -----------------------------------
# MYSQL
# -----------------------------------
def get_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="visionguard_ai"
    )

# -----------------------------------
# REQUEST MODEL
# -----------------------------------
class FaceRequest(BaseModel):
    photo_base64: str
    subject_name: str = "General"

# -----------------------------------
# IMAGE HELPERS
# -----------------------------------
def base64_to_np(base64_string):
    if "," in base64_string:
        base64_string = base64_string.split(",")[1]

    image_data = base64.b64decode(
        base64_string
    )

    image = Image.open(
        BytesIO(image_data)
    ).convert("RGB")

    return np.array(image)

# -----------------------------------
# MAIN ROUTE
# -----------------------------------
@router.post("/scan")
def scan_face(data: FaceRequest):

    db = get_db()
    cur = db.cursor(dictionary=True)

    # Incoming webcam image
    unknown_img = base64_to_np(
        data.photo_base64
    )

    unknown_encodings = (
        face_recognition.face_encodings(
            unknown_img
        )
    )

    if len(unknown_encodings) == 0:
        raise HTTPException(
            status_code=400,
            detail="No face detected"
        )

    unknown_face = unknown_encodings[0]

    # Load students
    cur.execute(
        "SELECT * FROM students WHERE photo_path IS NOT NULL"
    )

    students = cur.fetchall()

    for student in students:

        try:
            known_img = face_recognition.load_image_file(
                student["photo_path"]
            )

            known_encodings = (
                face_recognition.face_encodings(
                    known_img
                )
            )

            if len(known_encodings) == 0:
                continue

            known_face = known_encodings[0]

            match = (
                face_recognition.compare_faces(
                    [known_face],
                    unknown_face,
                    tolerance=0.48
                )
            )

            if match[0]:

                # duplicate today check
                cur.execute(
                    """
                    SELECT * FROM attendance_logs
                    WHERE student_id=%s
                    AND date_marked=%s
                    AND subject_name=%s
                    """,
                    (
                        student["id"],
                        date.today(),
                        data.subject_name
                    )
                )

                already = cur.fetchone()

                if already:
                    return {
                        "success": True,
                        "message":
                        "Already Marked",
                        "student":
                        student["first_name"]
                        + " "
                        + student["last_name"]
                    }

                # insert attendance
                cur.execute(
                    """
                    INSERT INTO attendance_logs
                    (
                      student_id,
                      student_name,
                      subject_name,
                      status,
                      date_marked
                    )
                    VALUES
                    (%s,%s,%s,%s,%s)
                    """,
                    (
                        student["id"],
                        student["first_name"]
                        + " "
                        + student["last_name"],
                        data.subject_name,
                        "Present",
                        date.today()
                    )
                )

                db.commit()

                return {
                    "success": True,
                    "message":
                    "Attendance Marked",
                    "student":
                    student["first_name"]
                    + " "
                    + student["last_name"]
                }

        except:
            continue

    raise HTTPException(
        status_code=404,
        detail="Face not recognized"
    )