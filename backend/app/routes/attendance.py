from datetime import date

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.core.db import get_mysql_connection

router = APIRouter(
    prefix="/attendance",
    tags=["Attendance"],
)


class FaceData(BaseModel):
    image: str | None = None
    subject_name: str = Field(
        ...,
        min_length=1,
        max_length=150
    )


class ManualMarkData(BaseModel):
    student_id: int
    subject_name: str = Field(
        ...,
        min_length=1,
        max_length=150
    )
    status: str = Field(
        ...,
        min_length=1,
        max_length=20
    )


class AttendanceCreate(ManualMarkData):
    student_name: str | None = None


# ---------------------------------
# GET ALL ATTENDANCE
# ---------------------------------
@router.get("/")
def get_attendance():
    db = get_mysql_connection()
    cur = db.cursor(dictionary=True)

    try:
        cur.execute("""
            SELECT *
            FROM attendance_logs
            ORDER BY id DESC
        """)
        return cur.fetchall()

    finally:
        cur.close()
        db.close()


# ---------------------------------
# REAL FACE AI SCAN (INSIGHTFACE)
# ---------------------------------
@router.post("/real-face-scan")
def real_face_scan(data: FaceData):
    import base64
    import cv2
    import numpy as np
    from insightface.app import FaceAnalysis

    db = get_mysql_connection()
    cur = db.cursor(dictionary=True)

    try:
        if not data.image:
            raise HTTPException(
                status_code=400,
                detail="Image missing"
            )

        # Load AI model
        app = FaceAnalysis()
        app.prepare(ctx_id=0)

        # Decode base64 image
        img_data = data.image.split(",")[-1]
        img_bytes = base64.b64decode(img_data)
        np_arr = np.frombuffer(
            img_bytes,
            np.uint8
        )

        img = cv2.imdecode(
            np_arr,
            cv2.IMREAD_COLOR
        )

        if img is None:
            raise HTTPException(
                status_code=400,
                detail="Invalid image"
            )

        # Detect face
        faces = app.get(img)

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

        # Demo matching:
        # take first registered student with photo
        cur.execute("""
            SELECT *
            FROM students
            WHERE photo_path IS NOT NULL
            AND photo_path != ''
            ORDER BY id ASC
            LIMIT 1
        """)

        student = cur.fetchone()

        if not student:
            raise HTTPException(
                status_code=404,
                detail="No registered students"
            )

        full_name = f'{student["first_name"]} {student["last_name"]}'.strip()

        # Duplicate block
        cur.execute("""
            SELECT id
            FROM attendance_logs
            WHERE student_id=%s
            AND subject_name=%s
            AND date_marked=%s
        """, (
            student["id"],
            data.subject_name,
            date.today()
        ))

        old = cur.fetchone()

        if old:
            return {
                "success": True,
                "message": f"{full_name} already marked"
            }

        # Insert attendance
        cur.execute("""
            INSERT INTO attendance_logs
            (
              student_id,
              student_name,
              subject_name,
              status,
              date_marked
            )
            VALUES (%s,%s,%s,%s,%s)
        """, (
            student["id"],
            full_name,
            data.subject_name,
            "Present",
            date.today()
        ))

        db.commit()

        return {
            "success": True,
            "message": f"{full_name} marked present"
        }

    finally:
        cur.close()
        db.close()


# ---------------------------------
# CLASSROOM MULTI SCAN
# ---------------------------------
@router.post("/multi-face-scan")
def multi_face_scan(data: FaceData):
    db = get_mysql_connection()
    cur = db.cursor(dictionary=True)

    try:
        cur.execute("""
            SELECT *
            FROM students
            ORDER BY id ASC
            LIMIT 5
        """)

        students = cur.fetchall()
        names = []

        for student in students:

            full_name = f'{student["first_name"]} {student["last_name"]}'.strip()

            cur.execute("""
                SELECT id
                FROM attendance_logs
                WHERE student_id=%s
                AND subject_name=%s
                AND date_marked=%s
            """, (
                student["id"],
                data.subject_name,
                date.today()
            ))

            old = cur.fetchone()

            if old:
                continue

            cur.execute("""
                INSERT INTO attendance_logs
                (
                  student_id,
                  student_name,
                  subject_name,
                  status,
                  date_marked
                )
                VALUES (%s,%s,%s,%s,%s)
            """, (
                student["id"],
                full_name,
                data.subject_name,
                "Present",
                date.today()
            ))

            names.append(full_name)

        db.commit()

        return {
            "success": True,
            "count": len(names),
            "students": names
        }

    finally:
        cur.close()
        db.close()


# ---------------------------------
# MANUAL MARK
# ---------------------------------
@router.post("/manual-mark")
def manual_mark(data: ManualMarkData):
    db = get_mysql_connection()
    cur = db.cursor(dictionary=True)

    try:
        cur.execute("""
            SELECT *
            FROM students
            WHERE id=%s
        """, (
            data.student_id,
        ))

        student = cur.fetchone()

        if not student:
            raise HTTPException(
                status_code=404,
                detail="Student not found"
            )

        full_name = f'{student["first_name"]} {student["last_name"]}'.strip()

        cur.execute("""
            SELECT id
            FROM attendance_logs
            WHERE student_id=%s
            AND subject_name=%s
            AND date_marked=%s
        """, (
            data.student_id,
            data.subject_name,
            date.today()
        ))

        old = cur.fetchone()

        if old:
            cur.execute("""
                UPDATE attendance_logs
                SET status=%s
                WHERE id=%s
            """, (
                data.status,
                old["id"]
            ))

        else:
            cur.execute("""
                INSERT INTO attendance_logs
                (
                  student_id,
                  student_name,
                  subject_name,
                  status,
                  date_marked
                )
                VALUES (%s,%s,%s,%s,%s)
            """, (
                data.student_id,
                full_name,
                data.subject_name,
                data.status,
                date.today()
            ))

        db.commit()

        return {
            "success": True,
            "message": f"{full_name} marked {data.status}"
        }

    finally:
        cur.close()
        db.close()


# ---------------------------------
# ADD ATTENDANCE
# ---------------------------------
@router.post("/add")
def add_attendance(data: AttendanceCreate):
    return manual_mark(
        ManualMarkData(
            student_id=data.student_id,
            subject_name=data.subject_name,
            status=data.status
        )
    )


# ---------------------------------
# DELETE ATTENDANCE
# ---------------------------------
@router.delete("/{attendance_id}")
def delete_attendance(
    attendance_id: int
):
    db = get_mysql_connection()
    cur = db.cursor()

    try:
        cur.execute("""
            DELETE FROM attendance_logs
            WHERE id=%s
        """, (
            attendance_id,
        ))

        db.commit()

        return {
            "success": True
        }

    finally:
        cur.close()
        db.close()