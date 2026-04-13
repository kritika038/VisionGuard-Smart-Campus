from sqlalchemy import Column, Integer, String
from app.core.db import Base

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    student_roll = Column(String(50))
    subject = Column(String(100))
    status = Column(String(20))
    date = Column(String(50))