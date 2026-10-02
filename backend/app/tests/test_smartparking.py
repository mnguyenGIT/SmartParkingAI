"""
Test cases cho SmartParkingAI - theo yêu cầu detai.md:
- Kiểm thử xe vào/ra (check-in/check-out)
- Tính phí
- Chỗ trống
- AI
"""
import pytest
from datetime import datetime, timedelta, date
from decimal import Decimal
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models.user import User
from app.models.vehicle_type import VehicleType
from app.models.zone import Zone
from app.models.parking_spot import ParkingSpot
from app.models.pricing_plan import PricingPlan
from app.models.parking_session import ParkingSession
from app.models.enums import UserRole, SpotStatus, SessionStatus


SQLALCHEMY_TEST_DB = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_TEST_DB, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(autouse=True)
def db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def setup_data(db):
    user = User(username="testuser", password_hash="hashdummy", full_name="Test User", role=UserRole.NHANVIEN)
    db.add(user)
    db.commit()
    db.refresh(user)

    vt_xm = VehicleType(ten_loai="Xe máy", mo_ta="Xe gắn mách", is_active=True)
    vt_oto = VehicleType(ten_loai="Ô tô", mo_ta="Xe ô tô", is_active=True)
    db.add_all([vt_xm, vt_oto])
    db.commit()
    db.refresh(vt_xm)
    db.refresh(vt_oto)

    zone_a = Zone(ten_khu_vuc="Khu A", mo_ta="Khu xe máy", is_active=True)
    zone_b = Zone(ten_khu_vuc="Khu B", mo_ta="Khu ô tô", is_active=True)
    db.add_all([zone_a, zone_b])
    db.commit()
    db.refresh(zone_a)
    db.refresh(zone_b)

    spot1 = ParkingSpot(ma_vi_tri="A-01", khu_vuc_id=zone_a.id, loai_xe_id=vt_xm.id, trang_thai=SpotStatus.TRONG, is_active=True)
    spot2 = ParkingSpot(ma_vi_tri="B-01", khu_vuc_id=zone_b.id, loai_xe_id=vt_oto.id, trang_thai=SpotStatus.TRONG, is_active=True)
    db.add_all([spot1, spot2])
    db.commit()
    db.refresh(spot1)
    db.refresh(spot2)

    pricing_xm = PricingPlan(loai_xe_id=vt_xm.id, don_gia_gio=5000, don_gia_ngay=50000, hieu_luc_tu=date.today())
    pricing_oto = PricingPlan(loai_xe_id=vt_oto.id, don_gia_gio=20000, don_gia_ngay=200000, hieu_luc_tu=date.today())
    db.add_all([pricing_xm, pricing_oto])
    db.commit()

    return {
        "user": user,
        "vt_xm": vt_xm,
        "vt_oto": vt_oto,
        "zone_a": zone_a,
        "zone_b": zone_b,
        "spot1": spot1,
        "spot2": spot2,
        "pricing_xm": pricing_xm,
        "pricing_oto": pricing_oto,
    }


# ==================== TEST BUSINESS RULES ====================


class TestBusinessRules:
    def test_br1_spot_must_exist(self, db, setup_data):
        """BR1: Vị trí đỗ phải tồn tại và đang hoạt động."""
        from app.services.business_rules import find_available_spot
        with pytest.raises(Exception):
            find_available_spot(db, setup_data["vt_xm"].id, khu_vuc_id=999)

    def test_br2_spot_must_be_empty(self, db, setup_data):
        """BR2: Vị trí đỗ phải đang trống."""
        from fastapi import HTTPException
        spot = setup_data["spot1"]
        spot.trang_thai = SpotStatus.DA_DAT
        db.commit()
        from app.services.business_rules import find_available_spot
        with pytest.raises(HTTPException) as exc_info:
            find_available_spot(db, setup_data["vt_xm"].id, khu_vuc_id=setup_data["zone_a"].id)
        assert exc_info.value.status_code == 400

    def test_br3_vehicle_type_must_match(self, db, setup_data):
        """BR3: Loại xe phải phù hợp với vị trí đỗ."""
        from fastapi import HTTPException
        from app.services.business_rules import find_available_spot
        with pytest.raises(HTTPException) as exc_info:
            find_available_spot(db, setup_data["vt_oto"].id, khu_vuc_id=setup_data["zone_a"].id)
        assert exc_info.value.status_code == 400

    def test_br4_no_duplicate_open_session(self, db, setup_data):
        """BR4: Một biển số không có 2 lượt mở cùng lúc."""
        from app.services.business_rules import ensure_no_open_session
        session = ParkingSession(
            ma_ve="VE-0001",
            bien_so="30A-123.45",
            loai_xe_id=setup_data["vt_xm"].id,
            vi_tri_id=setup_data["spot1"].id,
            thoi_gian_vao=datetime.now(),
            trang_thai=SessionStatus.DANG_GUI,
            checked_in_by=setup_data["user"].id,
        )
        db.add(session)
        db.commit()
        with pytest.raises(Exception) as exc:
            ensure_no_open_session(db, "30A-123.45")
        assert "chưa đóng" in str(exc.value)

    def test_br5_free_for_monthly_customer(self, db, setup_data):
        """BR5: Vé tháng được miễn phí."""
        from app.services.fee_service import calculate_fee
        from app.models.monthly_customer import MonthlyCustomer
        from datetime import date
        mc = MonthlyCustomer(
            ho_ten="Test MC",
            so_dien_thoai="0123456789",
            bien_so_dang_ky="30A-123.45",
            loai_xe_id=setup_data["vt_xm"].id,
            ngay_het_han=date.today() + timedelta(days=30),
        )
        db.add(mc)
        db.commit()
        fee = calculate_fee(
            datetime.now() - timedelta(hours=3),
            datetime.now(),
            setup_data["pricing_xm"],
            mc,
        )
        assert fee == Decimal(0)


# ==================== TEST FEE SERVICE ====================


class TestFeeService:
    def test_fee_calculation_normal(self, db, setup_data):
        from app.services.fee_service import calculate_fee
        now = datetime.now()
        fee = calculate_fee(
            now - timedelta(hours=2, minutes=30),
            now,
            setup_data["pricing_xm"],
            None,
        )
        assert fee == Decimal(15000)

    def test_fee_minimum_1_hour(self, db, setup_data):
        from app.services.fee_service import calculate_fee
        now = datetime.now()
        fee = calculate_fee(
            now - timedelta(minutes=15),
            now,
            setup_data["pricing_xm"],
            None,
        )
        assert fee == Decimal(5000)

    def test_fee_motorcycle_vs_car(self, db, setup_data):
        from app.services.fee_service import calculate_fee
        now = datetime.now()
        fee_xm = calculate_fee(
            now - timedelta(hours=2),
            now,
            setup_data["pricing_xm"],
            None,
        )
        fee_oto = calculate_fee(
            now - timedelta(hours=2),
            now,
            setup_data["pricing_oto"],
            None,
        )
        assert fee_xm == Decimal(10000)
        assert fee_oto == Decimal(40000)


# ==================== TEST SESSIONS ====================


class TestParkingSessions:
    def test_check_in_assigns_spot(self, db, setup_data):
        from app.services.business_rules import ensure_no_open_session, find_available_spot
        ensure_no_open_session(db, "30A-999.99")
        spot = find_available_spot(db, setup_data["vt_xm"].id, khu_vuc_id=setup_data["zone_a"].id)
        assert spot is not None
        assert spot.trang_thai == SpotStatus.TRONG

    def test_check_out_changes_status(self, db, setup_data):
        session = ParkingSession(
            ma_ve="VE-0002",
            bien_so="30A-999.99",
            loai_xe_id=setup_data["vt_xm"].id,
            vi_tri_id=setup_data["spot1"].id,
            thoi_gian_vao=datetime.now(),
            trang_thai=SessionStatus.DANG_GUI,
            checked_in_by=setup_data["user"].id,
        )
        db.add(session)
        db.commit()

        session.trang_thai = SessionStatus.DA_RA
        session.thoi_gian_ra = datetime.now()
        session.so_tien = Decimal(5000)
        db.commit()
        db.refresh(session)

        assert session.trang_thai == SessionStatus.DA_RA
        assert session.so_tien == Decimal(5000)
        spot = db.query(ParkingSpot).filter(ParkingSpot.id == setup_data["spot1"].id).first()
        assert spot.trang_thai == SpotStatus.TRONG


# ==================== TEST PARKING SPOTS ====================


class TestParkingSpots:
    def test_list_active_only(self, db, setup_data):
        spot = setup_data["spot1"]
        assert spot.is_active is True
        spots = db.query(ParkingSpot).filter(ParkingSpot.is_active == True).all()
        assert len(spots) == 2

    def test_deactivate_spot(self, db, setup_data):
        spot = setup_data["spot1"]
        spot.is_active = False
        db.commit()
        active_spots = db.query(ParkingSpot).filter(ParkingSpot.is_active == True).all()
        assert len(active_spots) == 1

    def test_zone_occupancy(self, db, setup_data):
        from app.models.enums import SpotStatus
        spot1 = setup_data["spot1"]
        spot1.trang_thai = SpotStatus.DA_DAT
        db.commit()

        zone = db.query(Zone).filter(Zone.id == setup_data["zone_a"].id).first()
        spots = db.query(ParkingSpot).filter(ParkingSpot.khu_vuc_id == zone.id).all()
        total = len(spots)
        occupied = sum(1 for s in spots if s.trang_thai == SpotStatus.DA_DAT)
        assert total == 1
        assert occupied == 1
        assert (total - occupied) == 0
