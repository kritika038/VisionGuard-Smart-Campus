from urllib.parse import quote_plus

import mysql.connector
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import get_settings

_engine = None
_SessionLocal = None

Base = declarative_base()


def _database_name_for_sql(name: str):
    return name.replace("`", "")


def _require_database_config():
    settings = get_settings()
    if settings.missing_db_fields:
        raise RuntimeError(
            "Missing required database environment variables: "
            + ", ".join(settings.missing_db_fields)
        )
    return settings


def get_database_url():
    settings = _require_database_config()
    return (
        f"mysql+pymysql://{quote_plus(settings.db_user)}:"
        f"{quote_plus(settings.db_password)}@"
        f"{settings.db_host}:{settings.db_port}/{settings.db_name}"
    )


def get_engine():
    global _engine
    if _engine is None:
        _engine = create_engine(
            get_database_url(),
            pool_pre_ping=True,
            pool_recycle=3600,
        )
    return _engine


def get_session_factory():
    global _SessionLocal
    if _SessionLocal is None:
        _SessionLocal = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=get_engine(),
        )
    return _SessionLocal


def get_db():
    db = get_session_factory()()
    try:
        yield db
    finally:
        db.close()


def get_mysql_connection(database=None):
    settings = _require_database_config()
    kwargs = {
        "host": settings.db_host,
        "port": settings.db_port,
        "user": settings.db_user,
        "password": settings.db_password,
        "connection_timeout": 10,
    }
    if database is None:
        database = settings.db_name
    if database:
        kwargs["database"] = database
    return mysql.connector.connect(**kwargs)


def _split_sql_script(script: str):
    statements = []
    current = []

    for line in script.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("--"):
            continue

        current.append(line)
        if stripped.endswith(";"):
            statement = "\n".join(current).strip()
            if statement:
                statements.append(statement.rstrip(";"))
            current = []

    trailing = "\n".join(current).strip()
    if trailing:
        statements.append(trailing.rstrip(";"))
    return statements


def bootstrap_database():
    settings = _require_database_config()
    settings.upload_dir.mkdir(parents=True, exist_ok=True)

    admin_db = get_mysql_connection(database=None)
    admin_cursor = admin_db.cursor()
    try:
        database_name = _database_name_for_sql(settings.db_name)
        admin_cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{database_name}`")
        admin_cursor.execute(f"USE `{database_name}`")

        script = settings.schema_path.read_text(encoding="utf-8")
        for statement in _split_sql_script(script):
            normalized = statement.strip().lower()
            if normalized.startswith("create database") or normalized.startswith("use "):
                continue
            admin_cursor.execute(statement)
        admin_db.commit()
    finally:
        admin_cursor.close()
        admin_db.close()


def ping_database():
    db = get_mysql_connection()
    cur = db.cursor()
    try:
        cur.execute("SELECT 1")
        cur.fetchone()
        return True
    finally:
        cur.close()
        db.close()
