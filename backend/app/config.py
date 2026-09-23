import os

from dotenv import load_dotenv

load_dotenv()
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:3b")

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./smartparking.db"
)

OLLAMA_HOST = os.getenv(
    "OLLAMA_HOST",
    "http://127.0.0.1:11434"
)

JWT_SECRET = os.getenv(
    "JWT_SECRET",
    "dev-secret-key-change-later"
)