from datetime import datetime, timedelta
import uuid

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.core.db import get_mysql_connection

router = APIRouter(
    prefix="/qr",
    tags=["QR Attendance"],
)


class QRGenerate(BaseModel):
    teacher_id: int
    teacher_name: str = Field(..., min_length=1, max_length=120)
    subject_name: str = Field(..., min_length=1, max_length=150)


class QRScan(BaseModel):
    token: str = Field(..., min_length=1, max_length=128)
    student_id: int


@router.post("/generate")
def generate_qr(data: QRGenerate):
    db = get_mysql_connection()
    cur = db.cursor(dictionary=True)

    try:
        token = str(uuid.uuid4())
        created = datetime.now()
        expiry = created + timedelta(seconds=60)

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
            (token, data.teacher_id, data.teacher_name, data.subject_name, created, expiry, 1),
        )
        db.commit()

        return {"success": True, "token": token, "expires_at": str(expiry)}
    finally:
        cur.close()
        db.close()


@router.post("/scan")
def scan_qr(data: QRScan):
    db = get_mysql_connection()
    cur = db.cursor(dictionary=True)

    try:
        cur.execute(
            """
            SELECT * FROM qr_tokens
            WHERE token=%s
            AND is_active=1
            """,
            (data.token,),
        )
        qr = cur.fetchone()

        if not qr:
            raise HTTPException(status_code=404, detail="Invalid QR")

        if datetime.now() > qr["expires_at"]:
            raise HTTPException(status_code=400, detail="QR Expired")

        cur.execute(
            """
            SELECT * FROM students
            WHERE id=%s
            """,
            (data.student_id,),
        )
        student = cur.fetchone()

        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        cur.execute(
            """
            SELECT * FROM attendance_logs
            WHERE student_id=%s
            AND subject_name=%s
            AND date_marked=CURDATE()
            """,
            (data.student_id, qr["subject_name"]),
        )
        already = cur.fetchone()

        if already:
            return {"success": True, "message": "Already Marked"}

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
                f'{student["first_name"]} {student["last_name"]}'.strip(),
                qr["subject_name"],
                "Present",
            ),
        )
        db.commit()

        return {"success": True, "message": "Attendance Marked"}
    finally:
        cur.close()
        db.close()


@router.post("/mark-attendance")
def mark_attendance(data: QRScan):
    return scan_qr(data)
