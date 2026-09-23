from pydantic import BaseModel

from app.models.enums import UserRole


class LoginRequest(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    id: int
    username: str
    full_name: str
    role: UserRole

    class Config:
        from_attributes = True  # cho phép tạo từ SQLAlchemy model


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut