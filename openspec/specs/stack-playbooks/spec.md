# stack-playbooks Specification

## Purpose

Cung cấp hướng dẫn viết unit test riêng cho từng stack được hỗ trợ, để test sinh ra đúng chuẩn cộng đồng của stack đó và chạy được bằng công cụ của chính dự án.

## Requirements

### Requirement: Mỗi stack hỗ trợ có một playbook
Hệ thống SHALL cung cấp một playbook cho mỗi stack: Java Spring Boot, Node.js, Python, Angular, ReactJS, VueJS, Android Java native, iOS native Swift, Flutter.

#### Scenario: Chọn playbook
- **WHEN** pha phân tích đã xác định stack của module
- **THEN** agent nạp đúng playbook của stack đó để sinh test

### Requirement: Nội dung tối thiểu của playbook
Mỗi playbook MUST mô tả: cách nhận diện stack; bộ công cụ test mặc định khi dự án chưa có; vị trí và quy ước đặt tên file test mặc định; pattern test cho các loại đơn vị điển hình của stack; cách mock/stub dependency; lệnh chạy test đơn lẻ và toàn bộ; lệnh đo coverage; các lỗi thường gặp và cách xử lý.

#### Scenario: Playbook đầy đủ
- **WHEN** kiểm tra một playbook bất kỳ
- **THEN** playbook có đủ tất cả các mục nội dung tối thiểu

### Requirement: Test là unit test cô lập
Test sinh ra MUST là unit test: cô lập đơn vị đang test khỏi mạng, database thật, file system thật, thiết bị/emulator và thời gian hệ thống, bằng cách mock/stub/fake. Test MUST chạy được lặp lại với kết quả ổn định.

#### Scenario: Service gọi repository và API ngoài
- **WHEN** đơn vị mục tiêu phụ thuộc vào database hoặc HTTP client
- **THEN** test thay các dependency đó bằng mock/stub và không mở kết nối thật

#### Scenario: Logic phụ thuộc thời gian
- **WHEN** đơn vị mục tiêu dùng thời gian hiện tại hoặc giá trị ngẫu nhiên
- **THEN** test kiểm soát các giá trị đó để kết quả tất định

### Requirement: Phạm vi case của mỗi đơn vị
Với mỗi đơn vị mục tiêu, test SHALL bao phủ luồng chính, các nhánh điều kiện, giá trị biên, input không hợp lệ và các trường hợp lỗi/exception mà đơn vị đó xử lý hoặc ném ra.

#### Scenario: Hàm có nhánh xử lý lỗi
- **WHEN** đơn vị mục tiêu ném exception hoặc trả lỗi với input không hợp lệ
- **THEN** có ít nhất một test khẳng định hành vi lỗi đó

### Requirement: Assertion có ý nghĩa
Test MUST khẳng định hành vi quan sát được (giá trị trả về, trạng thái, tương tác với dependency, UI render/sự kiện). Test MUST NOT chỉ gọi code mà không có assertion, và MUST NOT khẳng định lại đúng giá trị vừa được mock mà không qua xử lý của đơn vị.

#### Scenario: Test không có assertion
- **WHEN** agent rà soát test vừa sinh
- **THEN** mọi test case có ít nhất một assertion về hành vi của đơn vị
