# client-adapters Specification

## Purpose

Đưa lõi agent vào sử dụng trên các AI client cụ thể (đợt đầu gồm Claude Code, Kiro, Codex) qua các adapter mỏng, và định nghĩa hợp đồng để bổ sung client khác mà không phải sửa lõi.

## Requirements

### Requirement: Adapter cho Claude Code
Hệ thống SHALL cung cấp adapter để cài agent vào Claude Code dưới dạng plugin, cho phép gọi agent như một subagent và qua lệnh/skill do người dùng kích hoạt.

#### Scenario: Cài và gọi trong Claude Code
- **WHEN** người dùng cài adapter Claude Code theo tài liệu và yêu cầu viết unit test cho một phạm vi
- **THEN** agent chạy quy trình lõi trong Claude Code và trả về báo cáo

### Requirement: Adapter cho Kiro
Hệ thống SHALL cung cấp adapter để cài agent vào Kiro, dùng các cơ chế cấu hình của Kiro (như steering/agent/prompt) để nạp lõi.

#### Scenario: Cài và gọi trong Kiro
- **WHEN** người dùng cài adapter Kiro theo tài liệu và yêu cầu viết unit test cho một phạm vi
- **THEN** agent chạy quy trình lõi trong Kiro và trả về báo cáo

### Requirement: Adapter cho Codex
Hệ thống SHALL cung cấp adapter để cài agent vào Codex, dùng các cơ chế cấu hình của Codex (như AGENTS.md/prompt/skill) để nạp lõi.

#### Scenario: Cài và gọi trong Codex
- **WHEN** người dùng cài adapter Codex theo tài liệu và yêu cầu viết unit test cho một phạm vi
- **THEN** agent chạy quy trình lõi trong Codex và trả về báo cáo

### Requirement: Một nguồn lõi duy nhất
Mọi adapter MUST lấy nội dung từ cùng một nguồn lõi. Adapter chỉ được chứa phần bọc đặc thù của client (metadata, định dạng file, ánh xạ tên thao tác) và MUST NOT chứa bản sao sửa tay của quy trình hay playbook.

#### Scenario: Cập nhật lõi
- **WHEN** nội dung lõi hoặc một playbook được cập nhật
- **THEN** cả ba adapter nhận thay đổi đó qua bước build/đồng bộ mà không cần sửa tay từng adapter

#### Scenario: Phát hiện adapter lệch lõi
- **WHEN** nội dung lõi trong một adapter khác với nguồn lõi
- **THEN** bước kiểm tra báo lỗi và chỉ ra adapter bị lệch

### Requirement: Hành vi nhất quán giữa các client
Với cùng một dự án, phạm vi và tham số, agent trên mọi client được hỗ trợ SHALL tuân theo cùng quy trình, cùng nguyên tắc an toàn và xuất báo cáo cùng cấu trúc.

#### Scenario: So sánh giữa client
- **WHEN** chạy agent với cùng input trên Claude Code, Kiro và Codex
- **THEN** cả ba đều thực hiện đủ các pha và báo cáo có cùng các mục bắt buộc

### Requirement: Hợp đồng để thêm client mới
Hệ thống SHALL tài liệu hóa hợp đồng adapter: khả năng tối thiểu client cần có (đọc file, ghi file, tìm kiếm, chạy lệnh shell), cách nạp lõi và playbook, cách truyền tham số input. Thêm một client mới MUST NOT yêu cầu sửa nội dung lõi.

#### Scenario: Thêm client thứ tư
- **WHEN** người phát triển thêm adapter cho một AI client mới theo hợp đồng
- **THEN** agent hoạt động trên client đó mà nội dung lõi không thay đổi

### Requirement: Hướng dẫn cài đặt
Mỗi adapter SHALL có hướng dẫn cài đặt, gỡ cài đặt và cách gọi agent, cả ở mức dự án lẫn mức người dùng (global) nếu client hỗ trợ.

#### Scenario: Làm theo hướng dẫn
- **WHEN** người dùng mới làm theo hướng dẫn cài đặt của một adapter
- **THEN** họ gọi được agent mà không cần bước cấu hình nào ngoài tài liệu
