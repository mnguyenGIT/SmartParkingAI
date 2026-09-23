"""
Script tạo dữ liệu mẫu cho SmartParkingAI.
Chạy: python scripts/seed_data.py   (đứng ở thư mục backend/, đã activate venv)
An toàn khi chạy nhiều lần — sẽ tự bỏ qua nếu dữ liệu đã tồn tại.
"""
import sys
from datetime import date
from pathlib import Path

# Cho phép import "app.*" khi chạy script này trực tiếp từ thư mục backend/
sys.path.append(str(Path(__file__).resolve().parent.parent))
sys.stdout.reconfigure(encoding="utf-8")

from passlib.context import CryptContext

from app.database import Base, engine, SessionLocal
from app import models
from app.models.user import User
from app.models.enums import UserRole, SpotStatus
from app.models.vehicle_type import VehicleType
from app.models.zone import Zone
from app.models.parking_spot import ParkingSpot
from app.models.pricing_plan import PricingPlan

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(raw_password: str) -> str:
    return pwd_context.hash(raw_password)


def seed():
    Base.metadata.create_all(bind=engine)  # đảm bảo đủ bảng trước khi seed
    db = SessionLocal()

    try:
        # ---------- 1. Tài khoản mẫu ----------
        if db.query(User).count() == 0:
            admin = User(
                username="admin",
                password_hash=hash_password("Admin@123"),
                full_name="Quản lý bãi xe",
                role=UserRole.ADMIN,
            )
            nhanvien = User(
                username="nhanvien",
                password_hash=hash_password("NhanVien@123"),
                full_name="Nhân viên trực ca",
                role=UserRole.NHANVIEN,
            )
            db.add_all([admin, nhanvien])
            db.commit()
            print("✔ Đã tạo 2 tài khoản mẫu: admin / nhanvien")
        else:
            print("… Bảng users đã có dữ liệu, bỏ qua.")

        # ---------- 2. Loại xe ----------
        if db.query(VehicleType).count() == 0:
            xe_may = VehicleType(ten_loai="Xe máy", mo_ta="Xe gắn máy, xe tay ga")
            o_to = VehicleType(ten_loai="Ô tô", mo_ta="Xe 4 chỗ, 7 chỗ")
            db.add_all([xe_may, o_to])
            db.commit()
            print("✔ Đã tạo 2 loại xe: Xe máy, Ô tô")
        else:
            print("… Bảng loai_xe đã có dữ liệu, bỏ qua.")

        xe_may = db.query(VehicleType).filter_by(ten_loai="Xe máy").first()
        o_to = db.query(VehicleType).filter_by(ten_loai="Ô tô").first()

        # ---------- 3. Khu vực ----------
        if db.query(Zone).count() == 0:
            khu_a = Zone(ten_khu_vuc="Khu A", mo_ta="Khu vực dành cho xe máy")
            khu_b = Zone(ten_khu_vuc="Khu B", mo_ta="Khu vực dành cho ô tô")
            db.add_all([khu_a, khu_b])
            db.commit()
            print("✔ Đã tạo 2 khu vực: Khu A, Khu B")
        else:
            print("… Bảng khu_vuc đã có dữ liệu, bỏ qua.")

        khu_a = db.query(Zone).filter_by(ten_khu_vuc="Khu A").first()
        khu_b = db.query(Zone).filter_by(ten_khu_vuc="Khu B").first()

        # ---------- 4. Vị trí đỗ ----------
        if db.query(ParkingSpot).count() == 0:
            spots = [
                ParkingSpot(ma_vi_tri="A-01", khu_vuc_id=khu_a.id, loai_xe_id=xe_may.id,
                            trang_thai=SpotStatus.TRONG, is_active=True),
                ParkingSpot(ma_vi_tri="A-02", khu_vuc_id=khu_a.id, loai_xe_id=xe_may.id,
                            trang_thai=SpotStatus.TRONG, is_active=True),
                ParkingSpot(ma_vi_tri="A-03", khu_vuc_id=khu_a.id, loai_xe_id=xe_may.id,
                            trang_thai=SpotStatus.TRONG, is_active=True),
                ParkingSpot(ma_vi_tri="B-01", khu_vuc_id=khu_b.id, loai_xe_id=o_to.id,
                            trang_thai=SpotStatus.TRONG, is_active=True),
                ParkingSpot(ma_vi_tri="B-02", khu_vuc_id=khu_b.id, loai_xe_id=o_to.id,
                            trang_thai=SpotStatus.TRONG, is_active=True),
            ]
            db.add_all(spots)
            db.commit()
            print(f"✔ Đã tạo {len(spots)} vị trí đỗ (A-01..A-03, B-01..B-02)")
        else:
            print("… Bảng vi_tri_do đã có dữ liệu, bỏ qua.")

        # ---------- 5. Bảng giá ----------
        if db.query(PricingPlan).count() == 0:
            gia = [
                PricingPlan(loai_xe_id=xe_may.id, don_gia_gio=5000, don_gia_ngay=50000,
                            hieu_luc_tu=date.today()),
                PricingPlan(loai_xe_id=o_to.id, don_gia_gio=20000, don_gia_ngay=200000,
                            hieu_luc_tu=date.today()),
            ]
            db.add_all(gia)
            db.commit()
            print("✔ Đã tạo bảng giá cho Xe máy (5.000đ/giờ) và Ô tô (20.000đ/giờ)")
        else:
            print("… Bảng bang_gia đã có dữ liệu, bỏ qua.")

        print("\n=== HOÀN TẤT SEED DATA ===")
        print("Tài khoản test:")
        print("  QUẢN LÝ  -> username: admin     | password: Admin@123")
        print("  NHÂN VIÊN -> username: nhanvien  | password: NhanVien@123")

    finally:
        db.close()


if __name__ == "__main__":
    seed()