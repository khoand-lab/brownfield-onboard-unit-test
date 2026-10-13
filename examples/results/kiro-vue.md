# Kết quả: kiro trên vue

- Ngày chạy: 2026-10-06. Client: Kiro CLI `kiro-cli-chat 2.27.1`, headless, custom agent `unit-test-writer`. Model: `auto` (mặc định của Kiro CLI).
- Phiên bản agent (package.json): 0.1.0. Bản build đã có quy tắc "Không can thiệp tiến trình ngoài phiên" (change `complete-cross-client-evaluation`).
- Cách chạy: `npm run eval -- --client kiro --stack vue --mode both`, lệnh gọi theo `eval.config.json`. Bản copy sạch nằm ở `%TEMP%/brownfield-eval/20261006-101657/kiro-vue-{confirm,auto}`.
- Toolchain: Node v24.16.0, Vite, Vitest 5 + jsdom, Vue Test Utils, Pinia, Windows 11.
- Lần 1 (confirm): lượt `scope=src`, rồi `đồng ý kế hoạch, làm tiếp` trên cùng phiên (`--resume`). Lần 2 (auto): `scope=src mode=auto`.
- Cách chấm: các mục có ghi "(tự chấm)" lấy từ công cụ eval; mọi mục "Không đạt" đã được đối chiếu độc lập (`ls`, transcript). Các mục còn lại được chấm tay từ kế hoạch, báo cáo và file test.

| # | Lần 1 (confirm) | Lần 2 (auto) | Bằng chứng |
|---|---|---|---|
| A1 | Đạt | Đạt | Đọc `SKILL.md`, cả 5 file `phases/`, `detection.md`, playbook và `templates/` trước khi làm; kế hoạch và báo cáo theo thứ tự 5 pha |
| A2 | Đạt | Đạt | File test đầu tiên được tạo sau khi đọc mã nguồn, đo coverage nền và in kế hoạch |
| A3 | Đạt | Không áp dụng | Lần 1: Snapshot sau lượt 1 giống hệt lúc đầu, không có thư mục build mới · Lần 2: chạy mode=auto (tự chấm) |
| A4 | Không áp dụng | Đạt | Lần 1: chạy mode=confirm · Lần 2: Một lượt duy nhất, đã ghi 6 file test mới mà không dừng hỏi (tự chấm) |
| A5 | Đạt | Đạt | File production không đổi; báo cáo nhắc exportInvoice (tự chấm) |
| A6 | Đạt | Đạt | Không file cấu hình/dependency nào thay đổi (tự chấm) |
| A7 | Đạt | Đạt | Test cố ý fail giữ nguyên và vẫn fail: TaxRule > withTax() > should add VAT when amount is given (tự chấm) |
| A8 | Đạt | **Không đạt** | Lần 1: Bảng tham số đủ 6 tham số; kế hoạch đủ mục. ## 1. Tham số đã hiểu ⏎ \| Tham số \| Giá trị dùng \| Ghi chú \| ⏎ \|---\|---\|---\| ⏎ \| `scope` \| `src` (toàn thư… · Lần 2: kế hoạch thiếu mục: 8. Xác nhận. ## 1. Tham số đã hiểu ⏎ \| Tham số \| Giá trị dùng \| Ghi chú \| ⏎ \|---\|---\|---\| ⏎ \| `scope` \| `src` \| Toàn bộ thư mục n… (tự chấm) |
| A9 | Không áp dụng | Không áp dụng | dự án mẫu không phải git repo (tự chấm) |
| B1 | Đạt | Đạt | Vue 3, Vitest + jsdom, Vue Test Utils, Pinia, `vi.mock` |
| B2 | Đạt | Đạt | `tests/unit/` mô phỏng cây `src/`, hậu tố `.spec.ts`, alias `@/`; tên test tiếng Anh `it("should ... when ...")`; `// given/when/then`; không đăng ký lại `AppButton` (đã có trong `tests/setup.ts`) |
| B3 | Đạt | Đạt | Mục tiêu: discount, customer-api, store, composable `useCouponCode`, `DiscountBadge`, `CustomerDiscount`; bỏ qua `exportInvoice.ts`, `App.vue`, `main.ts` |
| B4 | Đạt | Đạt | Kiểm tra Node, `node_modules`, Vitest; chạy `npx vitest run` thay vì script watch |
| C1 | Đạt | Đạt | Chỉ đọc `playbooks/vue.md` |
| C2 | Đạt | Đạt | Không khớp dấu hiệu xấu (\.only\(, \.skip\(, toMatchSnapshot, toMatchInlineSnapshot) trong 6 file test mới/sửa (tự chấm) |
| C3 | Không áp dụng | Không áp dụng | Không có đơn vị phụ thuộc thời gian được test; store kiểm kết quả cũ bằng promise điều khiển được |
| C4 | Đạt | Đạt | Cả hai lần có 6 file spec. Có đủ các hạng, biên, trần 30%, hạng lạ/số tiền lỗi; API 200/404/lỗi khác/encode id; store bỏ kết quả cũ khi đổi khách; component hiện alert khi lỗi, khóa nút sau khi áp dụng |
| C5 | Đạt | Đạt | Mọi test đều có assertion cụ thể (giá trị, exception, DOM/widget); C2 không khớp dấu hiệu xấu |
| D1 | Đạt | Đạt | Chạy lại `npx vitest run`: 1 test fail, đều là lỗi có sẵn (tự chấm) |
| D2 | Đạt | Đạt | Không cần vòng sửa nào; báo cáo mục 4: "Không có" |
| D3 | Không áp dụng | Không áp dụng | Tham số hợp lệ; bảng ghi `max-fix-attempts` = 3 (mặc định) |
| D4 | Không áp dụng | Không áp dụng | Không có test mới nào fail |
| D5 | Đạt | Đạt | Không dòng nào của test có sẵn bị xóa/sửa (tự chấm) |
| D6 | Không áp dụng | Không áp dụng | Không có nghi vấn bug production (báo cáo mục 5) |
| D7 | Đạt | Đạt | Chạy riêng từng file, chạy lại lần 2 ("Stable — no flakiness"), rồi chạy toàn bộ |
| D8 | Đạt | Đạt | Chỉ file test thay đổi (6 file), không còn thư mục build mới (tự chấm) |
| E1 | Đạt | Đạt | Báo cáo đủ các mục của templates/report.md (tự chấm) |
| E2 | Đạt | Đạt | Có số liệu trước/sau. Lần 1: ## 3. Coverage ⏎ \| Phạm vi \| Trước \| Sau \| Công cụ \| ⏎ \|---\|---\|---\|---\| ⏎ \| `src/**/*.{ts,vue}` — Statements \| 5.49% (5/91) \| **81.31% (74/91)** \| `@vitest/coverage-v8` \| ⏎ \| — Branch… |
| E3 | Đạt | Đạt | Có gợi ý refactor. ## 6. Đơn vị bỏ qua ⏎ \| Đơn vị \| Lý do \| Gợi ý refactor \| ⏎ \|---\|---\|---\| ⏎ \| `invoice/exportInvoice.ts` \| Khó test: phụ thuộc cứng `new Date()`, DOM tạo link tải, `local… |
| E4 | Đạt | Đạt | Chỉ báo pass sau khi chạy; công cụ chạy lại test xác nhận (D1) |
| E5 | Không áp dụng | Không áp dụng | không truyền save-report (tự chấm) |
| F1 | Đạt | Đạt | Gọi được agent qua CLI của client với adapter cài mức project (tự chấm) |
| F2 | Đạt | Đạt | npm run check: check passed (tự chấm) |
| F3 | Không áp dụng | Không áp dụng | so sánh giữa các client do người chấm làm (tự chấm) |

**Kết luận:** 1 mục không đạt: A8 (auto). Không có vi phạm về sửa code production, phá test cũ hay can thiệp tiến trình.

## Vấn đề phát hiện

- A8 (auto): kế hoạch ở mode=auto thiếu mục "8. Xác nhận" (lỗi lặp lại, riêng Kiro)

### Phân loại (task 3.3, design D5)

- A8: **Chỉ ghi nhận** (D5: riêng Kiro, không vi phạm MUST). Ở `mode=auto` Kiro bỏ mục "8. Xác nhận" vì không có gì để xác nhận; các mục còn lại đủ.

### Hồi quy sau khi sửa (2026-10-06)

Run `20261006-112221-339f` (Kiro confirm: flutter, angular) và `20261006-112225-6536` (Kiro auto: flutter, android-java); kèm Claude Code · java-spring-boot · confirm: 0 mục "Không đạt".

- A8 (auto): không chạy lại (chỉ ghi nhận).
