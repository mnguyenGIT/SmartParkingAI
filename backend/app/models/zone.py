from sqlalchemy import Column, Integer, BigInteger, String, Boolean

from app.database import Base


class Zone(Base):
    __tablename__ = "khu_vuc"

    id = Column(Integer, primary_key=True, autoincrement=True)
    ten_khu_vuc = Column(String(100), unique=True, nullable=False)
    mo_ta = Column(String(255), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)