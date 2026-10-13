# test-reporting Specification

## Purpose

Cung cấp cho người dùng một báo cáo rõ ràng, trung thực về kết quả mỗi lần chạy agent, để họ review và quyết định bước tiếp theo.

## Requirements

### Requirement: Báo cáo cuối phiên
Kết thúc mỗi phiên, agent SHALL xuất báo cáo gồm: phạm vi và stack đã xử lý; danh sách file test đã tạo/sửa; số test case theo từng đơn vị; kết quả chạy (pass / fail / chưa kiểm chứng); các thay đổi cấu hình/dependency đã áp dụng.

#### Scenario: Phiên thành công
- **WHEN** agent kết thúc phiên
- **THEN** báo cáo được hiển thị cho người dùng và có đủ các mục bắt buộc

### Requirement: Coverage trước và sau
Khi dự án đo được coverage, báo cáo SHALL ghi coverage của phạm vi mục tiêu trước và sau phiên. Khi không đo được, báo cáo MUST nói rõ lý do thay vì bỏ trống hoặc ước đoán.

#### Scenario: Đo được coverage
- **WHEN** công cụ coverage của dự án chạy thành công
- **THEN** báo cáo hiển thị số liệu trước/sau của phạm vi mục tiêu

#### Scenario: Không đo được coverage
- **WHEN** dự án không có hoặc không chạy được công cụ coverage
- **THEN** báo cáo ghi "không đo được" kèm lý do

### Requirement: Ghi nhận vấn đề và khuyến nghị
Báo cáo SHALL liệt kê: đơn vị không viết được test và lý do; gợi ý refactor để tăng khả năng test; nghi vấn bug phát hiện được; test cũ đang fail có sẵn; test không hoàn thành sau khi hết số vòng tự sửa, gồm trạng thái ("đã gỡ" hoặc "đã disable"), lỗi cuối cùng và mã test đã thử.

#### Scenario: Có đơn vị khó test
- **WHEN** agent bỏ qua một đơn vị vì không thể test mà không refactor
- **THEN** báo cáo nêu đơn vị đó, lý do và gợi ý refactor cụ thể

### Requirement: Báo cáo trung thực
Báo cáo MUST NOT khẳng định test pass hay coverage đạt nếu chưa được chạy/đo thực tế trong phiên.

#### Scenario: Test chưa chạy
- **WHEN** test được sinh nhưng không chạy được
- **THEN** báo cáo ghi rõ trạng thái "chưa kiểm chứng" cho các test đó

### Requirement: Lưu báo cáo ra file
Agent SHALL cho phép lưu báo cáo thành file Markdown trong dự án đích khi người dùng yêu cầu, tại vị trí mặc định đã được tài liệu hóa hoặc do người dùng chỉ định.

#### Scenario: Người dùng yêu cầu lưu báo cáo
- **WHEN** người dùng yêu cầu lưu báo cáo
- **THEN** báo cáo được ghi ra file Markdown và đường dẫn được thông báo cho người dùng
