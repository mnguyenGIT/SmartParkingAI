from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.enums import SessionStatus, SpotStatus
from app.models.parking_session import ParkingSession
from app.models.parking_spot import ParkingSpot


def ensure_no_open_session(db: Session, bien_so: str) -> None:
    """BR4: một biển số không được có 2 lượt gửi đang mở cùng lúc."""
    existing = (
        db.query(ParkingSession)
        .filter(
            ParkingSession.bien_so == bien_so,
            ParkingSession.trang_thai == SessionStatus.DANG_GUI,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Biển số {bien_so} đã có lượt gửi xe chưa đóng (mã vé: {existing.ma_ve})",
        )


def find_available_spot(
    db: Session, loai_xe_id: int, khu_vuc_id: int | None = None
) -> ParkingSpot:
    """
    Tự động gán vị trí trống đầu tiên phù hợp.
    Gộp BR1 (tồn tại & active), BR2 (đang trống), BR3 (đúng loại xe)
    vì hệ thống tự chọn thay vì để nhân viên nhập tay.
    """
    query = db.query(ParkingSpot).filter(
        ParkingSpot.loai_xe_id == loai_xe_id,   # BR3
        ParkingSpot.is_active == True,          # BR1  # noqa: E712
        ParkingSpot.trang_thai == SpotStatus.TRONG,  # BR2
    )
    if khu_vuc_id is not None:
        query = query.filter(ParkingSpot.khu_vuc_id == khu_vuc_id)

    spot = query.order_by(ParkingSpot.id.asc()).first()
    if spot is None:
        detail = "Hết vị trí trống phù hợp với loại xe đã chọn"
        if khu_vuc_id is not None:
            detail += " trong khu vực này"
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)

    return spot