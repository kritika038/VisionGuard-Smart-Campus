import os
from urllib.parse import quote_plus

import mysql.connector
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Safe env loading
DB_HOST = os.getenv("MYSQLHOST") or os.getenv("DB_HOST") or "localhost"
DB_PORT = int(os.getenv("MYSQLPORT") or 3306)
DB_USER = os.getenv("MYSQLUSER") or os.getenv("DB_USER") or "root"
DB_PASSWORD = os.getenv("MYSQLPASSWORD") or os.getenv("DB_PASSWORD") or ""
DB_NAME = os.getenv("MYSQLDATABASE") or os.getenv("DB_NAME") or "railway"

DATABASE_URL = (
    f"mysql+pymysql://{quote_plus(DB_USER)}:"
    f"{quote_plus(DB_PASSWORD)}@"
    f"{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_mysql_connection():
    return mysql.connector.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME
    )