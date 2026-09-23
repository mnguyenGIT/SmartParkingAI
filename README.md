# SmartParkingAI

## HỆ THỐNG QUẢN LÝ BÃI ĐỖ XE CÓ TÍCH HỢP AI

SmartParkingAI là hệ thống quản lý bãi đỗ xe được xây dựng nhằm hỗ trợ quản lý khu vực đỗ xe, vị trí đỗ, phương tiện, lượt gửi xe, phí gửi xe và khách hàng vé tháng. Hệ thống tích hợp AI cục bộ thông qua Ollama để hỗ trợ tổng hợp báo cáo, hỏi đáp dữ liệu quản lý và đề xuất nhân sự.

> **Lưu ý:** AI chỉ đóng vai trò hỗ trợ. Các nghiệp vụ quan trọng như điều kiện nhận xe, phân bổ vị trí, tính phí và thay đổi trạng thái xe được xử lý bởi Business Logic của hệ thống, không giao quyền quyết định cho AI.

---

## 1. Công nghệ sử dụng

### Backend
- Python
- FastAPI
- Uvicorn
- SQLAlchemy ORM
- SQLite
- JWT + RBAC
- Pytest

### Frontend
- React
- Vite
- Tailwind CSS
- Axios

### AI
- Ollama
- Qwen 2.5 3B (`qwen2.5:3b`)
- Giao tiếp với Ollama thông qua HTTP API

---

## 2. Kiến trúc tổng quát

```text
┌─────────────────────────────┐
│       React Frontend        │
│       Vite + Tailwind       │
│         Port 5173           │
└──────────────┬──────────────┘
               │ Axios / REST API
               ▼
┌─────────────────────────────┐
│       FastAPI Backend       │
│         Port 8000           │
│       Business Logic        │
└───────┬─────────────┬───────┘
        │             │
        ▼             ▼
┌──────────────┐  ┌──────────────────┐
│    SQLite    │  │    AI Gateway    │
│  SQLAlchemy  │  │ app/services/    │
└──────────────┘  │  ai_gateway.py   │
                  └────────┬─────────┘
                           │ HTTP
                           ▼
                  ┌──────────────────┐
                  │      Ollama      │
                  │   Qwen 2.5 3B    │
                  │    Port 11434     │
                  └──────────────────┘
```

AI Gateway là lớp trung gian duy nhất gọi Ollama. Điều này giúp tách phần AI khỏi Business Logic và dễ xử lý timeout, lỗi kết nối và fallback.

---

## 3. Các chức năng chính

### Quản lý hệ thống
- Đăng nhập và phân quyền người dùng.
- Phân quyền `admin` và `nhanvien`.
- Quản lý khu vực.
- Quản lý vị trí đỗ xe.
- Quản lý loại xe.
- Quản lý bảng giá.
- Quản lý khách hàng vé tháng.

### Quản lý lượt gửi xe
- Kiểm tra điều kiện nhận xe.
- Tự động tìm vị trí đỗ phù hợp.
- Check-in xe.
- Check-out xe.
- Tính phí dựa trên loại xe và thời gian gửi.
- Tra cứu lượt gửi xe.
- Theo dõi lịch sử trạng thái.

### AI
Hệ thống có 3 nhóm chức năng AI:

- **AI-01:** Báo cáo tình hình/traffic theo dữ liệu bãi xe.
- **AI-02:** Hỏi đáp dữ liệu quản lý.
- **AI-03:** Gợi ý nhân sự dựa trên thời gian cao điểm.

AI được thiết kế để không tự tạo số liệu khi dữ liệu đầu vào không đủ.

---

## 4. Các Business Rules quan trọng

Hệ thống áp dụng các quy tắc nghiệp vụ độc lập với AI:

- **BR1:** Vị trí đỗ phải tồn tại và đang hoạt động.
- **BR2:** Vị trí đỗ phải đang trống.
- **BR3:** Loại xe phải phù hợp với vị trí đỗ.
- **BR4:** Một biển số không được có hai lượt gửi đang mở cùng lúc.
- **BR5:** Phí gửi xe được tính theo loại xe và thời gian gửi thực tế; vé tháng có thể được miễn/giảm phí theo chính sách.

Các Business Rules này được xử lý bởi Backend và không phụ thuộc vào kết quả của AI.

---

## 5. Cấu trúc thư mục

```text
SmartParkingAI/
├── backend/
│   ├── app/
│   │   ├── ...
│   │   └── services/
│   │       └── ai_gateway.py
│   ├── ...
│   └── smartparking.db
│
├── frontend/
│   ├── src/
│   ├── ...
│   └── package.json
│
├── docs/
│
├── README.md
├── .gitignore
├── package.json
├── package-lock.json
└── vite.config.js
```

Cấu trúc thực tế có thể có thêm các file/module phục vụ từng chức năng.

---

## 6. Yêu cầu môi trường

Cần cài đặt:

1. Python 3.x
2. Node.js và npm
3. Ollama
4. Model Qwen 2.5 3B

Kiểm tra Ollama:

```bash
ollama --version
```

Kiểm tra model:

```bash
ollama list
```

Nếu chưa có model:

```bash
ollama pull qwen2.5:3b
```

Khởi động Ollama và bảo đảm dịch vụ chạy tại:

```text
http://127.0.0.1:11434
```

---

## 7. Chạy Backend

Mở Terminal tại thư mục:

```text
SmartParkingAI/backend
```

Tạo và kích hoạt môi trường ảo:

### Windows

```bash
python -m venv .venv
.venv\Scripts\activate
```

Cài các thư viện cần thiết nếu dự án có `requirements.txt`:

```bash
pip install -r requirements.txt
```

Chạy FastAPI:

```bash
uvicorn app.main:app --reload --port 8000
```

Backend mặc định:

```text
http://127.0.0.1:8000
```

Swagger API:

```text
http://127.0.0.1:8000/docs
```

---

## 8. Chạy Frontend

Mở một Terminal khác tại:

```text
SmartParkingAI/frontend
```

Cài dependency:

```bash
npm install
```

Chạy frontend:

```bash
npm run dev
```

Frontend mặc định chạy tại:

```text
http://localhost:5173
```

---

## 9. Thứ tự khởi động đề nghị

Để chạy đầy đủ hệ thống:

```text
1. Khởi động Ollama
        ↓
2. Kiểm tra Qwen 2.5 3B
        ↓
3. Chạy FastAPI Backend
        ↓
4. Chạy React Frontend
        ↓
5. Mở trình duyệt tại http://localhost:5173
```

Nếu chỉ cần kiểm tra API, có thể sử dụng Swagger tại:

```text
http://127.0.0.1:8000/docs
```

---

## 10. AI Gateway

Backend sử dụng `app/services/ai_gateway.py` làm lớp giao tiếp với Ollama.

Thông tin kết nối dự kiến:

```text
Ollama:
http://127.0.0.1:11434/api/generate

Model:
qwen2.5:3b
```

Gateway có cơ chế xử lý lỗi/timeout để hệ thống không bị phụ thuộc hoàn toàn vào AI.

AI không được phép trực tiếp:
- quyết định nhận hoặc từ chối xe;
- tự thay đổi trạng thái vị trí;
- tự tính phí nghiệp vụ;
- tự mở/khóa vị trí;
- thay thế Business Logic.

---

## 11. Cơ sở dữ liệu

Dự án sử dụng SQLite và SQLAlchemy ORM.

Các bảng chính gồm:

- `users`
- `loai_xe`
- `khu_vuc`
- `vi_tri_do`
- `bang_gia`
- `khach_hang_ve_thang`
- `luot_gui_xe`
- `lich_su_trang_thai`
- `ai_results`

Database phục vụ môi trường phát triển/demo là:

```text
smartparking.db
```

---

## 12. Kiểm thử

Các chức năng quan trọng cần kiểm tra gồm:

- Đăng nhập và phân quyền.
- BR1 đến BR5.
- Check-in.
- Check-out.
- Tính phí.
- Vé tháng.
- Tra cứu lượt gửi.
- Các API AI-01, AI-02 và AI-03.
- Trường hợp AI timeout hoặc không khả dụng.
- Trường hợp dữ liệu không đủ cho AI.

---

## 13. Lưu ý khi nộp bài

Không nên đưa các thư mục/file sinh ra trong quá trình cài đặt vào file ZIP nếu không cần thiết:

```text
node_modules/
.venv/
__pycache__/
*.pyc
.git/
```

Không đưa thông tin bí mật hoặc API key thật vào `.env`.

Nên giữ lại các file cấu hình cần thiết như:

```text
package.json
package-lock.json
requirements.txt
README.md
.gitignore
```

để người khác có thể cài đặt và chạy lại dự án.

---

## 14. Thông tin dự án

**Tên đề tài:** Hệ thống quản lý bãi đỗ xe có tích hợp AI (SmartParkingAI)

**Mục tiêu:** Xây dựng hệ thống quản lý bãi đỗ xe kết hợp AI cục bộ nhằm hỗ trợ báo cáo, hỏi đáp dữ liệu và đề xuất nhân sự.

**AI Engine:** Ollama + Qwen 2.5 3B

**Backend:** FastAPI

**Frontend:** React + Vite + Tailwind CSS

**Database:** SQLite + SQLAlchemy

---

## 15. Ghi chú

Đây là README hướng dẫn chạy và mô tả tổng quan dự án. Các thông tin chi tiết về yêu cầu, thiết kế, kiến trúc, Business Rules, AI và kiểm thử được trình bày trong tài liệu báo cáo của nhóm.
