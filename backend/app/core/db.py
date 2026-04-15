# backend/app/core/db.py

from urllib.parse import quote_plus
import os

import mysql.connector
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# ---------------------------------
# RAILWAY MYSQL VARIABLES
# ---------------------------------
DB_HOST = (
    os.getenv("MYSQLHOST")
    or os.getenv("DB_HOST")
    or os.getenv("PGHOST")
)

DB_PORT = int(
    os.getenv("MYSQLPORT")
    or os.getenv("DB_PORT")
    or 3306
)

DB_USER = (
    os.getenv("MYSQLUSER")
    or os.getenv("DB_USER")
)

DB_PASSWORD = (
    os.getenv("MYSQLPASSWORD")
    or os.getenv("DB_PASSWORD")
)

DB_NAME = (
    os.getenv("MYSQLDATABASE")
    or os.getenv("DB_NAME")
)

# ---------------------------------
# FAIL FAST IF ENV NOT FOUND
# ---------------------------------
if not DB_HOST:
    raise Exception("MYSQLHOST missing")

if not DB_USER:
    raise Exception("MYSQLUSER missing")

if not DB_NAME:
    raise Exception("MYSQLDATABASE missing")

# ---------------------------------
# DATABASE URL
# ---------------------------------
DATABASE_URL = (
    f"mysql+pymysql://{quote_plus(DB_USER)}:"
    f"{quote_plus(DB_PASSWORD)}@"
    f"{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

# ---------------------------------
# SQLALCHEMY
# ---------------------------------
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

# ---------------------------------
# SESSION
# ---------------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------------------------------
# RAW MYSQL
# ---------------------------------
def get_mysql_connection():
    return mysql.connector.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME
    )