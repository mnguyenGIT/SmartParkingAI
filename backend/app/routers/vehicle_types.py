from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_db, require_role
from app.models.enums import UserRole
from app.models.vehicle_type import VehicleType
from app.schemas.pricing import VehicleTypeCreate, VehicleTypeOut, VehicleTypeUpdate

router = APIRouter(prefix="/vehicle-types", tags=["Vehicle Types"])


@router.get("", response_model=list[VehicleTypeOut])
def list_vehicle_types(db: Session = Depends(get_db)):
    return db.query(VehicleType).all()


@router.post("", response_model=VehicleTypeOut, status_code=status.HTTP_201_CREATED)
def create_vehicle_type(
    payload: VehicleTypeCreate,
    db: Session = Depends(get_db),
    _current_user=Depends(require_role(UserRole.ADMIN)),
):
    if db.query(VehicleType).filter(VehicleType.ten_loai == payload.ten_loai).first():
        raise HTTPException(status_code=400, detail="Loại xe đã tồn tại")

    vtype = VehicleType(**payload.model_dump())
    db.add(vtype)
    db.commit()
    db.refresh(vtype)
    return vtype


@router.patch("/{vtype_id}", response_model=VehicleTypeOut)
def update_vehicle_type(
    vtype_id: int,
    payload: VehicleTypeUpdate,
    db: Session = Depends(get_db),
    _current_user=Depends(require_role(UserRole.ADMIN)),
):
    vtype = db.query(VehicleType).filter(VehicleType.id == vtype_id).first()
    if not vtype:
        raise HTTPException(status_code=404, detail="Không tìm thấy loại xe")

    update_data = payload.model_dump(exclude_unset=True)

    new_name = update_data.get("ten_loai")
    if new_name:
        existing = (
            db.query(VehicleType)
            .filter(VehicleType.ten_loai == new_name, VehicleType.id != vtype_id)
            .first()
        )
        if existing:
            raise HTTPException(status_code=400, detail="Loại xe đã tồn tại")

    for field, value in update_data.items():
        setattr(vtype, field, value)

    db.commit()
    db.refresh(vtype)
    return vtype


@router.patch("/{vtype_id}/deactivate", response_model=VehicleTypeOut)
def deactivate_vehicle_type(
    vtype_id: int,
    db: Session = Depends(get_db),
    _current_user=Depends(require_role(UserRole.ADMIN)),
):
    vtype = db.query(VehicleType).filter(VehicleType.id == vtype_id).first()
    if not vtype:
        raise HTTPException(status_code=404, detail="Không tìm thấy loại xe")

    vtype.is_active = False
    db.commit()
    db.refresh(vtype)
    return vtype