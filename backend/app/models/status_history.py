from sqlalchemy import Column,Integer , BigInteger, String, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class StatusHistory(Base):
    __tablename__ = "lich_su_trang_thai"

    id = Column(Integer, primary_key=True, autoincrement=True)
    luot_gui_xe_id = Column(BigInteger, ForeignKey("luot_gui_xe.id"), nullable=False)
    tu_trang_thai = Column(String(20), nullable=True)
    den_trang_thai = Column(String(20), nullable=False)
    changed_by = Column(BigInteger, ForeignKey("users.id"), nullable=False)

    session = relationship("ParkingSession", back_populates="status_history")
    changed_by_user = relationship("User")