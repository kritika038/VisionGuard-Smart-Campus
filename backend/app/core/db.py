# backend/app/core/db.py

from urllib.parse import quote_plus
import os

import mysql.connector
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# -----------------------------
# ENV FIRST (Railway friendly)
# -----------------------------
DB_HOST = os.getenv("MYSQLHOST") or os.getenv("DB_HOST") or "localhost"
DB_PORT = int(os.getenv("MYSQLPORT") or os.getenv("DB_PORT") or 3306)
DB_USER = os.getenv("MYSQLUSER") or os.getenv("DB_USER") or "root"
DB_PASSWORD = os.getenv("MYSQLPASSWORD") or os.getenv("DB_PASSWORD") or ""
DB_NAME = os.getenv("MYSQLDATABASE") or os.getenv("DB_NAME") or "visionguard"

# -----------------------------
# DATABASE URL
# -----------------------------
DATABASE_URL = (
    f"mysql+pymysql://{quote_plus(DB_USER)}:"
    f"{quote_plus(DB_PASSWORD)}@"
    f"{DB_HOST}:{DB_PORT}/"
    f"{DB_NAME}"
)

# -----------------------------
# SQLALCHEMY ENGINE
# -----------------------------
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
    pool_size=5,
    max_overflow=10,
    future=True
)

# -----------------------------
# SESSION
# -----------------------------
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# -----------------------------
# BASE MODEL
# -----------------------------
Base = declarative_base()

# -----------------------------
# DEPENDENCY
# -----------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -----------------------------
# RAW MYSQL CONNECTION
# -----------------------------
def get_mysql_connection():
    return mysql.connector.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        connection_timeout=10
    )