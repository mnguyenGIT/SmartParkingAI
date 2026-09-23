from datetime import date

from pydantic import BaseModel


# ---------- Zone ----------
class ZoneCreate(BaseModel):
    ten_khu_vuc: str
    mo_ta: str | None = None


class ZoneUpdate(BaseModel):
    ten_khu_vuc: str | None = None
    mo_ta: str | None = None
    is_active: bool | None = None


class ZoneOut(BaseModel):
    id: int
    ten_khu_vuc: str
    mo_ta: str | None
    is_active: bool

    class Config:
        from_attributes = True


# ---------- VehicleType ----------
class VehicleTypeCreate(BaseModel):
    ten_loai: str
    mo_ta: str | None = None


class VehicleTypeUpdate(BaseModel):
    ten_loai: str | None = None
    mo_ta: str | None = None
    is_active: bool | None = None


class VehicleTypeOut(BaseModel):
    id: int
    ten_loai: str
    mo_ta: str | None
    is_active: bool

    class Config:
        from_attributes = True


# ---------- PricingPlan ----------
class PricingPlanCreate(BaseModel):
    loai_xe_id: int
    don_gia_gio: float
    don_gia_ngay: float | None = None
    hieu_luc_tu: date


class PricingPlanOut(BaseModel):
    id: int
    loai_xe_id: int
    don_gia_gio: float
    don_gia_ngay: float | None
    hieu_luc_tu: date

    class Config:
        from_attributes = True