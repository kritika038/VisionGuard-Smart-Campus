from sqlalchemy import Column, Integer, String
from app.core.db import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    roll_no = Column(String(50), unique=True)
    department = Column(String(100))
    semester = Column(String(50))
    section = Column(String(20))
    password = Column(String(255))