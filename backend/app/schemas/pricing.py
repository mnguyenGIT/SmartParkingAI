from datetime import date

from pydantic import BaseModel

from app.models.enums import SpotStatus


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


# ---------- ParkingSpot ----------
class ParkingSpotCreate(BaseModel):
    ma_vi_tri: str
    khu_vuc_id: int
    loai_xe_id: int
    trang_thai: SpotStatus | None = None
    is_active: bool | None = True


class ParkingSpotUpdate(BaseModel):
    ma_vi_tri: str | None = None
    khu_vuc_id: int | None = None
    loai_xe_id: int | None = None
    trang_thai: SpotStatus | None = None
    is_active: bool | None = None


class ParkingSpotOut(BaseModel):
    id: int
    ma_vi_tri: str
    khu_vuc_id: int
    loai_xe_id: int
    trang_thai: SpotStatus
    is_active: bool
    zone_name: str | None = None
    vehicle_type_name: str | None = None

    class Config:
        from_attributes = True