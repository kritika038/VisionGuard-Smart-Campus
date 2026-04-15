import os
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv

# Load local .env for localhost development
load_dotenv(Path(__file__).resolve().parents[2] / ".env")


def _split_csv(value: str) -> list[str]:
    return [item.strip() for item in value.split(",") if item.strip()]


class Settings:
    def __init__(self) -> None:
        # Railway MYSQL vars first priority
        self.db_host = (
            os.getenv("MYSQLHOST")
            or os.getenv("DB_HOST")
            or "localhost"
        )

        self.db_port = int(
            os.getenv("MYSQLPORT")
            or os.getenv("DB_PORT")
            or "3306"
        )

        self.db_user = (
            os.getenv("MYSQLUSER")
            or os.getenv("DB_USER")
            or "root"
        )

        self.db_password = (
            os.getenv("MYSQLPASSWORD")
            or os.getenv("DB_PASSWORD")
            or ""
        )

        self.db_name = (
            os.getenv("MYSQLDATABASE")
            or os.getenv("DB_NAME")
            or "visionguard_ai"
        )

        self.port = int(
            os.getenv("PORT")
            or "8000"
        )

        default_origins = [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "https://*.vercel.app",
        ]

        configured_origins = _split_csv(
            os.getenv("CORS_ORIGINS", "")
        )

        self.cors_origins = (
            configured_origins
            if configured_origins
            else default_origins
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()