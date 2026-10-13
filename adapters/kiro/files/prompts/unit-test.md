Dùng skill `{{SKILL_NAME}}` để viết unit test cho dự án hiện tại, làm đúng quy trình 5 pha của skill.

Tham số lấy từ tin nhắn của người dùng, dạng `key=value` (ví dụ `scope=src/services mode=auto coverage-target=80`) hoặc ngôn ngữ tự nhiên. Các tham số hỗ trợ: `scope` (bắt buộc), `mode`, `coverage-target`, `max-fix-attempts`, `failed-test-policy`, `save-report`.

Nếu chưa có `scope`, hỏi người dùng trước khi làm bất cứ việc gì khác. Với `mode=confirm` (mặc định), dừng sau pha lập kế hoạch và chờ người dùng xác nhận trước khi ghi file.
