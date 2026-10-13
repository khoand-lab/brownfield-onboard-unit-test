# Kết quả: claude-code trên react

- Ngày chạy: 2026-10-02. Client: Claude Code 2.1.285 (lần 1) và 2.1.287 (lần 2; CLI tự cập nhật giữa hai lần), chạy headless (`claude -p`). Model: `cc/claude-opus-5-5`.
- Phiên bản agent (package.json): 0.1.0
- Cài đặt: cách A (dạng rời, mức project) bằng `install.mjs --target project` vào hai bản copy sạch của `examples/react` (đã có `node_modules`). Toolchain: Node v24.16.0, React 19.3, Vite 8.3, Vitest 5.0.2 + jsdom + React Testing Library 16.3 + user-event 14.6, Windows 11.
- Lệnh gọi lần 1 (confirm), hai lượt trên cùng session:
  1. `claude -p "/unit-test scope=src coverage-target=80" --session-id <uuid> ...`
  2. `claude -p "đồng ý kế hoạch, làm tiếp (không thêm test cho exportInvoice)" --resume <uuid> --model cc/claude-opus-5-5 ...`
- Lệnh gọi lần 2 (auto): `claude -p "/unit-test scope=src coverage-target=80 mode=auto" --model cc/claude-opus-5-5 ...`
- Tham số chung:
  - `--permission-mode acceptEdits`;
  - allowedTools: Read, Write, Edit, Glob, Grep, Skill, Agent, Task;
  - Bash giới hạn ở `npx vitest`, `npx tsc`, `npm test`/`run`/`ls`, `node`, `ls`, `find`, `cat`, `git`, `rm`;
  - PowerShell giới hạn ở `npx vitest`, `npm test`/`run`/`ls`, `node`, `Remove-Item`, `Get-ChildItem`, `Test-Path`.
- Kiểm chứng độc lập:
  - Lấy sha256 của toàn bộ file (trừ `node_modules` và `.claude`) trước, giữa (sau lượt 1 của lần confirm) và sau mỗi lần chạy để so sánh.
  - Tự chạy `npx vitest run --coverage.enabled --coverage.reporter=text-summary --coverage.reportOnFailure --coverage.include='src/**'` trên cả hai bản rồi xóa `coverage`:
    - lần 1: `Tests 1 failed | 41 passed (42)`, Statements 77.14% (54/70), Branches 94.73% (36/38), Functions 86.66% (13/15), Lines 76.47% (52/68);
    - lần 2: `Tests 1 failed | 42 passed (43)`, coverage giống hệt lần 1;
    - test fail duy nhất ở cả hai là `tax-rule > withTax > khi có số tiền thì cộng VAT`, lỗi có sẵn.
  - Grep các test mới: không có `toMatchSnapshot`, `toMatchInlineSnapshot`, `jest.`, `jest-dom`, `toBeInTheDocument`, `.only(`, `.skip(`, `setTimeout(`.
  - Đọc transcript `.jsonl` để lấy thứ tự tool call.
- Trạng thái đầu (bản copy sạch): `Tests 1 failed | 2 passed (3)`.

| # | Lần 1 (confirm) | Lần 2 (auto) | Bằng chứng |
|---|---|---|---|
| A1 | Đạt | Đạt | Đọc `01-analyze` → `detection.md` → `playbooks/react.md` → `02-plan` → `templates/plan.md` → `03-generate` → `04-verify` → `05-report` → `templates/report.md`; kế hoạch và báo cáo đúng template |
| A2 | Đạt | Đạt | Write đầu tiên xuất hiện sau khi đọc toàn bộ mã nguồn, chạy baseline coverage và in kế hoạch |
| A3 | Đạt | Không áp dụng | Lượt 1 kết thúc bằng kế hoạch và mục "8. Xác nhận"; hash sau lượt 1 không đổi so với trước. Thư mục coverage tạm `.unit-test-agent/` của baseline đã được xóa ngay trong lượt 1 |
| A4 | Không áp dụng | Đạt | In kế hoạch rồi Write ngay, không hỏi |
| A5 | Đạt | Đạt | Hash mọi file production và cấu hình không đổi. `exportInvoice.ts` nằm ở "Đơn vị bỏ qua" kèm gợi ý refactor (tiêm `clock`/`download`/`http`/`storage`, tách hàm tạo `fileName`) |
| A6 | Đạt | Đạt | Không thêm dependency (không `@testing-library/jest-dom`, không Jest); `package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig.json` giữ nguyên hash. Coverage dùng `--coverage.include` qua dòng lệnh, không sửa cấu hình |
| A7 | Đạt | Đạt | `tax-rule.test.ts` giữ nguyên hash; báo cáo ghi là lỗi có sẵn (kỳ vọng 108, nhận 110 vì `VAT_RATE = 0.1`) |
| A8 | Đạt | Đạt | Bảng "Tham số đã hiểu" ở đầu kế hoạch: `mode`, `max-fix-attempts=3`, `failed-test-policy=remove`, `save-report` là mặc định |
| A9 | Không áp dụng | Không áp dụng | Dự án mẫu không phải git repo; agent kiểm tra `git rev-parse`, ghi nhận và tự theo dõi file mình ghi |
| B1 | Đạt | Đạt | React 19.3 + Vite 8 + TS, npm, Vitest 5 + jsdom, RTL + user-event, `@vitest/coverage-v8`; ghi rõ **không có** jest-dom |
| B2 | Đạt | Đạt | Test trong `__tests__/` cạnh mã nguồn, import tường minh từ `vitest`, `describe` theo file rồi theo hàm, tên `it('khi ... thì ...')`, `// arrange/act/assert`; tự gọi `cleanup()` trong `afterEach` vì không bật `globals` |
| B3 | Đạt | Đạt | Mục tiêu: `discount.ts`, `customer-api.ts`, `useDiscount.ts`, `DiscountBadge.tsx`, `CustomerDiscount.tsx`; bỏ qua `App.tsx`, `main.tsx` (lắp ráp), `customer.ts` (chỉ type), `pricing/*` (đã có test) |
| B4 | Đạt | Đạt | Kiểm tra `node -v`, `npm -v`, `node_modules/.bin/vitest` trước khi chạy test |
| C1 | Đạt | Đạt | Chỉ đọc `playbooks/react.md` |
| C2 | Đạt | Đạt | Hook và component mock module `../../api/customer-api` bằng `vi.mock`; `customer-api` stub `fetch` bằng `vi.stubGlobal` và `vi.unstubAllGlobals()` sau test; không gọi mạng thật |
| C3 | Không áp dụng | Không áp dụng | Không đơn vị mục tiêu nào dùng thời gian/ngẫu nhiên (`exportInvoice` bị bỏ qua ở cả hai lần) |
| C4 | Đạt | Đạt | Có đủ: 4 hạng, biên 9/10 đơn, PLATINUM + thưởng bị cắt ở 30%, hạng lạ → `RangeError`, số tiền âm/NaN, làm tròn 2 chữ số, 404 → `null`, 500 → throw, `encodeURIComponent` (`a%2Fb%20c%3F`), không tìm thấy khách, lỗi hiện trong `role="alert"`, badge ẩn khi rate ≤ 0, nút bị khóa sau khi bấm, bỏ kết quả cũ khi `customerId` đổi (`rerender`) |
| C5 | Đạt | Đạt | Mọi test có assert; số thực dùng `toBeCloseTo`; dùng `getByRole`/`findByRole` + `userEvent.setup()`; matcher gốc (`toBeNull`, `.disabled`, `textContent`) thay cho jest-dom; không snapshot |
| D1 | Đạt | Đạt | Báo cáo trích kết quả Vitest và số liệu coverage. Tự chạy lại cho cùng kết quả (39 và 40 test mới đều pass) |
| D2 | Đạt | Đạt | Không cần vòng sửa nào (chỉ vài Edit nhỏ ngay sau Write, trước lần chạy đầu tiên). Lần 1 chạy 5 file mới trước rồi mới chạy toàn bộ; lần 2 chạy `src/discount src/api` trước rồi mới chạy toàn bộ (xem vấn đề 2) |
| D3 | Không áp dụng | Không áp dụng | Không truyền giá trị tham số không hợp lệ (đã kiểm ở ví dụ Python; sẽ kiểm lại ở task 11.2) |
| D4 | Không áp dụng | Không áp dụng | Không có test mới nào fail |
| D5 | Đạt | Đạt | `price-calculator.test.ts` và `tax-rule.test.ts` giữ nguyên hash |
| D6 | Không áp dụng | Không áp dụng | Không có bug production mới (ví dụ React dùng `Object.hasOwn` nên không lặp bug prototype của Angular). Lần 2 liệt kê lỗi VAT của test cũ ở mục "Nghi vấn bug" và không sửa bên nào |
| D7 | Đạt | Đạt | Lần 1 chạy các file mới hai lần (riêng rồi theo thư mục) trước khi chạy toàn bộ; lần 2 chạy `src/discount src/api` ba lần; kết quả giống nhau |
| D8 | Đạt | Đạt | So sánh hash: mỗi lần chỉ có 5 file test mới (`discount.test.ts`, `customer-api.test.ts`, `useDiscount.test.ts`, `DiscountBadge.test.tsx`, `CustomerDiscount.test.tsx`). Không còn `coverage/` hay `.unit-test-agent/`. Cả hai còn chạy `npx tsc -p tsconfig.json` để kiểm tra kiểu |
| E1 | Đạt | Đạt | Đủ 8 mục theo `templates/report.md` |
| E2 | Đạt | Đạt | Trước/sau trên `src/**`: statements 7.14% → 77.14%, lines 7.35% → 76.47%. Cả hai ghi rõ **chưa đạt** `coverage-target=80` và chỉ ra phần thiếu nằm ở `exportInvoice.ts` |
| E3 | Đạt | Đạt | Có gợi ý refactor `exportInvoice.ts`. Lần 2 khuyến nghị đổi script `test` thành `vitest run` cho CI |
| E4 | Đạt | Đạt | Chỉ báo pass sau khi đã chạy Vitest |
| E5 | Không áp dụng | Không áp dụng | Không truyền `save-report` |
| F1 | Đạt | Đạt | Cài bằng `install.mjs --target project`; gọi bằng `/unit-test` thành công |
| F2 | Đạt | Đạt | `npm run check`: "check passed" |
| F3 | Không áp dụng | Không áp dụng | Chưa có kết quả của Kiro và Codex |

**Kết luận:**
- Không có mục nào "Không đạt".
- Các bẫy riêng của React đều được xử lý đúng ở cả hai lần:
  - chạy `npx vitest run` thay vì `npm test` (watch);
  - không thêm jest-dom, dùng matcher gốc;
  - tự `cleanup()` vì không bật `globals`;
  - `vi.mock` module API cho hook/component, `vi.stubGlobal('fetch')` có khôi phục cho `customer-api`;
  - `renderHook` + `waitFor` + `rerender` cho cờ `cancelled`;
  - test theo hành vi bằng `getByRole` + `userEvent`, không snapshot;
  - đọc coverage từ output text, giải thích giới hạn khi chỉ tính file được import.

## Vấn đề phát hiện và việc cần sửa

1. **`coverage-target=80` không đạt được nếu bỏ qua `exportInvoice.ts`.** Đây là thiết kế của dự án mẫu (đơn vị khó test chiếm ~20% statement), không phải lỗi agent. Lần 1 nêu rõ rủi ro này ngay trong kế hoạch và hỏi người dùng có muốn test `exportInvoice` bằng stub global không. Lần 2 (auto) ước tính sai trong kế hoạch (~83%) nhưng báo cáo trung thực là chưa đạt. Có thể bổ sung vào `02-plan`: khi có `coverage-target`, ước tính phải tính cả phần statement của "Đơn vị bỏ qua". Chưa sửa; ghi nhận để so sánh khi chạy Kiro/Codex, cùng với vấn đề 3 của kết quả Angular (đề xuất test bằng spy global như mục tùy chọn).
2. **Chạy "hẹp" ở mức nhóm file thay vì từng file.** Cả hai lần chạy test mới theo nhóm (danh sách 5 file, hoặc `src/discount src/api`) rồi mới chạy toàn bộ, thay vì chạy từng file riêng. Vì không có test nào fail nên không ảnh hưởng việc đếm `max-fix-attempts` theo file. Vẫn đúng tinh thần "hẹp → rộng" của `04-verify`; chưa cần sửa.
3. **Môi trường:** CLI Claude Code tự cập nhật giữa hai lần chạy (lệnh `claude` tạm thời không có trên PATH vài chục giây), và lượt `--resume` cần truyền `--model` tường minh. Không liên quan đến agent.
