Hệ thống quản lý bãi đỗ xe có tích hợp AI
1. Mô tả bài toán

Bãi đỗ xe cần quản lý vị trí đỗ, vé xe, phương tiện, lượt vào/ra, phí gửi xe và tình trạng chỗ trống. Quản lý thủ công gây khó kiểm soát chỗ trống, tính phí và thống kê lưu lượng. Hệ thống cần quản lý bãi đỗ xe và tích hợp AI sinh báo cáo lưu lượng, trả lời tình trạng chỗ trống và gợi ý khung giờ cao điểm.
2. Mục tiêu

- Quản lý khu vực đỗ, vị trí, xe vào/ra, vé và phí.
- Tích hợp AI để sinh báo cáo lưu lượng, tóm tắt cao điểm và hỏi đáp dữ liệu bãi xe.
- Sử dụng AI trong SDLC và có minh chứng prompt/code/test.
3. Yêu cầu chức năng
3.1. Chức năng quản lý
1. Đăng nhập và phân quyền quản lý, nhân viên bãi xe.
2. Quản lý khu vực, vị trí đỗ, loại xe.
3. Ghi nhận xe vào, xe ra, thời gian gửi.
4. Tính phí gửi xe theo loại xe và thời gian.
5. Theo dõi chỗ trống theo khu vực.
6. Tra cứu lượt gửi xe theo biển số, thời gian.
7. Quản lý vé tháng hoặc khách quen.
8. Thống kê lưu lượng, doanh thu, khung giờ cao điểm.
3.2. Chức năng AI
1. AI sinh báo cáo lưu lượng xe theo ngày/tuần.
2. AI trả lời câu hỏi quản trị như "khung giờ nào đông nhất?".
3. AI gợi ý bố trí nhân sự theo khung giờ cao điểm.
4. Yêu cầu kỹ thuật

- Backend FastAPI/Flask/Django; frontend React/Vue/HTML.
- CSDL SQLite/MySQL/PostgreSQL.
- AI Engine OpenAI/Gemini/Claude/Hugging Face/Ollama.
- Có test cho xe vào/ra, tính phí, chỗ trống và AI.
5. Dữ liệu đầu vào, đầu ra và dữ liệu hệ thống

- Dữ liệu chính: khu vực, vị trí, phương tiện, vé, lượt vào/ra, bảng giá.
- Đầu vào AI: số lượt xe, doanh thu, tỷ lệ lấp đầy, khung giờ.
- Đầu ra AI: báo cáo lưu lượng, câu trả lời phân tích, gợi ý nhân sự.

Prompt mẫu:

System: Bạn là trợ lý phân tích bãi đỗ xe. Không tự tạo số liệu, chỉ nhận xét từ dữ liệu được cung cấp.
User: Dữ liệu lưu lượng tuần này: {{parking_stats}}. Hãy tóm tắt khung giờ cao điểm và gợi ý bố trí nhân sự.
6. Hướng dẫn sử dụng AI trong từng giai đoạn SDLC

- KT1: Dùng AI phân tích nghiệp vụ vào/ra, tính phí, chỗ trống; thiết kế CSDL.
- KT2: Dùng AI sinh CRUD vị trí, vé, lượt vào/ra; debug logic tính phí.
- KT3: Dùng AI thiết kế prompt báo cáo lưu lượng; test dữ liệu rỗng/sai.
- Cuối kỳ: Dùng AI viết tài liệu, slide, báo cáo và hướng dẫn triển khai.
7. Mức độ khó

Cơ bản: Nghiệp vụ tương đối gọn, dữ liệu chủ yếu là lượt vào/ra và báo cáo thống kê.