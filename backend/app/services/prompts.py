"""Template prompt AI cho SmartParkingAI."""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

SYSTEM_PROMPT = (
    "Bạn là trợ lý phân tích bãi đỗ xe cho hệ thống SmartParkingAI.\n"
    "NHIỆM VỤ: Tóm tắt hoặc trả lời dựa trên dữ liệu số liệu được cung cấp trong prompt.\n"
    "RÀNG BUỘC BẰT BUỘC:\n"
    "- Không tự tạo, không suy đoán bất kỳ con số nào ngoài dữ liệu được cung cấp.\n"
    "- Nếu dữ liệu không đủ để trả lời, phải nói rõ 'không đủ dữ liệu', không được bịa.\n"
    "- Trả lời bằng tiếng Việt, ngắn gọn trong 2-4 câu, không markdown, không liệt kê dài dòng.\n"
)

def get_traffic_report_prompt(days: int, traffic_data: list) -> str:
    """Tạo user prompt cho AI-01: báo cáo lưu lượng."""
    return (
        f"Dữ liệu lưu lượng {days} ngày gần đây (ngày, số lượt, doanh thu): {traffic_data}. "
        "Hãy tóm tắt ngắn gọn xu hướng lưu lượng và doanh thu."
    )

def get_ask_prompt(question: str, context: dict) -> str:
    """Tạo user prompt cho AI-02: hỏi đáp quản trị."""
    return (
        f"Dữ liệu thống kê {context.get('days', 7)} ngày gần nhất: {context}. "
        f"Câu hỏi: {question}. "
        "Chỉ trả lời dựa trên dữ liệu trên, nếu không đủ dữ liệu hãy nói rõ là không đủ dữ liệu."
    )

def get_staffing_prompt(so_nhan_vien: int, hourly_data: list) -> str:
    """Tạo user prompt cho AI-03: gợi ý nhân sự."""
    return (
        f"Dữ liệu lưu lượng theo khung giờ: {hourly_data}. "
        f"Số nhân viên hiện có: {so_nhan_vien}. "
        "Hãy gợi ý khung giờ nào cần tăng cường nhân sự, kèm lý do ngắn gọn."
    )
