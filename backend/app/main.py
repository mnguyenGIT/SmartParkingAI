from fastapi import FastAPI
from app.database import Base, engine
from app import models  # noqa: F401
from app.routers import auth, zones, vehicle_types, pricing, monthly_customers, sessions, ai

# 1. Tạo app TRƯỚC
app = FastAPI(
    title="SmartParkingAI API",
    description="Hệ thống quản lý bãi đỗ xe tích hợp AI",
    version="1.0.0",
)
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# 2. Tạo bảng
Base.metadata.create_all(bind=engine)

# 3. Đăng ký router — phải sau khi "app" đã tồn tại
app.include_router(auth.router)
app.include_router(zones.router)
app.include_router(vehicle_types.router)
app.include_router(pricing.router)
app.include_router(monthly_customers.router)
app.include_router(sessions.router)
app.include_router(ai.router)


@app.get("/")
def root():
    return {"message": "SmartParkingAI API is running!"}


@app.get("/health")
def health_check():
    return {"status": "ok"}