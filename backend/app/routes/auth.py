from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, Field

from app.core.db import get_mysql_connection

router = APIRouter(
    prefix="/auth",
    tags=["Auth"],
)


class LoginData(BaseModel):
    email: EmailStr
    password: str = Field(
        ...,
        min_length=1,
        max_length=128
    )


@router.post("/login")
def login(data: LoginData):
    email = data.email.strip().lower()
    password = data.password.strip()

    # ---------------------------------
    # ADMIN LOGIN
    # ---------------------------------
    if (
        email == "admin@visionguard.com"
        and password == "admin123"
    ):
        return {
            "success": True,
            "role": "admin",
            "name": "Administrator",
            "id": 999
        }

    # ---------------------------------
    # FIXED DEMO TEACHER LOGIN
    # ---------------------------------
    db = get_mysql_connection()
    cur = db.cursor(dictionary=True)

    try:
        # Teacher Login
        cur.execute(
            """
            SELECT *
            FROM teachers
            WHERE LOWER(email)=%s
            AND password=%s
            """,
            (
                email,
                password
            ),
        )

        teacher = cur.fetchone()

        if teacher:
            return {
                "success": True,
                "role": "teacher",
                "name": teacher["name"],
                "id": teacher["id"],
            }

        # Student Login
        cur.execute(
            """
            SELECT *
            FROM students
            WHERE LOWER(email)=%s
            AND password=%s
            """,
            (
                email,
                password
            ),
        )

        student = cur.fetchone()

        if student:
            return {
                "success": True,
                "role": "student",
                "name": f'{student["first_name"]} {student["last_name"]}'.strip(),
                "id": student["id"],
            }

        raise HTTPException(
            status_code=401,
            detail="Invalid Email or Password"
        )

    finally:
        cur.close()
        db.close()


plain_router = APIRouter(tags=["Auth"])


@plain_router.post("/login")
def plain_login(data: LoginData):
    return login(data)


@plain_router.post("/login/")
def plain_login_with_slash(data: LoginData):
    return login(data)


@router.post("/login/")
def login_with_slash(data: LoginData):
    return login(data)


@router.post("/login-alias")
def login_alias(data: LoginData):
    return login(data)
