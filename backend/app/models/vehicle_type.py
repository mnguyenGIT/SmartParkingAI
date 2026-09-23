from sqlalchemy import Column, Integer, BigInteger, String, Boolean

from app.database import Base


class VehicleType(Base):
    __tablename__ = "loai_xe"

    id = Column(Integer, primary_key=True, autoincrement=True)
    ten_loai = Column(String(50), unique=True, nullable=False)
    mo_ta = Column(String(255), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)