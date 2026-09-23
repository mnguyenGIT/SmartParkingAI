from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_db, require_role
from app.models.enums import UserRole
from app.models.monthly_customer import MonthlyCustomer
from app.schemas.monthly_customer import MonthlyCustomerCreate, MonthlyCustomerOut

router = APIRouter(prefix="/monthly-customers", tags=["Monthly Customers"])


@router.get("", response_model=list[MonthlyCustomerOut])
def list_monthly_customers(db: Session = Depends(get_db)):
    return db.query(MonthlyCustomer).all()


@router.post("", response_model=MonthlyCustomerOut, status_code=status.HTTP_201_CREATED)
def create_monthly_customer(
    payload: MonthlyCustomerCreate,
    db: Session = Depends(get_db),
    _current_user=Depends(require_role(UserRole.NHANVIEN, UserRole.ADMIN)),
):
    if db.query(MonthlyCustomer).filter(
        MonthlyCustomer.bien_so_dang_ky == payload.bien_so_dang_ky
    ).first():
        raise HTTPException(status_code=400, detail="Biển số này đã đăng ký vé tháng")

    customer = MonthlyCustomer(**payload.model_dump())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer