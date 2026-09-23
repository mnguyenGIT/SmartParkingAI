from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.config import DATABASE_URL


# SQLite cần thiết lập này khi sử dụng với FastAPI
connect_args = {}

if DATABASE_URL.startswith("sqlite"):
    connect_args = {
        "check_same_thread": False
    }


# Tạo SQLAlchemy Engine
engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args
)


# Tạo Session để làm việc với database
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


# Base class cho tất cả ORM Models
Base = declarative_base()


# Dependency dùng trong các Router sau này
def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()