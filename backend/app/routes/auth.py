# backend/app/routes/auth.py

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, Field

router = APIRouter(
    prefix="/auth",
    tags=["Auth"],
)


class LoginData(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1, max_length=128)


@router.post("/login")
def login(data: LoginData):
    email = data.email.strip().lower()
    password = data.password.strip()

    # ADMIN
    if email == "admin@visionguard.com" and password == "admin123":
        return {
            "success": True,
            "role": "admin",
            "name": "Administrator",
            "id": 1
        }

    # TEACHER
    if email == "teacher@visionguard.com" and password == "123456":
        return {
            "success": True,
            "role": "teacher",
            "name": "Rahul Sharma",
            "id": 2
        }

    # STUDENT
    if email == "kritikabansal3@gmail.com" and password == "123456":
        return {
            "success": True,
            "role": "student",
            "name": "Kritika Bansal",
            "id": 3
        }

    raise HTTPException(
        status_code=401,
        detail="Invalid Email or Password"
    )


plain_router = APIRouter(tags=["Auth"])


@plain_router.post("/login")
def plain_login(data: LoginData):
    return login(data)


@plain_router.post("/login/")
def plain_login_slash(data: LoginData):
    return login(data)


@router.post("/login/")
def login_slash(data: LoginData):
    return login(data)


@router.post("/login-alias")
def login_alias(data: LoginData):
    return login(data)