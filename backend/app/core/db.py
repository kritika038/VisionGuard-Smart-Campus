from urllib.parse import quote_plus
import mysql.connector
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import get_settings

settings = get_settings()

DATABASE_URL = (
    f"mysql+pymysql://{quote_plus(settings.db_user)}:"
    f"{quote_plus(settings.db_password)}@"
    f"{settings.db_host}:{settings.db_port}/"
    f"{settings.db_name}"
)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
    pool_size=5,
    max_overflow=10
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
        host=settings.db_host,
        port=settings.db_port,
        user=settings.db_user,
        password=settings.db_password,
        database=settings.db_name,
        connection_timeout=10
    )