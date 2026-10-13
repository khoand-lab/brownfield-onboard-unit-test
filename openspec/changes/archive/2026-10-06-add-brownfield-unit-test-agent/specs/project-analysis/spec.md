# Spec Delta

## Purpose

Giúp agent hiểu dự án brownfield trước khi viết test: nhận diện stack, công cụ build/test, quy ước test sẵn có và chọn đơn vị code mục tiêu phù hợp.

## ADDED Requirements

### Requirement: Nhận diện stack
Agent SHALL nhận diện stack của dự án (hoặc của từng module trong monorepo) dựa trên file manifest/build và cấu trúc mã nguồn. Các stack được hỗ trợ: Java Spring Boot, Node.js, Python, Angular, ReactJS, VueJS, Android Java native, iOS native Swift, Flutter.

#### Scenario: Dự án một stack
- **WHEN** dự án chứa manifest đặc trưng của một stack được hỗ trợ
- **THEN** agent xác định đúng stack đó và chọn playbook tương ứng

#### Scenario: Monorepo nhiều stack
- **WHEN** dự án chứa nhiều module thuộc các stack khác nhau
- **THEN** agent nhận diện stack cho từng module và áp dụng playbook riêng cho từng module nằm trong phạm vi

#### Scenario: Stack không được hỗ trợ
- **WHEN** agent không nhận diện được stack hoặc stack nằm ngoài danh sách hỗ trợ
- **THEN** agent báo rõ cho người dùng và MUST NOT sinh test theo phỏng đoán

### Requirement: Nhận diện công cụ build và test đang dùng
Agent SHALL xác định build tool, test framework, thư viện mock/assertion, công cụ đo coverage và lệnh chạy test mà dự án đang dùng. Khi dự án đã có test framework, agent MUST dùng framework đó thay vì đưa framework khác vào.

#### Scenario: Dự án đã có test framework
- **WHEN** dự án đã cấu hình một test framework
- **THEN** mọi test sinh ra dùng framework đó

#### Scenario: Dự án chưa có test nào
- **WHEN** dự án chưa có test framework
- **THEN** agent đề xuất bộ công cụ mặc định theo playbook của stack và cần người dùng chấp thuận trước khi thêm

### Requirement: Học quy ước test sẵn có
Agent SHALL lấy mẫu các test hiện có để rút ra quy ước: vị trí và cách đặt tên file test, cách đặt tên test case, cấu trúc (ví dụ Arrange-Act-Assert, Given-When-Then), style assertion, cách tạo mock/fixture và các helper dùng chung. Test sinh ra MUST tuân theo các quy ước này.

#### Scenario: Có quy ước rõ ràng
- **WHEN** các test hiện có dùng thống nhất một quy ước đặt tên và cấu trúc
- **THEN** test mới dùng cùng quy ước đó và tái sử dụng helper/fixture sẵn có nếu phù hợp

#### Scenario: Quy ước không nhất quán
- **WHEN** các test hiện có dùng nhiều quy ước khác nhau
- **THEN** agent chọn quy ước phổ biến nhất trong module mục tiêu và ghi lựa chọn đó vào kế hoạch

### Requirement: Chọn và ưu tiên đơn vị mục tiêu
Trong phạm vi được giao, agent SHALL liệt kê các đơn vị code (class, hàm, component, service…) và ưu tiên đơn vị chứa logic nghiệp vụ, chưa có test hoặc coverage thấp. Agent SHALL bỏ qua code sinh tự động, file cấu hình thuần và code không có logic.

#### Scenario: Ưu tiên code chưa có test
- **WHEN** phạm vi có cả đơn vị đã có test và chưa có test
- **THEN** kế hoạch ưu tiên đơn vị chưa có test hoặc coverage thấp

#### Scenario: Bỏ qua code sinh tự động
- **WHEN** phạm vi chứa code sinh tự động hoặc chỉ khai báo dữ liệu, không có logic
- **THEN** agent không đưa các đơn vị đó vào kế hoạch

### Requirement: Kiểm tra môi trường chạy test
Agent SHALL kiểm tra toolchain cần thiết để chạy test của stack. Nếu toolchain thiếu, agent MUST báo cho người dùng trước khi sinh test và nói rõ rằng test sẽ không được kiểm chứng bằng cách chạy.

#### Scenario: Thiếu toolchain
- **WHEN** môi trường thiếu toolchain cần thiết (ví dụ chưa cài SDK của stack)
- **THEN** agent thông báo thiếu gì và hỏi người dùng muốn dừng hay tiếp tục sinh test mà không kiểm chứng
