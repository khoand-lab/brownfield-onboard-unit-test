# Kết quả: kiro trên react

- Ngày chạy: 2026-10-04. Client: Kiro CLI `kiro-cli-chat 2.27.1`, headless. Model: `auto`.
- Phiên bản agent (package.json): 0.1.0. Bản build trước khi sửa lõi ngày 2026-10-05; các chỗ sửa đó không ảnh hưởng tới kết quả dưới đây.
- Cài đặt: `install.mjs --client kiro --target project` vào bản copy sạch của `examples/react` (đã có `node_modules`). Toolchain: Node v24.16.0, Vitest 5.0.2, Windows 11.
- Lệnh gọi (auto): `kiro-cli chat --agent unit-test-writer --no-interactive --trust-all-tools "scope=src coverage-target=80 mode=auto"`
- Chỉ chạy `mode=auto`. Điểm dừng của `mode=confirm` với Kiro đã được kiểm ở `kiro-java-spring-boot.md`.
- Kiểm chứng độc lập:
  - So sha256 các file trước và sau (trừ `node_modules`, `.kiro`).
  - Tự chạy `npx vitest run --coverage.enabled --coverage.reporter=text-summary --coverage.reportOnFailure --coverage.include='src/**'`: `Tests 1 failed | 34 passed (35)`, Statements 75.71% (53/70), Branches 89.47%, Lines 76.47%. Test fail duy nhất là `tax-rule > withTax > khi có số tiền thì cộng VAT`, lỗi có sẵn.
  - Grep các test mới: không có snapshot, `jest-dom`, `toBeInTheDocument`, `.only(`, `.skip(`, `jest.`.

| # | Lần 2 (auto) | Bằng chứng |
|---|---|---|
| A1 | Đạt | Đọc `SKILL.md`, các file `phases/`, `react.md`, `detection.md`, `templates/`. Kế hoạch và báo cáo có đủ 8 mục theo template |
| A2 | Đạt | Tạo file đầu tiên sau khi đã đọc mã nguồn, đo coverage "trước" và in kế hoạch |
| A4 | Đạt | In kế hoạch xong là sinh test luôn, không hỏi |
| A5 | Đạt | Hash `src` (không tính `__tests__`) không đổi. `exportInvoice.ts` nằm ở "Đơn vị bỏ qua", kèm gợi ý tiêm clock, fetch, storage |
| A6 | Đạt | Không thêm package. Ghi rõ "không thêm jest-dom" |
| A7 | Đạt | `tax-rule.test.ts` giữ nguyên hash, báo cáo ghi là lỗi có sẵn |
| A8 | Đạt | Bảng tham số ghi "(mặc định)" cho `max-fix-attempts`, `failed-test-policy`, `save-report` |
| B1 | Đạt | React 19, Vite 8, Vitest 5.0.2 + jsdom, RTL 16, user-event 14, coverage-v8 |
| B2 | Đạt | Test đặt trong `__tests__`, import tường minh từ `vitest`, tên test "khi ... thì ..." tiếng Việt, có `// arrange/act/assert`, gọi `cleanup()` trong `afterEach` |
| B3 | Đạt | Bỏ qua `App.tsx`, `main.tsx`, `customer.ts` (chỉ khai báo kiểu) |
| B4 | Đạt | Kiểm tra `node --version`, có `node_modules` |
| C1 | Đạt | Chỉ đọc `playbooks/react.md` |
| C2 | Đạt | Mock module `customer-api` cho hook, `vi.stubGlobal('fetch')` cho API |
| C4 | Đạt | `discount.test.ts` có 15 case: các hạng, biên 9/10, trần 30%, hạng lạ, số âm/NaN/kiểu sai, làm tròn |
| C5 | Đạt | Mọi test đều có assertion có ý nghĩa; không dùng snapshot |
| D1 | Đạt | Chạy từng file test mới, rồi chạy toàn bộ |
| D2 | Đạt | Không cần vòng sửa nào |
| D5 | Đạt | Không sửa `price-calculator.test.ts` hay `tax-rule.test.ts` |
| D7 | Đạt | "Re-run stable (no flakiness: 32 passed both times)" |
| D8 | Đạt | Chỉ có 5 file test mới; đã xóa `coverage/` |
| E1 | Đạt | Đủ 8 mục |
| E2 | Đạt | `src/**`: 7.14% → 75.71% statements. Riêng phạm vi có logic: 98.14%. Ghi rõ chưa đạt 80% ở mức toàn `src` và lý do |
| E3 | Đạt | Có gợi ý refactor `exportInvoice.ts` |
| E4 | Đạt | Chỉ báo pass sau khi đã chạy |
| F1 | Đạt | Gọi bằng custom agent `unit-test-writer` |
| F2 | Đạt | `npm run check` pass |
| F3 | Đạt | Cùng đơn vị mục tiêu và đơn vị bỏ qua như Claude Code và Codex (`cross-client.md`) |

Các mục A3, A9, C3, D3, D4, D6, E5 không áp dụng cho lần chạy này: chế độ auto, không phải git repo, đơn vị được test không phụ thuộc thời gian, tham số hợp lệ, không có test fail, không nghi bug, không lưu báo cáo.

**Kết luận:** không có mục nào "Không đạt".
