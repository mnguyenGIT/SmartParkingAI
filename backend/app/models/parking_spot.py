from sqlalchemy import Column,Integer, BigInteger, String, Boolean, Enum, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.enums import SpotStatus


class ParkingSpot(Base):
    __tablename__ = "vi_tri_do"

    id = Column(Integer, primary_key=True, autoincrement=True)
    ma_vi_tri = Column(String(20), unique=True, nullable=False)
    khu_vuc_id = Column(BigInteger, ForeignKey("khu_vuc.id"), nullable=False)
    loai_xe_id = Column(BigInteger, ForeignKey("loai_xe.id"), nullable=False)
    trang_thai = Column(Enum(SpotStatus, native_enum=False), nullable=False, default=SpotStatus.TRONG)
    is_active = Column(Boolean, nullable=False, default=True)

    zone = relationship("Zone")
    vehicle_type = relationship("VehicleType")