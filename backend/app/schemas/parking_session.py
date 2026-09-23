from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, field_validator

from app.models.enums import SessionStatus


class CheckInRequest(BaseModel):
    bien_so: str
    loai_xe_id: int
    khu_vuc_id: int | None = None  # bỏ trống = tìm khắp các khu vực


class ParkingSessionOut(BaseModel):
    id: int
    ma_ve: str
    bien_so: str
    loai_xe_id: int
    vi_tri_id: int
    thoi_gian_vao: datetime
    thoi_gian_ra: datetime | None
    trang_thai: SessionStatus
    so_tien: Decimal | None
    ve_thang_id: int | None

    class Config:
        from_attributes = True