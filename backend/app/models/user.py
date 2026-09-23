from sqlalchemy import Column,Integer , BigInteger, String, Enum
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.enums import UserRole


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(150), nullable=False)
    role = Column(Enum(UserRole, native_enum=False), nullable=False, default=UserRole.NHANVIEN)

    # Quan hệ ngược (không tạo cột mới, chỉ tiện truy vấn)
    sessions_checked_in = relationship(
        "ParkingSession", foreign_keys="ParkingSession.checked_in_by", back_populates="checked_in_user"
    )
    sessions_checked_out = relationship(
        "ParkingSession", foreign_keys="ParkingSession.checked_out_by", back_populates="checked_out_user"
    )