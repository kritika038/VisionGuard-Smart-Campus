# backend/app/routes/auth.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import mysql.connector

router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)

# -------------------------
# MYSQL CONNECTION
# -------------------------
def get_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="visionguard_ai"
    )

# -------------------------
# REQUEST MODEL
# -------------------------
class LoginData(BaseModel):
    email: str
    password: str

# -------------------------
# REAL LOGIN
# -------------------------
@router.post("/login")
def login(data: LoginData):

    db = get_db()
    cur = db.cursor(dictionary=True)

    # ---------- ADMIN ----------
    if (
        data.email == "admin@visionguard.com"
        and data.password == "admin123"
    ):
        return {
            "success": True,
            "role": "admin",
            "name": "Administrator"
        }

    # ---------- TEACHER ----------
    cur.execute(
        """
        SELECT * FROM teachers
        WHERE email=%s AND password=%s
        """,
        (
            data.email,
            data.password
        )
    )

    teacher = cur.fetchone()

    if teacher:
        return {
            "success": True,
            "role": "teacher",
            "name": teacher["name"],
            "id": teacher["id"]
        }

    # ---------- STUDENT ----------
    cur.execute(
        """
        SELECT * FROM students
        WHERE email=%s AND password=%s
        """,
        (
            data.email,
            data.password
        )
    )

    student = cur.fetchone()

    if student:
        return {
            "success": True,
            "role": "student",
            "name":
                student["first_name"]
                + " "
                + student["last_name"],
            "id": student["id"]
        }

    raise HTTPException(
        status_code=401,
        detail="Invalid Email or Password"
    )