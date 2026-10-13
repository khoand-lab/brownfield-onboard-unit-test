# agent-core-workflow Specification

## Purpose

Định nghĩa quy trình lõi, nguyên tắc an toàn và hợp đồng input/output của agent viết unit test cho dự án brownfield. Toàn bộ lõi độc lập với bất kỳ AI client nào.

## Requirements

### Requirement: Quy trình làm việc theo các pha cố định
Agent SHALL thực hiện lần lượt các pha: (1) phân tích dự án, (2) lập kế hoạch test, (3) sinh test, (4) chạy và kiểm chứng, (5) báo cáo. Agent MUST NOT sinh test trước khi hoàn tất pha phân tích.

#### Scenario: Chạy đầy đủ quy trình
- **WHEN** người dùng yêu cầu viết unit test cho một phạm vi trong dự án
- **THEN** agent thực hiện đủ 5 pha theo đúng thứ tự và kết thúc bằng một báo cáo

#### Scenario: Không bỏ qua pha phân tích
- **WHEN** agent chưa xác định được stack và test framework của dự án
- **THEN** agent MUST NOT tạo file test nào và phải hoàn tất phân tích (hoặc hỏi người dùng) trước

### Requirement: Xác nhận kế hoạch trước khi sinh test
Sau pha lập kế hoạch, agent SHALL trình bày danh sách đơn vị code sẽ viết test, file test dự kiến tạo/sửa và mọi dependency test cần thêm. Agent MUST chờ người dùng xác nhận trước khi ghi file, trừ khi người dùng đã bật rõ chế độ tự động.

#### Scenario: Chế độ mặc định có xác nhận
- **WHEN** agent hoàn tất kế hoạch test và người dùng chưa bật chế độ tự động
- **THEN** agent hiển thị kế hoạch và dừng lại chờ xác nhận

#### Scenario: Chế độ tự động
- **WHEN** người dùng đã bật chế độ tự động trong yêu cầu
- **THEN** agent hiển thị kế hoạch và tiếp tục sinh test mà không dừng chờ

### Requirement: Không sửa code production
Agent MUST NOT sửa, xóa hay đổi tên file code production. Agent chỉ được tạo/sửa file test, fixture/helper dành riêng cho test, và cấu hình test/build khi người dùng đã chấp thuận.

#### Scenario: Code khó test
- **WHEN** một đơn vị code không thể test nếu không refactor (ví dụ phụ thuộc cứng, static/singleton không mock được)
- **THEN** agent không sửa code đó mà ghi nó vào báo cáo kèm gợi ý refactor

#### Scenario: Cần thêm dependency test
- **WHEN** dự án thiếu thư viện test cần thiết
- **THEN** agent đề xuất thay đổi file build/manifest và chỉ áp dụng sau khi người dùng chấp thuận

### Requirement: Không phá test hiện có
Agent MUST NOT xóa, vô hiệu hóa (skip/ignore) hay làm yếu assertion của test đã có trong dự án.

#### Scenario: Test cũ đang fail
- **WHEN** trong lúc kiểm chứng phát hiện test có sẵn đang fail
- **THEN** agent giữ nguyên test đó và ghi nhận vào báo cáo là lỗi có sẵn, không phải do agent gây ra

### Requirement: Không can thiệp tiến trình ngoài phiên
Agent MUST NOT dừng, tắt hay gửi tín hiệu tới tiến trình mà chính agent không khởi chạy trong phiên, kể cả khi tiến trình đó có vẻ thuộc về dự án. Agent MUST NOT chọn tiến trình để dừng chỉ dựa vào tên hay danh sách tiến trình của hệ thống. Khi một lệnh test hoặc lệnh build mà agent đã chạy bị treo, agent SHALL dùng cách giới hạn hoặc dừng gắn với chính lệnh đó. Nếu không làm được, agent SHALL báo cho người dùng thay vì tự dừng tiến trình khác.

#### Scenario: Lệnh test của agent bị treo
- **WHEN** một lệnh test do agent khởi chạy không kết thúc sau thời gian hợp lý
- **THEN** agent chỉ dừng tiến trình do chính lệnh đó tạo ra hoặc dùng giới hạn thời gian của lệnh, rồi ghi việc test bị treo vào báo cáo

#### Scenario: Thấy tiến trình lạ đang chạy
- **WHEN** agent thấy trong danh sách tiến trình của hệ thống một tiến trình cùng loại với công cụ test (ví dụ `node`, `java` hay `python`) mà agent không khởi chạy
- **THEN** agent không dừng tiến trình đó; nếu nó cản trở việc kiểm chứng, agent báo cho người dùng và đánh dấu test bị ảnh hưởng là "chưa kiểm chứng" kèm lý do

### Requirement: Input của agent
Agent SHALL nhận các tham số: phạm vi mục tiêu (toàn dự án, module, thư mục, file, class/hàm, hoặc các file thay đổi so với một git ref), coverage mục tiêu (tùy chọn), chế độ (có xác nhận / tự động), số vòng tự sửa tối đa `max-fix-attempts` (mặc định 3, khoảng 1 đến 10) và cách xử lý test fail sau khi hết số vòng `failed-test-policy` (`remove` mặc định / `disable`). Tham số không được cung cấp SHALL dùng giá trị mặc định đã được tài liệu hóa.

#### Scenario: Chỉ cung cấp phạm vi
- **WHEN** người dùng chỉ chỉ định một file làm phạm vi
- **THEN** agent dùng giá trị mặc định cho các tham số còn lại và giới hạn việc sinh test trong file đó

#### Scenario: Phạm vi theo thay đổi git
- **WHEN** người dùng chỉ định phạm vi là các file thay đổi so với một git ref
- **THEN** agent chỉ nhắm tới các file production có thay đổi so với ref đó

### Requirement: Độc lập với AI client
Nội dung lõi (quy trình, nguyên tắc, playbook) SHALL được viết bằng Markdown thuần và MUST NOT tham chiếu tên tool, API hay cú pháp riêng của một AI client cụ thể. Các thao tác cần thiết SHALL được mô tả ở dạng hành động chung (đọc file, tìm kiếm, ghi file, chạy lệnh shell).

#### Scenario: Dùng lõi trong client mới
- **WHEN** một AI client bất kỳ có khả năng đọc file, ghi file và chạy lệnh shell nạp nội dung lõi
- **THEN** agent thực hiện được quy trình mà không cần sửa nội dung lõi
