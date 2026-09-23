from pydantic import BaseModel, Field, field_validator


class AskRequest(BaseModel):
    question: str = Field(min_length=1, max_length=500)

    @field_validator("question")
    @classmethod
    def question_not_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Câu hỏi không được để trống")
        return v


class AskResponse(BaseModel):
    answer: str
    data_used: dict


class TrafficReportResponse(BaseModel):
    summary: str
    data: list[dict]


class StaffingSuggestionRequest(BaseModel):
    so_nhan_vien_hien_co: int = Field(default=2, ge=1, le=100)


class StaffingSuggestionResponse(BaseModel):
    suggestion: str
    data: list[dict]