from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.deps import get_db, require_role
from app.models.enums import AIFunction, UserRole
from app.schemas.ai import (
    AskRequest,
    AskResponse,
    StaffingSuggestionRequest,
    StaffingSuggestionResponse,
    TrafficReportResponse,
)
from app.services.ai_gateway import AIGatewayError, call_ollama
from app.services.report_service import get_daily_traffic, get_hourly_distribution, log_ai_result

router = APIRouter(prefix="/ai", tags=["AI"])

SYSTEM_PROMPT = (
    "Bạn là trợ lý phân tích bãi đỗ xe cho hệ thống SmartParkingAI.\n"
    "NHIỆM VỤ: Tóm tắt hoặc trả lời dựa trên dữ liệu số liệu được cung cấp trong prompt.\n"
    "RÀNG BUỘC BẮT BUỘC:\n"
    "- Không tự tạo, không suy đoán bất kỳ con số nào ngoài dữ liệu được cung cấp.\n"
    "- Nếu dữ liệu không đủ để trả lời, phải nói rõ 'không đủ dữ liệu', không được bịa.\n"
    "- Trả lời bằng tiếng Việt, ngắn gọn trong 2-4 câu, không markdown, không liệt kê dài dòng.\n"
)


@router.post("/traffic-report", response_model=TrafficReportResponse)
def traffic_report(
    days: int = Query(default=7, ge=1, le=90),
    db: Session = Depends(get_db),
    _current_user=Depends(require_role(UserRole.ADMIN)),
):
    """AI-01: Sinh báo cáo lưu lượng theo ngày/tuần."""
    data = get_daily_traffic(db, days=days)

    if not data:
        summary = "Chưa có dữ liệu lượt gửi xe trong khoảng thời gian này."
    else:
        user_prompt = (
            f"Dữ liệu lưu lượng {days} ngày gần đây (ngày, số lượt, doanh thu): {data}. "
            "Hãy tóm tắt ngắn gọn xu hướng lưu lượng và doanh thu."
        )
        try:
            summary = call_ollama(SYSTEM_PROMPT, user_prompt)
        except AIGatewayError as e:
            summary = f"[AI tạm thời không khả dụng: {e}] Vui lòng xem số liệu thô bên dưới."

    log_ai_result(db, AIFunction.AI_01, {"days": days, "data": data}, summary)
    return TrafficReportResponse(summary=summary, data=data)


@router.post("/ask", response_model=AskResponse)
def ask(
    payload: AskRequest,
    days: int = 7,
    db: Session = Depends(get_db),
    _current_user=Depends(require_role(UserRole.ADMIN)),
):
    """AI-02: Hỏi đáp quản trị dựa trên dữ liệu thống kê đã tổng hợp."""
    daily = get_daily_traffic(db, days=days)
    hourly = get_hourly_distribution(db, days=days)
    context = {"luu_luong_theo_ngay": daily, "luu_luong_theo_gio": hourly}

    if not daily and not hourly:
        answer = "Chưa có đủ dữ liệu để trả lời câu hỏi này."
    else:
        user_prompt = (
            f"Dữ liệu thống kê {days} ngày gần đây: {context}. "
            f"Câu hỏi: {payload.question}. "
            "Chỉ trả lời dựa trên dữ liệu trên, nếu không đủ dữ liệu hãy nói rõ là không đủ dữ liệu."
        )
        try:
            answer = call_ollama(SYSTEM_PROMPT, user_prompt)
        except AIGatewayError as e:
            answer = f"AI tạm thời không khả dụng: {e}"

    log_ai_result(
        db, AIFunction.AI_02, {"question": payload.question, "context": context}, answer
    )
    return AskResponse(answer=answer, data_used=context)


@router.post("/staffing-suggestion", response_model=StaffingSuggestionResponse)
def staffing_suggestion(
    payload: StaffingSuggestionRequest,
    days: int = 7,
    db: Session = Depends(get_db),
    _current_user=Depends(require_role(UserRole.ADMIN)),
):
    """AI-03: Gợi ý bố trí nhân sự theo khung giờ cao điểm."""
    hourly = get_hourly_distribution(db, days=days)

    if not hourly:
        suggestion = "Chưa có đủ dữ liệu lưu lượng theo khung giờ để đưa ra gợi ý."
    else:
        user_prompt = (
            f"Dữ liệu lưu lượng theo khung giờ ({days} ngày gần đây): {hourly}. "
            f"Số nhân viên hiện có: {payload.so_nhan_vien_hien_co}. "
            "Hãy gợi ý khung giờ nào cần tăng cường nhân sự, kèm lý do ngắn gọn."
        )
        try:
            suggestion = call_ollama(SYSTEM_PROMPT, user_prompt)
        except AIGatewayError as e:
            suggestion = f"[AI tạm thời không khả dụng: {e}] Vui lòng xem số liệu thô bên dưới."

    log_ai_result(
        db,
        AIFunction.AI_03,
        {"days": days, "hourly": hourly, "so_nhan_vien": payload.so_nhan_vien_hien_co},
        suggestion,
    )
    return StaffingSuggestionResponse(suggestion=suggestion, data=hourly)