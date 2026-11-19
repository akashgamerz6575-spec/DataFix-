from __future__ import annotations

import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    app_env: str
    cors_origins: list[str]
    max_upload_bytes: int


def get_settings() -> Settings:
    raw_origins = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    )
    origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

    try:
        max_upload_bytes = int(os.getenv("MAX_UPLOAD_BYTES", "20000000"))
    except ValueError:
        max_upload_bytes = 20_000_000

    return Settings(
        app_env=os.getenv("APP_ENV", "development"),
        cors_origins=origins,
        max_upload_bytes=max(1_000_000, max_upload_bytes),
    )
