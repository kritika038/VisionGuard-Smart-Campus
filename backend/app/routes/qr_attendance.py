# backend/app/routes/qr_attendance.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import mysql.connector
import uuid
from datetime import datetime, timedelta

router = APIRouter(
    prefix="/qr",
    tags=["QR Attendance"]
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
# REQUEST MODELS
# -----------------------------------
class QRGenerate(BaseModel):
    teacher_id: int
    teacher_name: str
    subject_name: str

class QRScan(BaseModel):
    token: str
    student_id: int

# -----------------------------------
# GENERATE QR TOKEN
# valid 60 sec
# -----------------------------------
@router.post("/generate")
def generate_qr(data: QRGenerate):

    db = get_db()
    cur = db.cursor(dictionary=True)

    token = str(uuid.uuid4())

    created = datetime.now()
    expiry = created + timedelta(
        seconds=60
    )

    cur.execute(
        """
        INSERT INTO qr_tokens
        (
          token,
          teacher_id,
          teacher_name,
          subject_name,
          created_at,
          expires_at,
          is_active
        )
        VALUES
        (%s,%s,%s,%s,%s,%s,%s)
        """,
        (
            token,
            data.teacher_id,
            data.teacher_name,
            data.subject_name,
            created,
            expiry,
            1
        )
    )

    db.commit()

    return {
        "success": True,
        "token": token,
        "expires_at": str(expiry)
    }

# -----------------------------------
# STUDENT SCAN QR
# -----------------------------------
@router.post("/scan")
def scan_qr(data: QRScan):

    db = get_db()
    cur = db.cursor(dictionary=True)

    # find token
    cur.execute(
        """
        SELECT * FROM qr_tokens
        WHERE token=%s
        AND is_active=1
        """,
        (data.token,)
    )

    qr = cur.fetchone()

    if not qr:
        raise HTTPException(
            status_code=404,
            detail="Invalid QR"
        )

    if datetime.now() > qr["expires_at"]:
        raise HTTPException(
            status_code=400,
            detail="QR Expired"
        )

    # student details
    cur.execute(
        """
        SELECT * FROM students
        WHERE id=%s
        """,
        (data.student_id,)
    )

    student = cur.fetchone()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    # duplicate attendance check
    cur.execute(
        """
        SELECT * FROM attendance_logs
        WHERE student_id=%s
        AND subject_name=%s
        AND date_marked=CURDATE()
        """,
        (
            data.student_id,
            qr["subject_name"]
        )
    )

    already = cur.fetchone()

    if already:
        return {
            "success": True,
            "message":
            "Already Marked"
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
        (%s,%s,%s,%s,CURDATE())
        """,
        (
            student["id"],
            student["first_name"]
            + " "
            + student["last_name"],
            qr["subject_name"],
            "Present"
        )
    )

    db.commit()

    return {
        "success": True,
        "message":
        "Attendance Marked"
    }