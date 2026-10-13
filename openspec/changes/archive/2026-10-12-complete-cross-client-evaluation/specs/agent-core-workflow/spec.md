# Spec Delta

## ADDED Requirements

### Requirement: Không can thiệp tiến trình ngoài phiên
Agent MUST NOT dừng, tắt hay gửi tín hiệu tới tiến trình mà chính agent không khởi chạy trong phiên, kể cả khi tiến trình đó có vẻ thuộc về dự án. Agent MUST NOT chọn tiến trình để dừng chỉ dựa vào tên hay danh sách tiến trình của hệ thống. Khi một lệnh test hoặc lệnh build mà agent đã chạy bị treo, agent SHALL dùng cách giới hạn hoặc dừng gắn với chính lệnh đó. Nếu không làm được, agent SHALL báo cho người dùng thay vì tự dừng tiến trình khác.

#### Scenario: Lệnh test của agent bị treo
- **WHEN** một lệnh test do agent khởi chạy không kết thúc sau thời gian hợp lý
- **THEN** agent chỉ dừng tiến trình do chính lệnh đó tạo ra hoặc dùng giới hạn thời gian của lệnh, rồi ghi việc test bị treo vào báo cáo

#### Scenario: Thấy tiến trình lạ đang chạy
- **WHEN** agent thấy trong danh sách tiến trình của hệ thống một tiến trình cùng loại với công cụ test (ví dụ `node`, `java` hay `python`) mà agent không khởi chạy
- **THEN** agent không dừng tiến trình đó; nếu nó cản trở việc kiểm chứng, agent báo cho người dùng và đánh dấu test bị ảnh hưởng là "chưa kiểm chứng" kèm lý do
