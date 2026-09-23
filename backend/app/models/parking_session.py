from sqlalchemy import Column,Integer, BigInteger, String, DateTime, Numeric, Enum, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.enums import SessionStatus


class ParkingSession(Base):
    __tablename__ = "luot_gui_xe"

    id = Column(Integer, primary_key=True, autoincrement=True)
    ma_ve = Column(String(20), unique=True, nullable=False)
    bien_so = Column(String(20), nullable=False, index=True)
    loai_xe_id = Column(BigInteger, ForeignKey("loai_xe.id"), nullable=False)
    vi_tri_id = Column(BigInteger, ForeignKey("vi_tri_do.id"), nullable=False)
    thoi_gian_vao = Column(DateTime, nullable=False)
    thoi_gian_ra = Column(DateTime, nullable=True)
    trang_thai = Column(Enum(SessionStatus, native_enum=False), nullable=False, default=SessionStatus.DANG_GUI)
    so_tien = Column(Numeric(12, 0), nullable=True)
    ve_thang_id = Column(BigInteger, ForeignKey("khach_hang_ve_thang.id"), nullable=True)
    checked_in_by = Column(BigInteger, ForeignKey("users.id"), nullable=False)
    checked_out_by = Column(BigInteger, ForeignKey("users.id"), nullable=True)

    vehicle_type = relationship("VehicleType")
    spot = relationship("ParkingSpot")
    monthly_customer = relationship("MonthlyCustomer")
    checked_in_user = relationship("User", foreign_keys=[checked_in_by], back_populates="sessions_checked_in")
    checked_out_user = relationship("User", foreign_keys=[checked_out_by], back_populates="sessions_checked_out")
    status_history = relationship("StatusHistory", back_populates="session")