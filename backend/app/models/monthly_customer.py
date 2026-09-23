from sqlalchemy import Column,Integer, BigInteger, String, Date, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class MonthlyCustomer(Base):
    __tablename__ = "khach_hang_ve_thang"

    id = Column(Integer, primary_key=True, autoincrement=True)
    ho_ten = Column(String(150), nullable=False)
    so_dien_thoai = Column(String(20), unique=True, nullable=True)
    bien_so_dang_ky = Column(String(20), unique=True, nullable=False)
    loai_xe_id = Column(BigInteger, ForeignKey("loai_xe.id"), nullable=False)
    ngay_het_han = Column(Date, nullable=False)

    vehicle_type = relationship("VehicleType")