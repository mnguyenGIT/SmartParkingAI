import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db, require_role
from app.models.enums import SessionStatus, SpotStatus, UserRole
from app.models.parking_session import ParkingSession
from app.models.parking_spot import ParkingSpot
from app.models.status_history import StatusHistory
from app.models.user import User
from app.schemas.parking_session import CheckInRequest, ParkingSessionOut
from app.services.business_rules import ensure_no_open_session, find_available_spot
from app.services.fee_service import calculate_fee, find_active_monthly_customer, get_active_pricing

router = APIRouter(prefix="/sessions", tags=["Parking Sessions"])


@router.get("", response_model=list[ParkingSessionOut])
def list_sessions(
    bien_so: str | None = None,
    trang_thai: SessionStatus | None = None,
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_user),
):
    query = db.query(ParkingSession)
    if bien_so:
        query = query.filter(ParkingSession.bien_so == bien_so)
    if trang_thai:
        query = query.filter(ParkingSession.trang_thai == trang_thai)
    return query.order_by(ParkingSession.thoi_gian_vao.desc()).all()


@router.post("/check-in", response_model=ParkingSessionOut, status_code=status.HTTP_201_CREATED)
def check_in(
    payload: CheckInRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.NHANVIEN, UserRole.ADMIN)),
):
    # BR4 trước — chặn sớm, tránh tốn 1 vị trí nếu biển số đã có lượt mở
    ensure_no_open_session(db, payload.bien_so)

    # BR1 + BR2 + BR3 — tự động gán vị trí trống phù hợp
    spot = find_available_spot(db, payload.loai_xe_id, payload.khu_vuc_id)

    ma_ve = f"VE-{uuid.uuid4().hex[:8].upper()}"
    now = datetime.now()

    parking_session = ParkingSession(
        ma_ve=ma_ve,
        bien_so=payload.bien_so,
        loai_xe_id=payload.loai_xe_id,
        vi_tri_id=spot.id,
        thoi_gian_vao=now,
        trang_thai=SessionStatus.DANG_GUI,
        checked_in_by=current_user.id,
    )
    db.add(parking_session)
    spot.trang_thai = SpotStatus.DA_DAT
    db.flush()  # để có parking_session.id trước khi ghi lịch sử trạng thái

    db.add(
        StatusHistory(
            luot_gui_xe_id=parking_session.id,
            tu_trang_thai=None,
            den_trang_thai=SessionStatus.DANG_GUI.value,
            changed_by=current_user.id,
        )
    )

    db.commit()
    db.refresh(parking_session)
    return parking_session


@router.post("/{session_id}/check-out", response_model=ParkingSessionOut)
def check_out(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.NHANVIEN, UserRole.ADMIN)),
):
    parking_session = db.query(ParkingSession).filter(ParkingSession.id == session_id).first()
    if parking_session is None:
        raise HTTPException(status_code=404, detail="Không tìm thấy lượt gửi xe")

    if parking_session.trang_thai != SessionStatus.DANG_GUI:
        raise HTTPException(
            status_code=400, detail="Lượt gửi xe này không ở trạng thái Đang gửi"
        )

    now = datetime.now()
    pricing = get_active_pricing(db, parking_session.loai_xe_id)
    monthly_customer = find_active_monthly_customer(db, parking_session.bien_so)
    so_tien = calculate_fee(parking_session.thoi_gian_vao, now, pricing, monthly_customer)

    old_status = parking_session.trang_thai.value
    parking_session.thoi_gian_ra = now
    parking_session.so_tien = so_tien
    parking_session.trang_thai = SessionStatus.DA_RA
    parking_session.checked_out_by = current_user.id
    if monthly_customer:
        parking_session.ve_thang_id = monthly_customer.id

    spot = db.query(ParkingSpot).filter(ParkingSpot.id == parking_session.vi_tri_id).first()
    if spot:
        spot.trang_thai = SpotStatus.TRONG

    db.add(
        StatusHistory(
            luot_gui_xe_id=parking_session.id,
            tu_trang_thai=old_status,
            den_trang_thai=SessionStatus.DA_RA.value,
            changed_by=current_user.id,
        )
    )

    db.commit()
    db.refresh(parking_session)
    return parking_session