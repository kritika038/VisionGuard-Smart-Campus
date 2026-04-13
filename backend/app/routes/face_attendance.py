from datetime import date
from io import BytesIO
import base64

import face_recognition
import numpy as np
from fastapi import APIRouter, HTTPException
from PIL import Image
from pydantic import BaseModel, Field

from app.core.db import get_mysql_connection

router = APIRouter(
    prefix="/face-attendance",
    tags=["AI Attendance"],
)


class FaceRequest(BaseModel):
    photo_base64: str = Field(..., min_length=1)
    subject_name: str = Field(default="General", min_length=1, max_length=150)


def base64_to_np(base64_string: str):
    if "," in base64_string:
        base64_string = base64_string.split(",", 1)[1]

    image_data = base64.b64decode(base64_string)
    image = Image.open(BytesIO(image_data)).convert("RGB")
    return np.array(image)


@router.post("/scan")
def scan_face(data: FaceRequest):
    db = get_mysql_connection()
    cur = db.cursor(dictionary=True)

    try:
        unknown_img = base64_to_np(data.photo_base64)
        unknown_encodings = face_recognition.face_encodings(unknown_img)

        if not unknown_encodings:
            raise HTTPException(status_code=400, detail="No face detected")

        unknown_face = unknown_encodings[0]

        cur.execute("SELECT * FROM students WHERE photo_path IS NOT NULL")
        students = cur.fetchall()

        for student in students:
            try:
                known_img = face_recognition.load_image_file(student["photo_path"])
                known_encodings = face_recognition.face_encodings(known_img)

                if not known_encodings:
                    continue

                match = face_recognition.compare_faces(
                    [known_encodings[0]],
                    unknown_face,
                    tolerance=0.48,
                )

                if not match[0]:
                    continue

                cur.execute(
                    """
                    SELECT * FROM attendance_logs
                    WHERE student_id=%s
                    AND date_marked=%s
                    AND subject_name=%s
                    """,
                    (student["id"], date.today(), data.subject_name),
                )
                already = cur.fetchone()

                if already:
                    return {
                        "success": True,
                        "message": "Already Marked",
                        "student": f'{student["first_name"]} {student["last_name"]}'.strip(),
                    }

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
                        f'{student["first_name"]} {student["last_name"]}'.strip(),
                        data.subject_name,
                        "Present",
                        date.today(),
                    ),
                )
                db.commit()

                return {
                    "success": True,
                    "message": "Attendance Marked",
                    "student": f'{student["first_name"]} {student["last_name"]}'.strip(),
                }
            except Exception:
                continue

        raise HTTPException(status_code=404, detail="Face not recognized")
    finally:
        cur.close()
        db.close()
