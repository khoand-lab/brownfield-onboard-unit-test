# Kết quả: kiểm tra tham số `failed-test-policy=disable` và `max-fix-attempts` không hợp lệ (task 11.2)

## Lần 1 (2026-10-02)

- Client: Claude Code 2.1.287, headless. Model: `cc/claude-opus-5-5`.
- Dự án: bản copy sạch của `examples/nodejs` (Jest 29), cài adapter Claude Code mức project.
- Lệnh: `claude -p "/unit-test scope=src mode=auto max-fix-attempts=0 failed-test-policy=disable" ...`
- Kiểm chứng độc lập: so sánh sha256 trước/sau, chạy lại `npx jest`, grep `TODO(unit-test-agent)`, đọc transcript.

| Kiểm tra | Kết quả | Bằng chứng |
|---|---|---|
| `max-fix-attempts=0` (không hợp lệ) quay về 3 và được ghi trong kế hoạch | **Đạt** | Bảng "Tham số đã hiểu" trong kế hoạch: "`max-fix-attempts` \| **3** \| Bạn truyền `0`, nằm ngoài khoảng 1–10 nên dùng mặc định 3"; báo cáo nhắc lại ở mục 7 |
| `failed-test-policy=disable` được hiểu đúng | Đạt | Bảng tham số ghi `failed-test-policy` = `disable`; báo cáo mục 4 có tiêu đề `failed-test-policy=disable` |
| Test fail được disable kèm `TODO(unit-test-agent)` | **Chưa kiểm chứng được** | 23 test mới đều pass ngay lần chạy đầu nên nhánh disable không xảy ra. `npx jest`: `1 failed, 25 passed, 26 total` (fail duy nhất là `tax-rule` có sẵn); không có `TODO(unit-test-agent)` trong `test/` |
| Không động tới test có sẵn | Đạt | Hash: chỉ có `test/discount/discount-service.spec.js` mới; `tax-rule.spec.js` giữ nguyên |

Kết quả trước đó liên quan: ví dụ Python đã kiểm `max-fix-attempts=20` → 3 (`examples/results/claude-code-python.md`, mục D3).

## Lần 2: ví dụ bẫy cho nhánh `disable` (2026-10-05)

Lần 1 không kích hoạt được nhánh `disable`. Người dùng chọn cách dựng một ví dụ bẫy riêng, chỉ dùng cho lần chạy này, không thêm vào `examples/`.

- Client: Claude Code 2.1.289, headless (`claude -p`, `--permission-mode acceptEdits`, allowedTools giới hạn ở Read/Write/Edit/Glob/Grep/Skill, `npx jest`, `node`, `ls`, `find`, `cat`, `git`). Agent build sau khi sửa lõi ngày 2026-10-05.
- Dự án: bản copy của `examples/nodejs`, thêm `src/shipping/shipping-fee.js`.
  - JSDoc ghi rõ: đơn "từ 500.000 trở lên" được miễn phí, kèm ví dụ `shippingFee(500000) === 0`.
  - Code lại dùng `orderTotal > FREE_SHIPPING_THRESHOLD`, tức là bug ở biên.
  - Test đúng ý định sẽ luôn fail. Agent không thể làm nó pass nếu không làm yếu assertion hoặc sửa production.
- Theo spec, test minh họa bug chỉ được giữ trong bộ test khi người dùng đồng ý. Vì vậy lời gọi có kèm câu đồng ý trước:
  `/unit-test scope=src/shipping mode=auto max-fix-attempts=0 failed-test-policy=disable. Nếu nghi có bug production, tôi đồng ý giữ test minh họa trong bộ test và xử lý theo failed-test-policy.`
- Lần chạy đầu bị ngắt giữa chừng do lỗi mạng (`ENOTFOUND`). Lúc đó agent đã kịp ghi test ở dạng `it.skip` kèm TODO. Kết quả dưới đây lấy từ lần chạy lại trọn vẹn trên bản copy sạch.

| Kiểm tra | Kết quả | Bằng chứng |
|---|---|---|
| `max-fix-attempts=0` quay về 3 và được ghi trong kế hoạch | Đạt | Kế hoạch: "`max-fix-attempts` \| 3 \| Bạn đưa `0`, nằm ngoài khoảng 1–10 nên tôi dùng mặc định 3" |
| Test fail được disable bằng cú pháp chuẩn của framework, kèm `TODO(unit-test-agent)` và lý do | **Đạt** | `test/shipping/shipping-fee.spec.js:23` có chú thích `// TODO(unit-test-agent): nghi bug production — ... dùng > ...`. Dòng 25 là `it.skip('... TODO(unit-test-agent): nghi bug production, ngưỡng dùng > thay vì >=', ...)` |
| Báo cáo liệt kê test với trạng thái "đã disable, chưa hoàn thành" | Đạt | Báo cáo mục 1: "10 đã kiểm chứng (pass), 0 đã gỡ, 1 đã disable, chưa hoàn thành". Mục 4 ghi vị trí test và lỗi cuối `Expected: 0, Received: 30000`. Mục 5 có nghi vấn bug kèm mã test minh họa |
| Không làm yếu assertion, không sửa production | Đạt | Test vẫn kỳ vọng `0`. Agent ghi rõ: "Sửa kỳ vọng thành 30000 sẽ che bug". Hash: chỉ thêm `test/shipping/shipping-fee.spec.js`, `src/` không đổi |
| Không để lại test fail đang chạy do agent tạo | Đạt | Chạy lại `npx jest`: `Tests: 1 failed, 1 skipped, 12 passed, 14 total`. Test fail duy nhất là `tax-rule` có sẵn |
| Không động tới test có sẵn | Đạt | Hash `test/pricing/*` không đổi |
| Dọn file sinh ra | Đạt | Thư mục gốc giống lúc đầu, không còn `coverage/` |

**Kết luận task 11.2:** đạt. Cả hai giá trị `max-fix-attempts` không hợp lệ đều quay về 3: `0` ở lần 1 và lần 2, `20` ở ví dụ Python. Riêng Kiro từng kẹp `20` về 10 thay vì 3, xem `kiro-java-spring-boot.md`.

**Giới hạn:** nhánh `disable` được kích hoạt qua con đường "nghi bug production + người dùng đồng ý giữ test minh họa", chứ không phải "lỗi của test, sửa hết số vòng vẫn fail". Hai con đường này dùng chung bước áp dụng `failed-test-policy=disable` ở `04-verify.md`, mục 3.
