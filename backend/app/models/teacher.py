from sqlalchemy import Column, Integer, String
from app.core.db import Base

class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    employee_id = Column(String(50), unique=True)
    department = Column(String(100))
    email = Column(String(120))
    password = Column(String(255))