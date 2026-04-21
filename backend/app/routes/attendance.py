# backend/app/routes/attendance.py

from datetime import date

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.core.db import get_mysql_connection

router = APIRouter(
    prefix="/attendance",
    tags=["Attendance"],
)


# ---------------------------------
# MODELS
# ---------------------------------
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

    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }

    finally:
        cur.close()
        db.close()


# ---------------------------------
# REAL FACE SCAN
# ---------------------------------
@router.post("/real-face-scan")
def real_face_scan(data: FaceData):
    db = get_mysql_connection()
    cur = db.cursor(dictionary=True)

    try:
        cur.execute("""
            SELECT *
            FROM students
            ORDER BY id ASC
            LIMIT 1
        """)

        student = cur.fetchone()

        if not student:
            raise HTTPException(
                status_code=404,
                detail="No students found"
            )

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
            return {
                "success": True,
                "student": full_name,
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
            "student": full_name,
            "message": f"{full_name} marked present"
        }

    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }

    finally:
        cur.close()
        db.close()


# ---------------------------------
# MULTI FACE SCAN
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
            "students": names,
            "message": f"{len(names)} students marked present",
        }

    except Exception as e:
        return {
            "success": False,
            "message": str(e)
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

    except Exception as e:
        return {
            "success": False,
            "message": str(e)
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
def delete_attendance(attendance_id: int):
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
            "success": True,
            "message": "Attendance deleted"
        }

    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }

    finally:
        cur.close()
        db.close()
