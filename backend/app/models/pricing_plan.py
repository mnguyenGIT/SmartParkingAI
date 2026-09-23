from sqlalchemy import Column,Integer , BigInteger, Numeric, Date, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class PricingPlan(Base):
    __tablename__ = "bang_gia"

    id = Column(Integer, primary_key=True, autoincrement=True)
    loai_xe_id = Column(BigInteger, ForeignKey("loai_xe.id"), nullable=False)
    don_gia_gio = Column(Numeric(10, 0), nullable=False, default=0)
    don_gia_ngay = Column(Numeric(10, 0), nullable=True, default=0)
    hieu_luc_tu = Column(Date, nullable=False)

    vehicle_type = relationship("VehicleType")