"""Application configuration loaded from environment variables."""

import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Central configuration for FieldOps AI backend."""

    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./fieldops.db")
    LABOR_RATE_PER_HOUR: float = float(os.getenv("LABOR_RATE_PER_HOUR", "75.00"))
    LOW_STOCK_THRESHOLD: int = int(os.getenv("LOW_STOCK_THRESHOLD", "5"))
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "llama3.2")


settings = Settings()
