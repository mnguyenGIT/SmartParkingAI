from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_db, require_role
from app.models.enums import UserRole
from app.models.pricing_plan import PricingPlan
from app.models.vehicle_type import VehicleType
from app.schemas.pricing import PricingPlanCreate, PricingPlanOut

router = APIRouter(prefix="/pricing", tags=["Pricing"])


@router.get("", response_model=list[PricingPlanOut])
def list_pricing(db: Session = Depends(get_db)):
    return db.query(PricingPlan).all()


@router.post("", response_model=PricingPlanOut, status_code=status.HTTP_201_CREATED)
def create_pricing(
    payload: PricingPlanCreate,
    db: Session = Depends(get_db),
    _current_user=Depends(require_role(UserRole.ADMIN)),
):
    vtype = db.query(VehicleType).filter(VehicleType.id == payload.loai_xe_id).first()
    if not vtype:
        raise HTTPException(status_code=404, detail="Loại xe không tồn tại")

    plan = PricingPlan(**payload.model_dump())
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan