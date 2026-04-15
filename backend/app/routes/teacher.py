from fastapi import APIRouter, Request, HTTPException
from sqlalchemy import text
from app.core.db import engine
import time

router = APIRouter(prefix="/teachers", tags=["Teachers"])

@router.get("/")
def get_teachers():
    with engine.connect() as conn:
        rows = conn.execute(
            text("SELECT * FROM teachers ORDER BY id DESC")
        ).mappings().all()
    return [dict(x) for x in rows]

@router.post("/add")
async def add_teacher(req: Request):
    try:
        data = await req.json()
        ts = str(int(time.time()))

        name = data.get("name") or "Teacher"
        employee_id = data.get("employee_id") or f"EMP{ts}"
        department = data.get("department") or "General"

        email = data.get("email") or f"teacher{ts}@demo.com"
        if "@" in email:
            a,b = email.split("@",1)
            email = f"{a}_{ts}@{b}"

        mobile = data.get("mobile") or ""
        qualification = data.get("qualification") or ""
        password = data.get("password") or "123456"

        with engine.connect() as conn:
            conn.execute(text("""
            INSERT INTO teachers
            (
              name,employee_id,department,
              email,mobile,qualification,password
            )
            VALUES
            (
              :name,:employee_id,:department,
              :email,:mobile,:qualification,:password
            )
            """),{
              "name": name,
              "employee_id": employee_id,
              "department": department,
              "email": email,
              "mobile": mobile,
              "qualification": qualification,
              "password": password
            })
            conn.commit()

        return {"success":True}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{teacher_id}")
def delete_teacher(teacher_id:int):
    with engine.connect() as conn:
        conn.execute(
            text("DELETE FROM teachers WHERE id=:id"),
            {"id": teacher_id}
        )
        conn.commit()
    return {"success":True}
