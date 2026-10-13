# Kết quả: claude-code trên vue

- Ngày chạy: 2026-10-02. Client: Claude Code 2.1.287, chạy headless (`claude -p`). Model: `cc/claude-opus-5-5`.
- Phiên bản agent (package.json): 0.1.0
- Cài đặt: cách A (dạng rời, mức project) bằng `install.mjs --target project` vào hai bản copy sạch của `examples/vue` (đã có `node_modules`). Toolchain: Node v24.16.0, Vue 3.5.43, Pinia 4.0.3, Vite 8.3, Vitest 5.0.3 + jsdom + `@vue/test-utils` 2.5.1, vue-tsc 3.3, Windows 11.
- Lệnh gọi lần 1 (confirm), hai lượt trên cùng session:
  1. `claude -p "/unit-test scope=src coverage-target=80" --session-id <uuid> --model cc/claude-opus-5-5 ...`
  2. `claude -p "đồng ý kế hoạch, làm tiếp" --resume <uuid> --model cc/claude-opus-5-5 ...`
- Lệnh gọi lần 2 (auto): `claude -p "/unit-test scope=src coverage-target=80 mode=auto" --model cc/claude-opus-5-5 ...`, chạy song song với lần 1 trên bản copy riêng.
- Tham số chung: như kết quả React, thêm `Bash(npx vue-tsc:*)` và `PowerShell(npx vue-tsc:*)` vào allowedTools.
- Kiểm chứng độc lập:
  - Lấy sha256 của toàn bộ file (trừ `node_modules` và `.claude`) trước, giữa (sau lượt 1 của lần confirm) và sau mỗi lần chạy để so sánh.
  - Tự chạy `npx vitest run --coverage.enabled --coverage.reporter=text-summary --coverage.reportOnFailure --coverage.include='src/**/*.{ts,vue}'` và `npx vue-tsc --noEmit` trên cả hai bản:
    - lần 1: `Tests 1 failed | 61 passed (62)`, Statements 97.8% (89/91), Branches 96.07% (49/51), Functions 100% (22/22), Lines 97.56% (80/82); vue-tsc sạch;
    - lần 2: `Tests 1 failed | 56 passed (57)`, Statements 82.41% (75/91), Branches 92.15% (47/51), Functions 95.45% (21/22), Lines 80.48% (66/82); vue-tsc sạch;
    - test fail duy nhất ở cả hai là `TaxRule > withTax() > should add VAT when amount is given`, lỗi có sẵn.
  - Grep các spec mới: không có import `describe`/`it`/`expect` từ `vitest`, `toMatchSnapshot`, `shallowMount`, `@pinia/testing`/`createTestingPinia`, `.only(`, `.skip(`, `jest.`, `wrapper.vm`; không đăng ký lại `AppButton`.
  - Đọc transcript `.jsonl` để lấy thứ tự tool call.
- Trạng thái đầu (bản copy sạch): `Tests 1 failed | 2 passed (3)`; coverage `src/**/*.{ts,vue}` Lines 6.09% (5/82).

| # | Lần 1 (confirm) | Lần 2 (auto) | Bằng chứng |
|---|---|---|---|
| A1 | Đạt | Đạt | Đọc `01-analyze` → `detection.md` → `playbooks/vue.md` → `02-plan` → `templates/plan.md` → `03-generate` → `04-verify` → `05-report` → `templates/report.md`; kế hoạch và báo cáo đúng template |
| A2 | Đạt | Đạt | Write đầu tiên xuất hiện sau khi đọc toàn bộ mã nguồn, chạy baseline coverage và in kế hoạch |
| A3 | Đạt | Không áp dụng | Lượt 1 kết thúc bằng kế hoạch và mục "8. Xác nhận"; hash sau lượt 1 không đổi so với trước |
| A4 | Không áp dụng | Đạt | In kế hoạch rồi Write ngay, không hỏi |
| A5 | Đạt | Đạt | Hash mọi file production, cấu hình và `tests/setup.ts` không đổi. Lần 2 đưa `exportInvoice.ts` vào "Đơn vị bỏ qua" kèm gợi ý refactor. Lần 1 đưa `exportInvoice` vào kế hoạch (stub global, ghi rõ lý do trong kế hoạch và được người dùng đồng ý), không sửa code production, và vẫn gợi ý refactor (tiêm `now`/`http`/`storage`/`download`) |
| A6 | Đạt | Đạt | Mục "Thay đổi cấu hình/dependency cần chấp thuận": không có. Không thêm `@pinia/testing`; `package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig.json` giữ nguyên hash. Coverage dùng `--coverage.include` qua dòng lệnh |
| A7 | Đạt | Đạt | `tax-rule.spec.ts` giữ nguyên hash; báo cáo ghi là lỗi có sẵn (kỳ vọng 108, nhận 110 vì `VAT_RATE = 0.1`) |
| A8 | Đạt | Đạt | Bảng "Tham số đã hiểu" ở đầu kế hoạch: `mode`, `max-fix-attempts=3`, `failed-test-policy=remove`, `save-report` là mặc định |
| A9 | Không áp dụng | Không áp dụng | Dự án mẫu không phải git repo; agent ghi nhận và tự theo dõi file mình ghi |
| B1 | Đạt | Đạt | Vue 3.5 `<script setup>` + TS, Pinia 4, Vite, npm, Vitest 5 + jsdom, `@vue/test-utils` 2.5, `@vitest/coverage-v8`; ghi rõ không có `@pinia/testing` |
| B2 | Đạt | Đạt | Spec trong `tests/unit/<thư mục nguồn>/`, hậu tố `.spec.ts`, alias `@/`, globals (không import từ `vitest`), `describe('<Tên>')` → `describe('<hàm>()')`, `it('should ... when ...')` (mọi `it` mới đều có "should"), `// given/when/then`. Lần 1 đặt tên file component PascalCase (`DiscountBadge.spec.ts`), lần 2 kebab-case (`discount-badge.spec.ts`) — xem vấn đề 2 |
| B3 | Đạt | Đạt | Mục tiêu: `discount.ts`, `customer-api.ts`, `useCouponCode.ts`, `stores/discount.ts`, `DiscountBadge.vue`, `CustomerDiscount.vue` (lần 1 thêm `AppButton.vue`, `exportInvoice.ts`); bỏ qua `main.ts`, `App.vue` (lắp ráp), `customer.ts`, `env.d.ts` (chỉ type), `pricing/*` (đã có test) |
| B4 | Đạt | Đạt | Kiểm tra Node, `node_modules`, Vitest, coverage-v8 trước khi chạy test |
| C1 | Đạt | Đạt | Chỉ đọc `playbooks/vue.md` |
| C2 | Đạt | Đạt | Store và component: `vi.mock('@/api/customer-api')` + Pinia thật (`setActivePinia(createPinia())` trong `beforeEach`, `global.plugins: [createPinia()]`); `customer-api` stub `fetch` bằng `vi.stubGlobal` và `vi.unstubAllGlobals()`; dùng `mount` (không `shallowMount`) nên `AppButton` toàn cục được render thật; không gọi mạng thật |
| C3 | Đạt | Không áp dụng | Lần 1: `vi.useFakeTimers({ toFake: ['Date'] })` + `setSystemTime` cho `exportInvoice`, `useRealTimers()` trong `afterEach`. Lần 2 không test đơn vị dùng thời gian |
| C4 | Đạt | Đạt | Có đủ: 4 hạng, biên 9/10 đơn, PLATINUM + thưởng bị cắt ở 30%, hạng lạ → `RangeError`, số tiền âm/NaN, làm tròn; store: id rỗng → `idle`, `loading`, `ready` + getter `percent`, không tìm thấy, lỗi `Error` và lỗi không phải `Error`, bỏ kết quả/lỗi cũ khi `load` lại với id khác; composable: rỗng, khoảng trắng, chữ thường, sai định dạng, `reset()`; component: badge ẩn khi rate 0, `emitted('apply')`, `setProps`, `role="alert"`, khóa nút sau khi áp dụng, đổi `customerId` thì tải lại |
| C5 | Đạt | Đạt | Mọi test có assert; số thực dùng `toBeCloseTo`; component dùng `await trigger`/`setProps` và `flushPromises()` sau mount (không chỉ `nextTick`); không đọc `wrapper.vm`, không snapshot |
| D1 | Đạt | Đạt | Báo cáo trích kết quả Vitest và coverage. Tự chạy lại cho cùng kết quả |
| D2 | Đạt | Đạt | Không cần vòng sửa nào. Lần 1 chạy nhóm 8 file rồi **từng file riêng** rồi toàn bộ; lần 2 chạy nhóm thư mục rồi toàn bộ |
| D3 | Không áp dụng | Không áp dụng | Không truyền giá trị tham số không hợp lệ (kiểm ở task 11.2) |
| D4 | Không áp dụng | Không áp dụng | Không có test mới nào fail |
| D5 | Đạt | Đạt | `price-calculator.spec.ts` và `tax-rule.spec.ts` giữ nguyên hash |
| D6 | Không áp dụng | Không áp dụng | Không có bug production mới. Mâu thuẫn VAT của test cũ được báo và không sửa bên nào |
| D7 | Đạt | Đạt | Lần 1 chạy mỗi file mới hai lần (theo nhóm và riêng lẻ); lần 2 chạy nhóm hai lần; kết quả giống nhau |
| D8 | Đạt | Đạt | So sánh hash: lần 1 chỉ có 8 spec mới, lần 2 chỉ có 6 spec mới, tất cả trong `tests/unit/`. Không còn `coverage/`. Cả hai còn chạy `vue-tsc --noEmit` |
| E1 | Đạt | Đạt | Đủ 8 mục theo `templates/report.md` |
| E2 | Đạt | Đạt | Trước/sau trên `src/**/*.{ts,vue}`: lần 1 Lines 6.09% → 97.56% (**đạt** 80%); lần 2 Lines 6.09% → 80.48% (**đạt**, sát ngưỡng, nêu rõ phần thiếu ở `exportInvoice.ts`, `App.vue`, `main.ts`) |
| E3 | Đạt | Đạt | Có gợi ý refactor `exportInvoice.ts` ở cả hai lần; cả hai khuyến nghị thêm script `vitest run` cho CI |
| E4 | Đạt | Đạt | Chỉ báo pass sau khi đã chạy Vitest |
| E5 | Không áp dụng | Không áp dụng | Không truyền `save-report` |
| F1 | Đạt | Đạt | Cài bằng `install.mjs --target project`; gọi bằng `/unit-test` thành công |
| F2 | Đạt | Đạt | `npm run check`: "check passed" |
| F3 | Không áp dụng | Không áp dụng | Chưa có kết quả của Kiro và Codex |

**Kết luận:**
- Không có mục nào "Không đạt".
- Các bẫy riêng của Vue đều được xử lý đúng ở cả hai lần:
  - chạy `npx vitest run` (không có script `test`, `test:unit` là watch);
  - theo đúng `tests/unit/` + globals + `should ... when ...` thay vì quy ước của ví dụ React;
  - không thêm `@pinia/testing`, store tạo mới mỗi test bằng `setActivePinia(createPinia())`;
  - không đăng ký lại hay stub `AppButton` toàn cục, không sửa `tests/setup.ts`, dùng `mount` thay vì `shallowMount`;
  - `flushPromises()` sau `onMounted` gọi store bất đồng bộ;
  - kiểm tra race condition của store bằng Promise do test điều khiển;
  - coverage tính cả `*.vue` qua `--coverage.include`, không sửa cấu hình.

## Vấn đề phát hiện và việc cần sửa

1. **Phạm vi `exportInvoice` lại khác nhau giữa hai chế độ.** Giống ví dụ Angular: lần confirm đưa `exportInvoice` vào kế hoạch (test bằng stub global, ghi chú rõ và chờ duyệt), lần auto bỏ qua. Cả hai đều không vi phạm A5. Đây là lần thứ hai gặp hiện tượng này (Angular, Vue), nên nên làm rõ ở `02-plan` sau khi có kết quả Kiro/Codex: đơn vị chỉ phụ thuộc global stub được thì xếp vào "Đơn vị bỏ qua" hay đưa vào như mục tùy chọn.
2. **Tên file spec của component không nhất quán giữa hai lần** (PascalCase ở lần 1, kebab-case ở lần 2). Dự án mẫu chỉ có test cho file kebab-case (`price-calculator.ts`), nên không có căn cứ cho tên component; cả hai cách đều khớp `include` và không vi phạm B2. Có thể bổ sung vào `playbooks/vue.md`: khi chưa có mẫu cho component, giữ tên file spec trùng tên file nguồn (`DiscountBadge.vue` → `DiscountBadge.spec.ts`). Chưa sửa.
3. **Lần 2 sát ngưỡng `coverage-target`** (80.48%) vì bỏ `exportInvoice`, khác với React (chưa đạt 76.47%). Báo cáo trung thực ở cả hai, không ảnh hưởng checklist.
