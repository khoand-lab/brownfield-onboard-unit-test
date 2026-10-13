# Proposal

## Why

Các dự án brownfield thường có độ phủ unit test thấp, test cũ không đồng nhất và nhiều code khó test. Viết test bổ sung bằng tay tốn công, còn AI tool dùng "trơn" thì hay sinh ra test sai quy ước dự án, không chạy được, hoặc phải sửa code production. Team cần một agent chuyên biệt: hiểu codebase có sẵn, viết test đúng chuẩn của từng stack và tự kiểm chứng test chạy xanh. Agent phải dùng được trên nhiều AI client khác nhau, không bị khóa vào một công cụ.

## What Changes

- Thêm **lõi agent độc lập với AI client** (tool-agnostic): bộ prompt/instruction và playbook dạng Markdown thuần, không phụ thuộc API hay tính năng riêng của bất kỳ AI tool nào.
- Thêm quy trình chuẩn cho agent: **phân tích dự án → lập kế hoạch test → sinh test → chạy test → tự sửa test lỗi → báo cáo**.
- Thêm khả năng **nhận diện dự án brownfield**: stack, build tool, test framework, thư viện mock và quy ước test đang có (cách đặt tên, cấu trúc thư mục, style assertion), để test sinh ra hòa hợp với test hiện tại.
- Thêm **playbook theo từng stack**:
  - Backend: Java Spring Boot, Node.js, Python
  - Frontend: Angular, ReactJS, VueJS
  - Mobile: Android Java native, iOS native Swift, Flutter
- Thêm cơ chế **kiểm chứng và tự sửa**: chạy test bằng lệnh của dự án, phân tích lỗi, sửa test trong giới hạn số vòng lặp; mặc định không sửa code production.
- Thêm **báo cáo kết quả**: số test đã tạo, pass/fail, coverage trước/sau (nếu đo được), các chỗ khó test và gợi ý refactor.
- Thêm **adapter đóng gói cho 3 AI client đầu tiên**: Claude Code (plugin/subagent), Kiro và Codex. Kiến trúc adapter cho phép bổ sung client khác sau này mà không phải sửa lõi.

## Capabilities

### New Capabilities
- `agent-core-workflow`: Quy trình và instruction lõi của agent, độc lập với AI client (các bước, nguyên tắc an toàn, giới hạn phạm vi, định dạng input/output).
- `project-analysis`: Nhận diện stack, build tool, test framework, thư viện mock/assertion và quy ước test sẵn có trong dự án brownfield; chọn phạm vi mục tiêu cần viết test.
- `stack-playbooks`: Hướng dẫn viết unit test cho từng stack (Spring Boot, Node.js, Python, Angular, React, Vue, Android Java, iOS Swift, Flutter): framework mặc định, pattern mock, lệnh chạy test và đo coverage.
- `test-verification`: Chạy test đã sinh, phân tích lỗi, tự sửa có giới hạn vòng lặp, bảo vệ code production khỏi bị sửa ngoài ý muốn.
- `test-reporting`: Báo cáo tổng hợp: test đã tạo, kết quả chạy, coverage trước/sau, code khó test và khuyến nghị.
- `client-adapters`: Đóng gói và cài đặt lõi agent cho Claude Code, Kiro, Codex; hợp đồng adapter để mở rộng thêm client khác.

### Modified Capabilities
<!-- Không có: dự án chưa có spec nào. -->

## Impact

- **Mã nguồn mới** trong repo này: thư mục lõi (instruction + playbook Markdown), thư mục adapter theo từng client và tài liệu cài đặt/sử dụng.
- **Không ảnh hưởng runtime** của các dự án đích. Agent chỉ thêm file test và, khi được cho phép, thêm dependency test (ví dụ JUnit/Mockito, Jest/Vitest, pytest, Jasmine/Karma, XCTest, flutter_test).
- **Phụ thuộc bên ngoài**: định dạng cấu hình của từng AI client (Claude Code plugin/agent/skill, Kiro steering/agent, Codex `AGENTS.md`/prompt/skill). Khi các định dạng này thay đổi thì chỉ phải cập nhật adapter, lõi giữ nguyên.
- **Môi trường chạy test**: agent cần toolchain của từng stack (JDK/Gradle/Maven, Node, Python, Android SDK, Xcode, Flutter SDK) để kiểm chứng. Nếu thiếu, agent phải báo rõ thay vì bỏ qua âm thầm.
