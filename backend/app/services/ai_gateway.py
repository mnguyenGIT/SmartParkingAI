import httpx

from app.config import OLLAMA_HOST, OLLAMA_MODEL

TIMEOUT_SECONDS = 15.0


class AIGatewayError(Exception):
    """Raised khi AI không phản hồi được (timeout, lỗi kết nối, model lỗi)."""


def call_ollama(system_prompt: str, user_prompt: str) -> str:
    """
    Gọi Ollama qua HTTP local. Đây là nơi DUY NHẤT trong toàn bộ
    codebase được phép gọi AI Provider — mọi router phải đi qua đây,
    không được tự gọi httpx tới Ollama ở nơi khác.
    """
    url = f"{OLLAMA_HOST}/api/generate"
    payload = {
        "model": OLLAMA_MODEL,
        "system": system_prompt,
        "prompt": user_prompt,
        "stream": False,
    }

    try:
        response = httpx.post(url, json=payload, timeout=TIMEOUT_SECONDS)
        response.raise_for_status()
    except httpx.TimeoutException as exc:
        raise AIGatewayError("AI phản hồi quá lâu, vui lòng thử lại sau") from exc
    except httpx.ConnectError as exc:
        raise AIGatewayError("Không kết nối được tới dịch vụ AI (Ollama chưa chạy?)") from exc
    except httpx.HTTPStatusError as exc:
        raise AIGatewayError(f"Dịch vụ AI trả lỗi: {exc.response.status_code}") from exc

    data = response.json()
    return data.get("response", "").strip()