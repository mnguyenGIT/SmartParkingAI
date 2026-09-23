import enum


class UserRole(str, enum.Enum):
    ADMIN = "admin"        # QUẢN LÝ
    NHANVIEN = "nhanvien"  # NHÂN VIÊN BÃI XE


class SpotStatus(str, enum.Enum):
    TRONG = "trong"
    DA_DAT = "da_dat"
    BAO_TRI = "bao_tri"


class SessionStatus(str, enum.Enum):
    DANG_GUI = "dang_gui"
    DA_RA = "da_ra"
    SU_CO = "su_co"


class AIFunction(str, enum.Enum):
    AI_01 = "AI-01"
    AI_02 = "AI-02"
    AI_03 = "AI-03"


class ReviewStatus(str, enum.Enum):
    PENDING = "pending"
    REVIEWED = "reviewed"
    REJECTED = "rejected"