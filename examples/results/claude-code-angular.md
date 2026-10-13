# Kết quả: claude-code trên angular

- Ngày chạy: 2026-09-30. Client: Claude Code, chạy headless (`claude -p`). Model: `cc/claude-opus-5-5`.
- Phiên bản agent (package.json): 0.1.0
- Cài đặt: cách A (dạng rời, mức project) vào hai bản copy sạch của `examples/angular`, sau khi chạy `npm install`. Toolchain: Node v24.16.0, Angular 22 (`@angular/build:karma`), Karma + Jasmine, ChromeHeadless 154, Windows 11.
- Lệnh gọi lần 1 (confirm), hai lượt trên cùng session:
  1. `claude -p "/unit-test scope=src/app coverage-target=80" --session-id <uuid> ...`
  2. `claude -p "đồng ý kế hoạch, làm tiếp" --resume <uuid> ...`
- Lệnh gọi lần 2 (auto): `claude -p "/unit-test scope=src/app coverage-target=80 mode=auto" ...`
- Tham số chung:
  - `--permission-mode acceptEdits`;
  - allowedTools: Read, Write, Edit, Glob, Grep, Skill, Agent, Task;
  - Bash giới hạn ở `npx ng`, `npm test`/`run`/`ls`, `node`, `ls`, `find`, `cat`, `git`, `rm`;
  - PowerShell giới hạn ở `npx ng`, `npm test`/`run`/`ls`, `node`, `Remove-Item`, `Get-ChildItem`, `Test-Path`.
- Kiểm chứng độc lập:
  - Lấy sha256 của toàn bộ file (trừ `node_modules` và `.claude`) trước và sau mỗi lần chạy để so sánh.
  - Tự chạy `npx ng test --watch=false --browsers=ChromeHeadless --code-coverage` trên cả hai bản, rồi xóa `coverage`, `.angular`, `dist`:
    - lần 1: `Executed 32 of 32 (1 FAILED)`, coverage Statements 100% (61/61), Branches 16/16, Functions 15/15, Lines 52/52;
    - lần 2: `Executed 33 of 33 (1 FAILED)`, coverage Statements 100% (45/45), Branches 15/15, Functions 14/14, Lines 37/37;
    - test fail duy nhất ở cả hai là `tax-rule withTax khi có số tiền thì cộng VAT`, lỗi có sẵn.
  - Grep các spec mới: không có `jest.`, `vi.`, `fdescribe`, `fit(`, `xit(`, `xdescribe`, `fakeAsync`.
  - Đọc transcript `.jsonl` để lấy thứ tự tool call.

| # | Lần 1 (confirm) | Lần 2 (auto) | Bằng chứng |
|---|---|---|---|
| A1 | Đạt | Đạt | Đọc `01-analyze` → `detection.md` → `playbooks/angular.md` → `02-plan` → `templates/plan.md` → `03-generate` → `04-verify` → `05-report` → `templates/report.md`; kế hoạch và báo cáo đúng template |
| A2 | Đạt | Đạt | Write đầu tiên xuất hiện sau khi đọc toàn bộ mã nguồn, chạy baseline `ng test --code-coverage` và in kế hoạch |
| A3 | Đạt | Không áp dụng | Lượt 1 kết thúc bằng kế hoạch 8 mục và câu hỏi xác nhận; hash không đổi. `coverage/` và `.angular/` do baseline sinh ra đã được xóa ngay trong lượt 1 |
| A4 | Không áp dụng | Đạt | In kế hoạch rồi Write ngay, không hỏi |
| A5 | Đạt | Đạt | Hash `src/` (trừ spec mới) không đổi. Lần 2 đưa `InvoiceExporterService` vào "Đơn vị bỏ qua" kèm gợi ý refactor. Lần 1 đề xuất test nó bằng spy trên global (mục tùy chọn, ghi rõ trong kế hoạch và được người dùng đồng ý), không sửa code production, và vẫn đưa gợi ý refactor (tiêm `HttpClient`, token cho clock/storage) |
| A6 | Đạt | Đạt | Không thêm dependency (`@testing-library/angular`, `ng-mocks`, Jest, Vitest); `package.json`, `angular.json`, `karma.conf.js` giữ nguyên hash. Coverage đo bằng `--code-coverage`, không sửa cấu hình |
| A7 | Đạt | Đạt | `tax-rule.spec.ts` giữ nguyên hash; báo cáo ghi là lỗi có sẵn (`Expected 110 to be 108`, VAT 8% so với 10%) |
| A8 | Đạt | Đạt | Bảng "Tham số đã hiểu" ở đầu kế hoạch: `mode`, `max-fix-attempts=3`, `failed-test-policy=remove` là mặc định |
| A9 | Không áp dụng | Không áp dụng | Dự án mẫu không phải git repo; agent ghi nhận và tự theo dõi file mình ghi |
| B1 | Đạt | Đạt | Angular 22 standalone, **zoneless**, builder `@angular/build:karma`, Karma + Jasmine, npm |
| B2 | Đạt | Đạt | Spec đặt cạnh file nguồn, `describe` theo file rồi theo method, tên `it('khi ... thì ...')`, `// arrange/act/assert`, mock bằng `jasmine.createSpyObj` |
| B3 | Đạt | Đạt | Mục tiêu: `DiscountService`, `CustomerRepository`, `DiscountBadgeComponent`; bỏ qua `app.component.ts`, `app.config.ts` (lắp ráp), `customer.ts` (chỉ type) |
| B4 | Đạt | Đạt | Kiểm tra Node, `node_modules/@angular/core`, `CHROME_BIN` trước khi chạy test |
| C1 | Đạt | Đạt | Chỉ đọc `playbooks/angular.md` |
| C2 | Đạt | Đạt | `TestBed` + provide `CustomerRepository` giả (vì service dùng `inject()`); `provideHttpClient()` + `provideHttpClientTesting()` + `HttpTestingController.verify()` cho repository; không gọi mạng thật |
| C3 | Đạt | Không áp dụng | Lần 1: `jasmine.clock().install()` + `mockDate(...)` cho `InvoiceExporterService`, gỡ trong `afterEach`. Lần 2 không test đơn vị dùng thời gian |
| C4 | Đạt | Đạt | Có đủ: 4 hạng, biên 9/10 đơn, PLATINUM + thưởng bị cắt ở 30%, id rỗng/không tìm thấy khách/hạng lạ, số tiền âm/NaN, 404 → `null`, lỗi 500 lan ra, badge ẩn khi rate 0, nút disabled, `output` phát đúng giá trị |
| C5 | Đạt | Đạt | Mọi test có assert; lỗi Observable kiểm bằng `firstValueFrom` + `expectAsync(...).toBeRejectedWithError`; số thực dùng `toBeCloseTo`; component dùng `setInput` + `whenStable`, không dùng `fakeAsync` (zoneless) |
| D1 | Đạt | Đạt | Báo cáo trích kết quả Karma. Tự chạy lại cho cùng kết quả |
| D2 | Đạt | Đạt | Không cần vòng sửa nào; mỗi spec chạy riêng bằng `--include` rồi mới chạy toàn bộ |
| D3 | Không áp dụng | Không áp dụng | Không truyền giá trị tham số không hợp lệ (đã kiểm ở ví dụ Python) |
| D4 | Không áp dụng | Không áp dụng | Không có test mới nào fail |
| D5 | Đạt | Đạt | `price-calculator.spec.ts` và `tax-rule.spec.ts` giữ nguyên hash |
| D6 | Đạt | Không áp dụng | Lần 1 phát hiện bug thật mà dự án mẫu không cố ý cài: `customer.tier in TIER_RATES` khớp cả khóa của `Object.prototype` (`'toString'`) nên trả `NaN` thay vì ném `RangeError`. Agent báo ở mục 5 kèm test minh họa, **không** thêm test đó vào bộ test và không sửa code. Lần 2 không phát hiện (xem vấn đề 2) |
| D7 | Đạt | Đạt | Chạy toàn bộ bộ test hai lần với Jasmine `random: true`, kết quả giống nhau |
| D8 | Đạt | Đạt | So sánh hash: lần 1 chỉ có 4 spec mới (`discount.service`, `customer-repository`, `discount-badge.component`, `invoice-exporter.service`); lần 2 chỉ có 4 spec mới (`discount.service`, `customer-repository`, `discount-badge.component`, `customer-not-found-error`). Không còn `coverage/`, `.angular/`, `dist/` |
| E1 | Đạt | Đạt | Đủ 8 mục theo `templates/report.md` |
| E2 | Đạt | Đạt | Cả hai ghi rõ con số "trước" 100% chỉ tính 5 statement của `pricing/*` và Karma chỉ tính file được spec import. Lần 2 nói rõ con số 100% không gồm `InvoiceExporterService` |
| E3 | Đạt | Đạt | Có gợi ý refactor `InvoiceExporterService`. Lần 1 khuyến nghị thêm `ChromeHeadless` vào `karma.conf.js` cho CI |
| E4 | Đạt | Đạt | Chỉ báo pass sau khi đã chạy Karma |
| E5 | Không áp dụng | Không áp dụng | Không truyền `save-report` |
| F1 | Đạt | Đạt | Cài bằng `install.mjs --target project`; gọi bằng `/unit-test` thành công |
| F2 | Đạt | Đạt | `npm run check`: "check passed" |
| F3 | Không áp dụng | Không áp dụng | Chưa có kết quả của Kiro và Codex |

**Kết luận:**
- Không có mục nào "Không đạt".
- Các bẫy riêng của Angular đều được xử lý đúng ở cả hai lần:
  - không dùng `jest.fn`/`vi.fn`, không thêm thư viện test;
  - `TestBed` thay cho `new` với service dùng `inject()`;
  - `setInput` + `whenStable` cho signal input, không dùng `fakeAsync` trong dự án zoneless;
  - lỗi Observable kiểm qua kênh error;
  - đọc coverage từ `text-summary` và giải thích giới hạn của Karma.

## Vấn đề phát hiện và việc cần sửa

1. **Dự án mẫu có bug thật ngoài ý muốn (`in` khớp khóa prototype).** Không phải lỗi agent; đây là điểm cộng của lần 1. Giữ nguyên trong ví dụ Angular vì nó kiểm tra tốt D6. Ví dụ React viết sau đã dùng `Object.hasOwn` nên không lặp lại bug này.
2. **Phát hiện nghi vấn bug không ổn định giữa hai lần chạy.** Lần 2 viết test "hạng không xác định" với giá trị lạ thông thường nên không chạm tới khóa prototype, và báo "Không phát hiện bug". Đây là giới hạn chung của việc đọc code bằng mô hình, không phải vi phạm quy trình. Không cần sửa playbook; ghi nhận để so sánh khi chạy Kiro/Codex.
3. **Hai lần chạy chọn phạm vi khác nhau với `InvoiceExporterService`.** Lần 1 (confirm) đề xuất test bằng spy global như mục tùy chọn và người dùng đồng ý; lần 2 (auto) bỏ qua. Cả hai đều không vi phạm A5 (không sửa production, có gợi ý refactor). Tuy vậy `02-plan` chỉ nói đơn vị khó test thuộc "Đơn vị bỏ qua", chưa nói rõ có được đề xuất test bằng spy global như mục tùy chọn hay không. Có thể làm rõ ở `02-plan` sau khi có kết quả Kiro/Codex; hiện chưa sửa.
