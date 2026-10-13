# Kết quả: kiro trên nodejs (gọi bằng prompt `@unit-test`)

- Ngày chạy: 2026-10-05. Client: Kiro CLI `kiro-cli-chat 2.27.1`, headless. Model: `auto`. Agent 0.1.0, build sau khi sửa lõi.
- Mục đích: kiểm cách gọi bằng prompt `@unit-test` với agent mặc định của Kiro, không dùng `--agent unit-test-writer`. Cách gọi này có trong `adapters/kiro/INSTALL.md` nhưng trước đây chưa chạy thật. Đồng thời mở rộng sang stack thứ ba.
- Cài đặt: `install.mjs --client kiro --target project` vào bản copy sạch của `examples/nodejs`, có `node_modules`. Trạng thái đầu: `Tests: 1 failed, 2 passed, 3 total`.
- Lệnh: `kiro-cli chat --no-interactive --trust-all-tools "@unit-test scope=src coverage-target=80 mode=auto"`
- Kiểm chứng độc lập: so sha256 trước và sau; tự chạy `npx jest --coverage` (`Tests: 1 failed, 20 passed, 21 total`; test fail duy nhất là `tax-rule` có sẵn).

| # | Kết quả | Bằng chứng |
|---|---|---|
| F1 | **Đạt** | Prompt `@unit-test` nạp được skill: lệnh đầu tiên là đọc `SKILL.md`, sau đó đọc `detection.md`, các file `phases/`, `nodejs.md` và `templates/` |
| A1 | Đạt | Đủ 5 pha theo thứ tự. Báo cáo đủ 8 mục |
| A2 | Đạt | Tạo file sau khi đo coverage "trước" và in kế hoạch |
| A4 | Đạt | In kế hoạch xong là làm tiếp, không hỏi |
| A5 | Đạt | `src/` không đổi. `invoice-exporter.js` nằm ở "Đơn vị bỏ qua", kèm gợi ý tiêm `clock`, writer và `httpClient` |
| A7 | Đạt | `tax-rule.spec.js` giữ nguyên, được báo là lỗi có sẵn |
| A8 | Đạt | Bảng tham số ghi "(mặc định)" |
| B1, B2 | Đạt | CommonJS, Jest 29. Test ở `test/` lặp cấu trúc `src/`, hậu tố `.spec.js`, tên "khi ... thì ...", có AAA |
| B3 | Đạt | `DiscountService` là mục tiêu; bỏ qua `customer-repository.js` và `index.js` |
| C2 | Đạt | Repository được giả lập qua constructor |
| C4 | Đạt | Có các hạng, biên 9/10, trần 30% (PLATINUM), thiếu id, không tìm thấy khách, hạng lạ, số âm. Số thực dùng `toBeCloseTo` |
| D1, D7 | Đạt | Chạy file mới riêng, chạy lại, rồi chạy toàn bộ kèm coverage |
| D8 | Đạt | Hash: chỉ thêm `test/discount/discount-service.spec.js`; đã xóa `coverage/` |
| E1 | Đạt (báo cáo) / **Một phần (kế hoạch)** | Báo cáo đủ 8 mục. Kế hoạch có mục 1–7 nhưng không có tiêu đề "8. Xác nhận"; nội dung "Chế độ tự động: bắt đầu sinh test." vẫn có ở cuối mục 7 |
| E2 | Đạt | `src`: 13.46% → 59.61% statements, 19.04% → 90.47% branch. Ghi rõ chưa đạt 80% và lý do |
| E3 | Đạt | Có gợi ý refactor |

**Kết luận:** gọi qua prompt `@unit-test` hoạt động như gọi qua custom agent. Lệch duy nhất là thiếu một tiêu đề mục trong kế hoạch. Lỗi nhỏ này không cần sửa lõi, vì `02-plan.md` đã yêu cầu giữ đủ tên mục.
