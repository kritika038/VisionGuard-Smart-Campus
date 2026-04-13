import os
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[2] / ".env")


def _split_csv(value: str) -> list[str]:
    return [item.strip() for item in value.split(",") if item.strip()]


class Settings:
    def __init__(self) -> None:
        self.db_host = os.getenv("DB_HOST", "localhost")
        self.db_port = int(os.getenv("DB_PORT", "3306"))
        self.db_user = os.getenv("DB_USER", "root")
        self.db_password = os.getenv("DB_PASSWORD", "")
        self.db_name = os.getenv("DB_NAME", "visionguard_ai")
        self.port = int(os.getenv("PORT", "8000"))

        default_origins = [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ]
        configured_origins = _split_csv(os.getenv("CORS_ORIGINS", ""))
        self.cors_origins = configured_origins or default_origins


@lru_cache
def get_settings() -> Settings:
    return Settings()
