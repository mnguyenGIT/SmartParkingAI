from datetime import date, timedelta

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.ai_result import AIResult
from app.models.enums import AIFunction, ReviewStatus
from app.models.parking_session import ParkingSession


def get_daily_traffic(db: Session, days: int = 7) -> list[dict]:
    """Số lượt gửi xe + doanh thu theo từng ngày, N ngày gần nhất."""
    since = date.today() - timedelta(days=days - 1)
    rows = (
        db.query(
            func.date(ParkingSession.thoi_gian_vao).label("ngay"),
            func.count(ParkingSession.id).label("so_luot"),
            func.coalesce(func.sum(ParkingSession.so_tien), 0).label("doanh_thu"),
        )
        .filter(func.date(ParkingSession.thoi_gian_vao) >= since)
        .group_by(func.date(ParkingSession.thoi_gian_vao))
        .order_by(func.date(ParkingSession.thoi_gian_vao))
        .all()
    )
    return [
        {"ngay": r.ngay, "so_luot": r.so_luot, "doanh_thu": float(r.doanh_thu)}
        for r in rows
    ]


def get_hourly_distribution(db: Session, days: int = 7) -> list[dict]:
    """Số lượt xe vào theo từng khung giờ (0h-23h), gộp N ngày gần nhất."""
    since = date.today() - timedelta(days=days - 1)
    rows = (
        db.query(
            func.strftime("%H", ParkingSession.thoi_gian_vao).label("gio"),
            func.count(ParkingSession.id).label("so_luot"),
        )
        .filter(func.date(ParkingSession.thoi_gian_vao) >= since)
        .group_by(func.strftime("%H", ParkingSession.thoi_gian_vao))
        .order_by(func.strftime("%H", ParkingSession.thoi_gian_vao))
        .all()
    )
    return [{"gio": f"{r.gio}h", "so_luot": r.so_luot} for r in rows]


def log_ai_result(
    db: Session,
    ai_function: AIFunction,
    input_data: dict,
    output_data: str,
) -> AIResult:
    """Lưu lại mọi lần gọi AI để phục vụ Human Review (đúng guardrail đã thiết kế)."""
    record = AIResult(
        ai_function=ai_function,
        input_data=input_data,
        output_data={"text": output_data},
        review_status=ReviewStatus.PENDING,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record