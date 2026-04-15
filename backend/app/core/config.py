import os
from functools import lru_cache

def _split_csv(value: str):
    if not value:
        return []
    return [x.strip() for x in value.split(",") if x.strip()]

class Settings:
    def __init__(self):
        # Railway MySQL variables
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

        configured = _split_csv(os.getenv("CORS_ORIGINS", ""))
        self.cors_origins = configured or default_origins

@lru_cache
def get_settings():
    return Settings()
