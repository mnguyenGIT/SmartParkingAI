from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_db, require_role
from app.models.enums import UserRole
from app.models.zone import Zone
from app.schemas.pricing import ZoneCreate, ZoneOut, ZoneUpdate

router = APIRouter(prefix="/zones", tags=["Zones"])


@router.get("", response_model=list[ZoneOut])
def list_zones(db: Session = Depends(get_db)):
    return db.query(Zone).all()


@router.post("", response_model=ZoneOut, status_code=status.HTTP_201_CREATED)
def create_zone(
    payload: ZoneCreate,
    db: Session = Depends(get_db),
    _current_user=Depends(require_role(UserRole.ADMIN)),
):
    if db.query(Zone).filter(Zone.ten_khu_vuc == payload.ten_khu_vuc).first():
        raise HTTPException(status_code=400, detail="Tên khu vực đã tồn tại")

    zone = Zone(**payload.model_dump())
    db.add(zone)
    db.commit()
    db.refresh(zone)
    return zone


@router.patch("/{zone_id}", response_model=ZoneOut)
def update_zone(
    zone_id: int,
    payload: ZoneUpdate,
    db: Session = Depends(get_db),
    _current_user=Depends(require_role(UserRole.ADMIN)),
):
    zone = db.query(Zone).filter(Zone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Không tìm thấy khu vực")

    update_data = payload.model_dump(exclude_unset=True)

    # Kiểm tra trùng tên với khu vực KHÁC (không tính chính nó)
    new_name = update_data.get("ten_khu_vuc")
    if new_name:
        existing = (
            db.query(Zone)
            .filter(Zone.ten_khu_vuc == new_name, Zone.id != zone_id)
            .first()
        )
        if existing:
            raise HTTPException(status_code=400, detail="Tên khu vực đã tồn tại")

    for field, value in update_data.items():
        setattr(zone, field, value)

    db.commit()
    db.refresh(zone)
    return zone


@router.patch("/{zone_id}/deactivate", response_model=ZoneOut)
def deactivate_zone(
    zone_id: int,
    db: Session = Depends(get_db),
    _current_user=Depends(require_role(UserRole.ADMIN)),
):
    """Vô hiệu hóa thay vì xóa — giữ lại dữ liệu lịch sử."""
    zone = db.query(Zone).filter(Zone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Không tìm thấy khu vực")

    zone.is_active = False
    db.commit()
    db.refresh(zone)
    return zone