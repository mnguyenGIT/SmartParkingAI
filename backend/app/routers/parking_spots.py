from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.deps import get_db, require_role
from app.models.enums import SpotStatus, UserRole
from app.models.parking_spot import ParkingSpot
from app.models.zone import Zone
from app.models.vehicle_type import VehicleType
from app.schemas.pricing import ParkingSpotCreate, ParkingSpotOut, ParkingSpotUpdate

router = APIRouter(prefix="/parking-spots", tags=["Parking Spots"])


@router.get("", response_model=list[ParkingSpotOut])
def list_spots(
    khu_vuc_id: int | None = None,
    loai_xe_id: int | None = None,
    db: Session = Depends(get_db),
):
    query = (
        db.query(
            ParkingSpot.id,
            ParkingSpot.ma_vi_tri,
            ParkingSpot.khu_vuc_id,
            ParkingSpot.loai_xe_id,
            ParkingSpot.trang_thai,
            ParkingSpot.is_active,
            func.coalesce(Zone.ten_khu_vuc, "").label("zone_name"),
            func.coalesce(VehicleType.ten_loai, "").label("vehicle_type_name"),
        )
        .outerjoin(Zone, ParkingSpot.khu_vuc_id == Zone.id)
        .outerjoin(VehicleType, ParkingSpot.loai_xe_id == VehicleType.id)
    )
    if khu_vuc_id is not None:
        query = query.filter(ParkingSpot.khu_vuc_id == khu_vuc_id)
    if loai_xe_id is not None:
        query = query.filter(ParkingSpot.loai_xe_id == loai_xe_id)

    rows = query.order_by(ParkingSpot.id).all()
    return [
        {
            "id": r.id,
            "ma_vi_tri": r.ma_vi_tri,
            "khu_vuc_id": r.khu_vuc_id,
            "loai_xe_id": r.loai_xe_id,
            "trang_thai": r.trang_thai,
            "is_active": r.is_active,
            "zone_name": r.zone_name,
            "vehicle_type_name": r.vehicle_type_name,
        }
        for r in rows
    ]


@router.get("/stats/zone-summary", response_model=list[dict])
def zone_summary(db: Session = Depends(get_db)):
    rows = (
        db.query(
            Zone.id.label("khu_vuc_id"),
            Zone.ten_khu_vuc,
            func.coalesce(func.count(ParkingSpot.id), 0).label("total"),
            func.coalesce(func.sum((ParkingSpot.trang_thai == SpotStatus.DA_DAT).cast(db.bind.engine.dialect.type_compiler(ParkingSpot.trang_thai).process(ParkingSpot.trang_thai)) if False else 0), 0).label("occupied"),
        )
        .outerjoin(ParkingSpot, ParkingSpot.khu_vuc_id == Zone.id)
        .group_by(Zone.id)
        .all()
    )
    # Simpler: compute via Python
    results = []
    zones = db.query(Zone).filter(Zone.is_active == True).all()
    for zone in zones:
        spots = db.query(ParkingSpot).filter(ParkingSpot.khu_vuc_id == zone.id).all()
        total = len(spots)
        occupied = sum(1 for s in spots if s.trang_thai == SpotStatus.DA_DAT)
        results.append({
            "khu_vuc_id": zone.id,
            "ten_khu_vuc": zone.ten_khu_vuc,
            "total_spots": total,
            "available_spots": total - occupied,
            "occupied_spots": occupied,
        })
    return results


@router.post("", response_model=ParkingSpotOut, status_code=status.HTTP_201_CREATED)
def create_spot(
    payload: ParkingSpotCreate,
    db: Session = Depends(get_db),
    _current_user=Depends(require_role(UserRole.ADMIN)),
):
    zone = db.query(Zone).filter(Zone.id == payload.khu_vuc_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Khu vực không tồn tại")
    vtype = db.query(VehicleType).filter(VehicleType.id == payload.loai_xe_id).first()
    if not vtype:
        raise HTTPException(status_code=404, detail="Loại xe không tồn tại")

    if db.query(ParkingSpot).filter(ParkingSpot.ma_vi_tri == payload.ma_vi_tri).first():
        raise HTTPException(status_code=400, detail="Mã vị trí đã tồn tại")

    spot = ParkingSpot(**payload.model_dump())
    db.add(spot)
    db.commit()
    db.refresh(spot)
    return spot


@router.patch("/{spot_id}", response_model=ParkingSpotOut)
def update_spot(
    spot_id: int,
    payload: ParkingSpotUpdate,
    db: Session = Depends(get_db),
    _current_user=Depends(require_role(UserRole.ADMIN)),
):
    spot = db.query(ParkingSpot).filter(ParkingSpot.id == spot_id).first()
    if not spot:
        raise HTTPException(status_code=404, detail="Không tìm thấy vị trí đỗ")

    update_data = payload.model_dump(exclude_unset=True)
    if update_data.get("khu_vuc_id"):
        zone = db.query(Zone).filter(Zone.id == update_data["khu_vuc_id"]).first()
        if not zone:
            raise HTTPException(status_code=404, detail="Khu vực không tồn tại")
    if update_data.get("loai_xe_id"):
        vtype = db.query(VehicleType).filter(VehicleType.id == update_data["loai_xe_id"]).first()
        if not vtype:
            raise HTTPException(status_code=404, detail="Loại xe không tồn tại")

    for field, value in update_data.items():
        setattr(spot, field, value)
    db.commit()
    db.refresh(spot)
    return spot


@router.patch("/{spot_id}/deactivate", response_model=ParkingSpotOut)
def deactivate_spot(
    spot_id: int,
    db: Session = Depends(get_db),
    _current_user=Depends(require_role(UserRole.ADMIN)),
):
    spot = db.query(ParkingSpot).filter(ParkingSpot.id == spot_id).first()
    if not spot:
        raise HTTPException(status_code=404, detail="Không tìm thấy vị trí đỗ")
    spot.is_active = False
    db.commit()
    db.refresh(spot)
    return spot


@router.get("/{spot_id}", response_model=ParkingSpotOut)
def get_spot(
    spot_id: int,
    db: Session = Depends(get_db),
):
    spot = db.query(ParkingSpot).filter(ParkingSpot.id == spot_id).first()
    if not spot:
        raise HTTPException(status_code=404, detail="Không tìm thấy vị trí đỗ")
    zone = db.query(Zone).filter(Zone.id == spot.khu_vuc_id).first()
    vt = db.query(VehicleType).filter(VehicleType.id == spot.loai_xe_id).first()
    return {
        "id": spot.id,
        "ma_vi_tri": spot.ma_vi_tri,
        "khu_vuc_id": spot.khu_vuc_id,
        "loai_xe_id": spot.loai_xe_id,
        "trang_thai": spot.trang_thai,
        "is_active": spot.is_active,
        "zone_name": zone.ten_khu_vuc if zone else None,
        "vehicle_type_name": vt.ten_loai if vt else None,
    }
