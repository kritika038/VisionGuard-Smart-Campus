import os
from functools import lru_cache
from pathlib import Path


def _split_csv(value: str):
    if not value:
        return []
    return [item.strip() for item in value.split(",") if item.strip()]


class Settings:
    def __init__(self):
        self.db_host = os.getenv("MYSQLHOST") or os.getenv("DB_HOST")
        self.db_port = int(os.getenv("MYSQLPORT") or os.getenv("DB_PORT") or "3306")
        self.db_user = os.getenv("MYSQLUSER") or os.getenv("DB_USER")
        self.db_password = os.getenv("MYSQLPASSWORD") or os.getenv("DB_PASSWORD")
        self.db_name = os.getenv("MYSQLDATABASE") or os.getenv("DB_NAME")

        self.port = int(os.getenv("PORT", "8000"))

        default_origins = [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ]
        self.cors_origins = default_origins + [
            origin
            for origin in _split_csv(os.getenv("CORS_ORIGINS", ""))
            if origin not in default_origins
        ]
        self.cors_origin_regex = os.getenv(
            "CORS_ORIGIN_REGEX",
            r"https://.*\.vercel\.app",
        )

        self.backend_dir = Path(__file__).resolve().parents[2]
        self.schema_path = self.backend_dir / "sql" / "schema.sql"
        self.upload_dir = Path(
            os.getenv(
                "UPLOAD_DIR",
                str(self.backend_dir / "uploads" / "students"),
            )
        )

    @property
    def missing_db_fields(self):
        missing = []
        if not self.db_host:
            missing.append("MYSQLHOST")
        if not self.db_user:
            missing.append("MYSQLUSER")
        if self.db_password is None:
            missing.append("MYSQLPASSWORD")
        if not self.db_name:
            missing.append("MYSQLDATABASE")
        return missing


@lru_cache
def get_settings():
    return Settings()
