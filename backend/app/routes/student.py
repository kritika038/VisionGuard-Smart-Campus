from fastapi import APIRouter, Request, HTTPException
from sqlalchemy import text
from app.core.db import engine
import os, base64, time

router = APIRouter(prefix="/students", tags=["Students"])

UPLOAD_DIR="uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/")
def get_students():
    with engine.connect() as conn:
        rows = conn.execute(
            text("SELECT * FROM students ORDER BY id DESC")
        ).mappings().all()
    return [dict(x) for x in rows]

@router.post("/add")
async def add_student(req: Request):
    data = await req.json()

    ts = str(int(time.time()))

    first_name = data.get("first_name") or data.get("name") or "Student"
    last_name = data.get("last_name") or ""
    enrollment_no = data.get("enrollment_no") or f"ENR{ts}"
    roll_no = data.get("roll_no") or f"ROLL{ts[-5:]}"
    email = data.get("email") or f"{ts}@mail.com"

    with engine.connect() as conn:
        conn.execute(text("""
        INSERT INTO students
        (
          first_name,last_name,enrollment_no,
          roll_no,email,mobile,department,
          course,semester,section,
          scholar_type,password
        )
        VALUES
        (
          :first_name,:last_name,:enrollment_no,
          :roll_no,:email,:mobile,:department,
          :course,:semester,:section,
          :scholar_type,:password
        )
        """),{
          "first_name": first_name,
          "last_name": last_name,
          "enrollment_no": enrollment_no,
          "roll_no": roll_no,
          "email": email,
          "mobile": data.get("mobile",""),
          "department": data.get("department",""),
          "course": data.get("course",""),
          "semester": data.get("semester",""),
          "section": data.get("section",""),
          "scholar_type": data.get("scholar_type",""),
          "password": data.get("password","123456")
        })
        conn.commit()

    return {"success":True}

@router.post("/save-face")
async def save_face(req: Request):
    data = await req.json()
    sid = data.get("student_id")
    photo = data.get("photo_base64")

    if not sid or not photo:
        raise HTTPException(status_code=400, detail="missing data")

    if "," in photo:
        photo = photo.split(",")[1]

    img = base64.b64decode(photo)
    path = f"{UPLOAD_DIR}/{sid}.jpg"

    with open(path,"wb") as f:
        f.write(img)

    with engine.connect() as conn:
        conn.execute(
            text("UPDATE students SET photo_path=:p WHERE id=:id"),
            {"p":path,"id":sid}
        )
        conn.commit()

    return {"success":True}

@router.delete("/{student_id}")
def delete_student(student_id:int):
    with engine.connect() as conn:
        conn.execute(
            text("DELETE FROM students WHERE id=:id"),
            {"id":student_id}
        )
        conn.commit()
    return {"success":True}
