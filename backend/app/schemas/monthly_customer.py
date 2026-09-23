from datetime import date

from pydantic import BaseModel, field_validator


class MonthlyCustomerCreate(BaseModel):
    ho_ten: str
    so_dien_thoai: str | None = None
    bien_so_dang_ky: str
    loai_xe_id: int
    ngay_het_han: date


class MonthlyCustomerOut(BaseModel):
    id: int
    ho_ten: str
    so_dien_thoai: str | None
    bien_so_dang_ky: str
    loai_xe_id: int
    ngay_het_han: date

    class Config:
        from_attributes = True