# Kết quả: claude-code trên nodejs

- Ngày chạy: 2026-09-30. Client: Claude Code, chạy headless (`claude -p`). Model: `cc/claude-opus-5-5`.
- Phiên bản agent (package.json): 0.1.0
- Cài đặt: cách A (dạng rời, mức project) vào hai bản copy sạch của `examples/nodejs`, chạy `npm ci` trên bản copy. Toolchain: Node v24.16.0, npm 11.13.0, Jest 29.
- Lệnh gọi lần 1 (confirm), hai lượt trên cùng session:
  1. `claude -p "/unit-test scope=src coverage-target=80" --session-id <uuid> ...`
  2. `claude -p "đồng ý kế hoạch, làm tiếp" --resume <uuid> ...`
- Lệnh gọi lần 2 (auto): `claude -p "/unit-test scope=src coverage-target=80 mode=auto max-fix-attempts=20" ...`
- Tham số chung:
  - `--permission-mode acceptEdits`, `--max-turns 120`;
  - allowedTools: Read, Write, Edit, Glob, Grep, Skill, Agent, Task, và Bash giới hạn ở `npm`, `npx`, `node`, `ls`, `find`, `cat`, `git`, `rm -rf coverage`.
- Kiểm chứng độc lập:
  - Lấy sha256 của `src/`, `test/`, `package.json` và `package-lock.json` trước và sau mỗi lần chạy để so sánh.
  - Tự chạy `npx jest` trên cả hai bản:
    - lần 1: 27 test, 26 pass;
    - lần 2: 29 test, 28 pass;
    - test fail duy nhất ở cả hai là `tax-rule › withTax › khi có số tiền thì cộng VAT`, lỗi có sẵn.
  - Đọc transcript `.jsonl` để lấy thứ tự tool call.

| # | Lần 1 (confirm) | Lần 2 (auto) | Bằng chứng |
|---|---|---|---|
| A1 | Đạt | Đạt | Đọc `01-analyze` → `detection.md` → `playbooks/nodejs.md` → `02-plan` → `03-generate` → `04-verify` → `05-report`; kế hoạch và báo cáo đúng template |
| A2 | Đạt | Đạt | Write đầu tiên (`test/discount/discount-service.spec.js`) xuất hiện sau khi đọc mã nguồn, đo coverage "trước" và in kế hoạch |
| A3 | Đạt | Không áp dụng | Lượt 1 kết thúc bằng kế hoạch, ba lựa chọn ("đồng ý", "đồng ý + invoice", sửa); hash không đổi, dự án không có file mới |
| A4 | Không áp dụng | Đạt | In "Kế hoạch unit test" rồi Write ngay, không hỏi |
| A5 | Đạt | Đạt | Hash `src/` không đổi. `invoice-exporter.js` nằm ở "Đơn vị bỏ qua", kèm gợi ý factory `createInvoiceExporter(deps)` tiêm `now`, `writeFile`, `httpClient` |
| A6 | Đạt | Đạt | Không thêm dependency; `package.json` và `package-lock.json` giữ nguyên hash. Coverage đo bằng `jest --coverage --collectCoverageFrom`, không sửa cấu hình |
| A7 | Đạt | Đạt | `tax-rule.spec.js` giữ nguyên hash; báo cáo ghi là lỗi có sẵn (kỳ vọng 108 nhưng nhận 110, VAT 8% so với 10%) |
| A8 | Đạt | Đạt | Bảng "Tham số đã hiểu" ở đầu kế hoạch: `mode=confirm`, `max-fix-attempts=3`, `failed-test-policy=remove` là mặc định |
| A9 | Không áp dụng | Không áp dụng | Dự án mẫu không phải git repo; agent ghi nhận và tự theo dõi file mình ghi |
| B1 | Đạt | Đạt | Node.js CommonJS, npm (theo `package-lock.json`), Jest 29, `testMatch: test/**/*.spec.js` |
| B2 | Đạt | Đạt | File `test/discount/discount-service.spec.js`, `'use strict'`, `describe('discount-service')` → `describe('<hàm>')`, `it('khi ... thì ...')`, `// arrange/act/assert` |
| B3 | Đạt | Đạt | `DiscountService` là mục tiêu; bỏ qua `index.js` (lắp ráp), `customer-repository.js` (stub DB), `pricing/*` (đã 100%) |
| B4 | Đạt | Đạt | Chạy `node -v`, `npm -v`, kiểm tra `node_modules` trước khi chạy test |
| C1 | Đạt | Đạt | Chỉ đọc `playbooks/nodejs.md` |
| C2 | Đạt | Đạt | Repository giả `{ findById: jest.fn() }` tiêm qua constructor; không dùng `jest.mock`, không truy cập DB |
| C3 | Không áp dụng | Không áp dụng | Đơn vị được test không dùng thời gian. Đơn vị có dùng (`invoice-exporter.js`) bị bỏ qua đúng |
| C4 | Đạt | Đạt | Có đủ: các hạng (`it.each`), biên 9/10 đơn, **PLATINUM + thưởng bị cắt ở 30%** (`toBe(MAX_DISCOUNT)`), id rỗng/khoảng trắng/null/không phải chuỗi, không tìm thấy khách, hạng lạ, số tiền âm/NaN/không phải số, số tiền 0, làm tròn |
| C5 | Đạt | Đạt | Mọi test có `expect`; case lỗi thêm `expect(findById).not.toHaveBeenCalled()`. Tất cả `rejects` đều có `await` (đã grep kiểm tra); tỉ lệ dùng `toBeCloseTo` |
| D1 | Đạt | Đạt | Báo cáo trích kết quả `npx jest` (24 và 26 pass). Tự chạy lại cho cùng kết quả |
| D2 | Đạt | Đạt | Không cần vòng sửa nào |
| D3 | Không áp dụng | Đạt | Kế hoạch ghi: "`20`, nằm ngoài khoảng 1–10, nên dùng mặc định 3"; báo cáo nhắc lại |
| D4 | Không áp dụng | Không áp dụng | Không có test mới nào fail |
| D5 | Đạt | Đạt | `price-calculator.spec.js` và `tax-rule.spec.js` giữ nguyên hash |
| D6 | Không áp dụng | Không áp dụng | Không có nghi vấn bug production |
| D7 | Đạt | Đạt | Chạy lại với `--no-cache`, kết quả giống nhau |
| D8 | Đạt | Đạt | So sánh hash: chỉ có file mới `test/discount/discount-service.spec.js`. `coverage/` và `.tmp-cov-after` đã bị xóa. Riêng lần 1 còn sót thư mục ngoài dự án (xem vấn đề 1) |
| E1 | Đạt | Đạt | Đủ 8 mục theo `templates/report.md` |
| E2 | Đạt | Đạt | Statements 13.46% → 59.61%, branch 19.04% → 90.47%. Ghi rõ chưa đạt 80% trên toàn `src` và lý do |
| E3 | Đạt | Đạt | Có gợi ý refactor `invoice-exporter.js`. Lần 1 nêu thêm phương án test bằng spy (ước tính ~88%) để người dùng chọn |
| E4 | Đạt | Đạt | Chỉ báo pass sau khi đã chạy Jest |
| E5 | Không áp dụng | Không áp dụng | Không truyền `save-report` |
| F1 | Đạt | Đạt | Cài bằng `install.mjs --target project`; gọi bằng `/unit-test` thành công. Cách gọi qua subagent đã kiểm chứng ở lần đánh giá Java |
| F2 | Đạt | Đạt | `npm run check`: "check passed" |
| F3 | Không áp dụng | Không áp dụng | Chưa có kết quả của Kiro và Codex |

**Kết luận:**
- Không có mục nào "Không đạt".
- Hai lần chạy cho kết quả nhất quán:
  - cùng đơn vị mục tiêu, cùng quy ước, cùng coverage (59.61%);
  - cùng cách xử lý `tax-rule.spec.js` và `invoice-exporter.js`.
- Nhánh trần 30% (PLATINUM) được test ở cả hai lần. Đây là điểm chưa kiểm được ở lần đánh giá Java trước khi thêm PLATINUM.

## Vấn đề phát hiện và việc cần sửa

1. **File coverage ghi ra ngoài dự án, không xóa được.**
   - Ở lần 1, agent ghi báo cáo coverage "trước" vào `%TEMP%\jestcov-before` để dự án sạch tại điểm dừng.
   - Client không cho phép xóa ngoài thư mục dự án, nên thư mục này bị bỏ lại. Agent có báo trong kế hoạch và báo cáo, và người đánh giá đã xóa tay.
   - **Đã sửa:**
     - Thêm quy tắc vào `core/phases/01-analyze.md` mục 7: báo cáo coverage phải ghi trong dự án rồi dọn dẹp, không ghi ra ngoài.
     - Chỉnh `playbooks/python.md` cho khớp quy tắc này.
     - Build lại.
2. **Coverage-target 80% trên toàn `src` không đạt được nếu chỉ test đơn vị dễ test.** Đây là thiết kế có chủ đích của dự án mẫu. Cả hai lần đều ước lượng đúng trong kế hoạch, khoảng 60%. Lần 1 còn đưa ra lựa chọn test `invoice-exporter.js` bằng spy. Không cần sửa.
