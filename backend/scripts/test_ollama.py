import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.services.ai_gateway import call_ollama, AIGatewayError

if __name__ == "__main__":
    try:
        result = call_ollama(
            system_prompt="Bạn là trợ lý phân tích bãi đỗ xe. Trả lời ngắn gọn bằng tiếng Việt.",
            user_prompt="Chào bạn, bạn có thể giúp gì cho hệ thống quản lý bãi đỗ xe?",
        )
        print("=== KẾT QUẢ TỪ AI ===")
        print(result)
    except AIGatewayError as e:
        print(f"LỖI: {e}")