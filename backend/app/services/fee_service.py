import math
from datetime import date, datetime
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.monthly_customer import MonthlyCustomer
from app.models.pricing_plan import PricingPlan


def get_active_pricing(db: Session, loai_xe_id: int) -> PricingPlan:
    plan = (
        db.query(PricingPlan)
        .filter(PricingPlan.loai_xe_id == loai_xe_id, PricingPlan.hieu_luc_tu <= date.today())
        .order_by(PricingPlan.hieu_luc_tu.desc())
        .first()
    )
    if plan is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Chưa thiết lập bảng giá cho loại xe này",
        )
    return plan


def find_active_monthly_customer(db: Session, bien_so: str) -> MonthlyCustomer | None:
    return (
        db.query(MonthlyCustomer)
        .filter(
            MonthlyCustomer.bien_so_dang_ky == bien_so,
            MonthlyCustomer.ngay_het_han >= date.today(),
        )
        .first()
    )


def calculate_fee(
    thoi_gian_vao: datetime,
    thoi_gian_ra: datetime,
    pricing: PricingPlan,
    monthly_customer: MonthlyCustomer | None,
) -> Decimal:
    """BR5: tính phí theo loại xe/thời gian gửi; miễn phí nếu có vé tháng còn hạn."""
    if monthly_customer is not None:
        return Decimal(0)

    so_giay = (thoi_gian_ra - thoi_gian_vao).total_seconds()
    so_gio = max(1, math.ceil(so_giay / 3600))  # tối thiểu tính 1 giờ, làm tròn lên
    return Decimal(so_gio) * Decimal(str(pricing.don_gia_gio))