# Proposal

## Why

Hiện nay agent `brownfield-unit-test` được đánh giá bằng tay theo `examples/EVALUATION.md`. Mỗi lượt chạy, người đánh giá phải tự copy dự án mẫu, lấy hash file, chạy lại test, `diff` test cũ, grep dấu hiệu xấu, kiểm tra thư mục build còn sót và đọc transcript. Đợt đánh giá change `add-brownfield-unit-test-agent` cần hàng chục lượt như vậy trên 3 client, nên tốn nhiều công và dễ sót. Chính các lượt kiểm chứng bằng tay đó đã phát hiện mọi lỗi thật của agent: để sót `target/`, không đo coverage "trước", kẹp giá trị tham số không hợp lệ về biên, rút gọn báo cáo. Vì vậy việc kiểm chứng cần được tự động hóa và lặp lại được mỗi khi lõi, playbook, adapter, phiên bản client hoặc model thay đổi.

## What Changes

- Thêm script `scripts/eval.mjs` (Node ≥ 18, không dùng dependency ngoài, chạy được trên Windows/macOS/Linux) để tự động hóa phần **kiểm chứng độc lập** khi đánh giá agent trên dự án mẫu:
  - copy dự án mẫu ra thư mục tạm và cài adapter của client bằng `scripts/install.mjs`;
  - chạy agent headless cho Claude Code, Kiro và Codex ở `mode=confirm` (hai lượt: lập kế hoạch, rồi xác nhận) và `mode=auto`;
  - lấy hash file trước phiên, sau lượt 1 của `mode=confirm` và sau phiên;
  - chạy lại lệnh test của dự án mẫu, so sánh test fail với trạng thái đầu;
  - `diff` các file test có sẵn để phát hiện dòng bị xóa hoặc sửa;
  - grep dấu hiệu xấu theo stack (ví dụ `@SpringBootTest`, snapshot, `.only(`);
  - kiểm tra thư mục build/coverage còn sót, đối chiếu tiêu đề kế hoạch và báo cáo với `core/templates/`;
  - xuất kết quả dạng bảng theo mã mục của `EVALUATION.md`.
- Lệnh gọi từng client (CLI, cờ quyền, cách resume phiên) và thông tin từng dự án mẫu (lệnh test, test cố ý fail, thư mục build, dấu hiệu xấu) nằm trong **file cấu hình**, không viết cứng trong script. Khi client đổi cờ hoặc khi thêm stack, chỉ cần sửa file cấu hình.
- Có chế độ `--verify-only`: người đánh giá tự chạy agent, script chỉ làm phần kiểm chứng trên thư mục đã chạy. Chế độ này dùng cho client chưa có cấu hình hoặc khi chạy agent tương tác.
- Mục cần người đọc hiểu (ví dụ C4 "đủ ca biên", C5 "assertion có ý nghĩa", E3 "gợi ý refactor hợp lý") được đánh dấu **"cần chấm tay"**, kèm trích đoạn liên quan để người chấm đọc nhanh. Script không tự kết luận các mục này.
- Thêm script `npm run eval` và cập nhật `examples/EVALUATION.md`, `README.md` để hướng dẫn dùng script.
- Không thay đổi lõi agent (`core/`), adapter hay hành vi của agent.

## Capabilities

### New Capabilities
- `agent-evaluation`: tự động hóa việc đánh giá agent trên dự án mẫu, gồm chuẩn bị bản copy, chạy agent headless theo cấu hình từng client, kiểm chứng độc lập bằng hash/test/diff/grep, phân loại mục tự chấm hoặc cần chấm tay, và xuất kết quả theo checklist.

### Modified Capabilities
<!-- Không có: change này không đổi requirement của agent hay adapter. Các spec của change add-brownfield-unit-test-agent chưa được archive vào openspec/specs/. -->

## Impact

- **Mã nguồn mới:** `scripts/eval.mjs`, file cấu hình đánh giá (client và dự án mẫu), test cho script trong `scripts/test/`.
- **Tài liệu:** `examples/EVALUATION.md`, `README.md`, `package.json` (thêm script `eval`).
- **Không ảnh hưởng** tới `core/`, `adapters/`, `dist/` hay hành vi của agent trong dự án đích.
- **Phụ thuộc môi trường khi chạy:** CLI của từng client đã đăng nhập (`claude`, `kiro-cli`, `codex`) và toolchain của từng stack mẫu (JDK/Maven, Node…). Thiếu thứ gì thì script báo bỏ qua client/stack đó, không làm hỏng cả lượt đánh giá.
- **Chi phí và an toàn:** chạy agent thật tốn hạn mức/credit của client và cần cờ quyền rộng (ví dụ `--trust-all-tools`, `danger-full-access`). Script chỉ chạy trên bản copy trong thư mục tạm, không bao giờ chạy trên `examples/` gốc.
