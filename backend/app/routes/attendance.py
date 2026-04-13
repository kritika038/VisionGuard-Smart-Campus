# backend/app/routes/attendance.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import mysql.connector
from datetime import date

router = APIRouter(
    prefix="/attendance",
    tags=["Attendance"]
)

# -----------------------------------
# DATABASE CONNECTION
# -----------------------------------
def get_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="visionguard_ai"
    )

# -----------------------------------
# MODELS
# -----------------------------------
class FaceData(BaseModel):
    image: str
    subject_name: str


class ManualMarkData(BaseModel):
    student_id: int
    subject_name: str
    status: str


# -----------------------------------
# GET ALL ATTENDANCE
# -----------------------------------
@router.get("/")
def get_attendance():
    db = get_db()
    cur = db.cursor(dictionary=True)

    cur.execute("""
        SELECT * FROM attendance_logs
        ORDER BY id DESC
    """)

    data = cur.fetchall()
    return data


# -----------------------------------
# SINGLE FACE SCAN
# Demo working route
# -----------------------------------
@router.post("/real-face-scan")
def real_face_scan(data: FaceData):
    db = get_db()
    cur = db.cursor(dictionary=True)

    cur.execute("""
        SELECT * FROM students
        ORDER BY id ASC
        LIMIT 1
    """)

    student = cur.fetchone()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="No student found"
        )

    full_name = (
        student["first_name"]
        + " "
        + student["last_name"]
    )

    # duplicate check
    cur.execute("""
        SELECT id FROM attendance_logs
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


# -----------------------------------
# MULTI FACE CLASSROOM SCAN
# Demo working route
# -----------------------------------
@router.post("/multi-face-scan")
def multi_face_scan(data: FaceData):
    db = get_db()
    cur = db.cursor(dictionary=True)

    cur.execute("""
        SELECT * FROM students
        ORDER BY id ASC
        LIMIT 5
    """)

    students = cur.fetchall()

    names = []

    for s in students:
        full_name = (
            s["first_name"]
            + " "
            + s["last_name"]
        )

        # duplicate check
        cur.execute("""
            SELECT id FROM attendance_logs
            WHERE student_id=%s
            AND subject_name=%s
            AND date_marked=%s
        """, (
            s["id"],
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
            s["id"],
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


# -----------------------------------
# MANUAL ATTENDANCE
# Present / Absent / Late
# -----------------------------------
@router.post("/manual-mark")
def manual_mark(data: ManualMarkData):
    db = get_db()
    cur = db.cursor(dictionary=True)

    cur.execute("""
        SELECT * FROM students
        WHERE id=%s
    """, (data.student_id,))

    student = cur.fetchone()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    full_name = (
        student["first_name"]
        + " "
        + student["last_name"]
    )

    # already exists today?
    cur.execute("""
        SELECT id FROM attendance_logs
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