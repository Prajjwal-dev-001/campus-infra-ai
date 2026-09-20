import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "LPU RMS AI Maintenance System"
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "lpu-rms-hackathon-secret-2024")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./lpu_rms.db")
    CHROMA_PERSIST_DIR: str = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")
    CSV_DATA_PATH: str = os.getenv("CSV_DATA_PATH", "./data/lpu_maintenance_records.csv")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
