from sqlalchemy import Column,Integer, BigInteger, JSON, Numeric, Enum, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.enums import AIFunction, ReviewStatus


class AIResult(Base):
    __tablename__ = "ai_results"

    id = Column(Integer, primary_key=True, autoincrement=True)
    ai_function = Column(Enum(AIFunction, native_enum=False), nullable=False)
    input_data = Column(JSON, nullable=False)
    output_data = Column(JSON, nullable=True)
    confidence_score = Column(Numeric(4, 3), nullable=True)
    review_status = Column(Enum(ReviewStatus, native_enum=False), nullable=False, default=ReviewStatus.PENDING)
    reviewed_by = Column(BigInteger, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    reviewed_by_user = relationship("User")