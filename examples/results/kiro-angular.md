# Kết quả: kiro trên angular

- Ngày chạy: 2026-10-06. Client: Kiro CLI `kiro-cli-chat 2.27.1`, headless, custom agent `unit-test-writer`. Model: `auto` (mặc định của Kiro CLI).
- Phiên bản agent (package.json): 0.1.0. Bản build đã có quy tắc "Không can thiệp tiến trình ngoài phiên" (change `complete-cross-client-evaluation`).
- Cách chạy: `npm run eval -- --client kiro --stack angular --mode both`, lệnh gọi theo `eval.config.json`. Bản copy sạch nằm ở `%TEMP%/brownfield-eval/20261006-101657/kiro-angular-{confirm,auto}`.
- Toolchain: Node v24.16.0, Angular CLI, Karma + Jasmine, Chrome Headless, Windows 11.
- Lần 1 (confirm): lượt `scope=src/app`, rồi `đồng ý kế hoạch, làm tiếp` trên cùng phiên (`--resume`). Lần 2 (auto): `scope=src/app mode=auto`.
- Cách chấm: các mục có ghi "(tự chấm)" lấy từ công cụ eval; mọi mục "Không đạt" đã được đối chiếu độc lập (`ls`, transcript). Các mục còn lại được chấm tay từ kế hoạch, báo cáo và file test.

| # | Lần 1 (confirm) | Lần 2 (auto) | Bằng chứng |
|---|---|---|---|
| A1 | Đạt | Đạt | Đọc `SKILL.md`, cả 5 file `phases/`, `detection.md`, playbook và `templates/` trước khi làm; kế hoạch và báo cáo theo thứ tự 5 pha |
| A2 | Đạt | Đạt | File test đầu tiên được tạo sau khi đọc mã nguồn, đo coverage nền và in kế hoạch |
| A3 | **Không đạt** | Không áp dụng | Lần 1: Sau lượt 1 (chưa xác nhận) đã có thay đổi: .angular/ (thư mục mới), dist/ (thư mục mới) · Lần 2: chạy mode=auto (tự chấm) |
| A4 | Không áp dụng | Đạt | Lần 1: chạy mode=confirm · Lần 2: Một lượt duy nhất, đã ghi 4 file test mới mà không dừng hỏi (tự chấm) |
| A5 | Đạt | Đạt | File production không đổi; báo cáo nhắc invoice-exporter (tự chấm) |
| A6 | Đạt | Đạt | Không file cấu hình/dependency nào thay đổi (tự chấm) |
| A7 | Đạt | Đạt | Test cố ý fail giữ nguyên và vẫn fail: tax-rule withTax khi có số tiền thì cộng VAT (tự chấm) |
| A8 | Đạt | **Không đạt** | Lần 1: Bảng tham số đủ 6 tham số; kế hoạch đủ mục. ## 1. Tham số đã hiểu ⏎ \| Tham số \| Giá trị dùng \| Ghi chú \| ⏎ \|---\|---\|---\| ⏎ \| `scope` \| `src/app` \| To… · Lần 2: kế hoạch thiếu mục: 8. Xác nhận. ### 1. Tham số đã hiểu ⏎ \| Tham số \| Giá trị dùng \| Ghi chú \| ⏎ \|---\|---\|---\| ⏎ \| `scope` \| `src/app` \| Toàn bộ thư … (tự chấm) |
| A9 | Không áp dụng | Không áp dụng | dự án mẫu không phải git repo (tự chấm) |
| B1 | Đạt | Đạt | Angular, Karma + Jasmine (không có Jest), `HttpClientTestingModule`, Chrome Headless |
| B2 | Đạt | Đạt | Spec đặt cạnh file nguồn, hậu tố `.spec.ts`; `describe(<file>) → describe(<method>) → it("khi ... thì ...")`; `// arrange/act/assert`; Jasmine thuần |
| B3 | Đạt | Đạt | Mục tiêu: `DiscountService`, `CustomerRepository`, `DiscountBadgeComponent` (lần 2 thêm `CustomerNotFoundError`); bỏ qua `AppComponent`, `InvoiceExporterService` |
| B4 | Đạt | Đạt | Kiểm tra Node, `node_modules`, Chrome (đặt `CHROME_BIN`, không sửa `karma.conf.js`) |
| C1 | Đạt | Đạt | Chỉ đọc `playbooks/angular.md` |
| C2 | Đạt | Đạt | Lần 1: Không khớp dấu hiệu xấu (\bfit\(, \bfdescribe\(, \bxit\(, \bxdescribe\(, toMatchSnapshot) trong 3 file test mới/sửa · Lần 2: Không khớp dấu hiệu xấu (\bfit\(, \bfdescribe\(, \bxit\(, \bxdescribe\(, toMatchSnapshot) trong 4 file test mới/sửa (tự chấm) |
| C3 | Không áp dụng | Không áp dụng | Đơn vị được test không dùng thời gian; `InvoiceExporterService` bị bỏ qua |
| C4 | Đạt | Đạt | Lần 1: 3 file spec, lần 2: 4 file spec. Có đủ các hạng, biên thưởng, trần 30%, lỗi id/không tìm thấy; repository: 200/404/lỗi khác/encode id; component: ẩn khi rate 0, phát sự kiện, `disabled` |
| C5 | Đạt | Đạt | Mọi test đều có assertion cụ thể (giá trị, exception, DOM/widget); C2 không khớp dấu hiệu xấu |
| D1 | Đạt | Đạt | Chạy lại `npx ng test --watch=false --browsers=ChromeHeadless`: 1 test fail, đều là lỗi có sẵn (tự chấm) |
| D2 | Đạt | Đạt | Không cần vòng sửa nào; báo cáo mục 4: "Không có" |
| D3 | Không áp dụng | Không áp dụng | Tham số hợp lệ; bảng ghi `max-fix-attempts` = 3 (mặc định) |
| D4 | Không áp dụng | Không áp dụng | Không có test mới nào fail |
| D5 | Đạt | Đạt | Không dòng nào của test có sẵn bị xóa/sửa (tự chấm) |
| D6 | Không áp dụng | Không áp dụng | Không có nghi vấn bug production (báo cáo mục 5) |
| D7 | Đạt | Đạt | Chạy riêng từng spec, rồi chạy gộp lại với `random: true` (25/25 và 27/27 SUCCESS); không flaky |
| D8 | Đạt | Đạt | Lần 1: Chỉ file test thay đổi (3 file), không còn thư mục build mới · Lần 2: Chỉ file test thay đổi (4 file), không còn thư mục build mới (tự chấm) |
| E1 | Đạt | Đạt | Báo cáo đủ các mục của templates/report.md (tự chấm) |
| E2 | Đạt | Đạt | Có số liệu trước/sau. Lần 1: ## 3. Coverage ⏎ \| Phạm vi \| Trước \| Sau \| Công cụ \| ⏎ \|---\|---\|---\|---\| ⏎ \| File được biên dịch trong bộ test \| Statements 100% (5/5), Branches 100% (3/3), Functions 100% (2/2), Lines 100… |
| E3 | Đạt | Đạt | Có gợi ý refactor. ## 6. Đơn vị bỏ qua ⏎ \| Đơn vị \| Lý do \| Gợi ý refactor \| ⏎ \|---\|---\|---\| ⏎ \| `InvoiceExporterService#exportInvoice` \| Phụ thuộc cứng không tiêm được: `new Date()`, DOM (… |
| E4 | Đạt | Đạt | Chỉ báo pass sau khi chạy; công cụ chạy lại test xác nhận (D1) |
| E5 | Không áp dụng | Không áp dụng | không truyền save-report (tự chấm) |
| F1 | Đạt | Đạt | Gọi được agent qua CLI của client với adapter cài mức project (tự chấm) |
| F2 | Đạt | Đạt | npm run check: check passed (tự chấm) |
| F3 | Không áp dụng | Không áp dụng | so sánh giữa các client do người chấm làm (tự chấm) |

**Kết luận:** 2 mục không đạt: A3 (confirm), A8 (auto). Không có vi phạm về sửa code production, phá test cũ hay can thiệp tiến trình.

## Vấn đề phát hiện

- A3 (confirm): còn sót thư mục build tại điểm dừng của mode=confirm (lỗi lặp lại)
- A8 (auto): kế hoạch ở mode=auto thiếu mục "8. Xác nhận" (lỗi lặp lại, riêng Kiro)

### Phân loại (task 3.3, design D5)

- A3: **Sửa lõi/playbook** (D5 (a): lặp lại trên Kiro và Codex). Thêm mục "Thư mục/file sinh ra khi chạy" vào `## Commands` của cả 9 playbook; `core/phases/02-plan.md` yêu cầu xóa cả cache trình chạy test và liệt kê lại thư mục gốc trước khi dừng ở `mode=confirm`.
- A8: **Chỉ ghi nhận** (D5: riêng Kiro, không vi phạm MUST). Ở `mode=auto` Kiro bỏ mục "8. Xác nhận" vì không có gì để xác nhận; các mục còn lại đủ.

### Hồi quy sau khi sửa (2026-10-06)

Run `20261006-112221-339f` (Kiro confirm: flutter, angular) và `20261006-112225-6536` (Kiro auto: flutter, android-java); kèm Claude Code · java-spring-boot · confirm: 0 mục "Không đạt".

- A3 (confirm): hết lỗi ("Snapshot sau lượt 1 giống hệt lúc đầu"). Lượt này lộ một lỗi khác: E1 "Không đạt", báo cáo cuối không theo tiêu đề của `templates/report.md` (viết "Tổng quan", "File test đã tạo"... thay vì "1. Tóm tắt", "2. Test đã tạo"...). Lượt chính thức E1 đạt, nên đây là biến động của model. Phân loại: **chỉ ghi nhận** (D5: một model, một lần, pha 5 đã yêu cầu giữ nguyên tên mục). Cập nhật: lỗi lặp lại ở Python confirm (xem `kiro-python.md`) nên đã sửa lõi; lượt hồi quy sau sửa E1 "Đạt".
- A8 (auto): không chạy lại (chỉ ghi nhận).

### Sửa lõi lần 2: báo cáo không theo mẫu ở lượt tiếp tục (E1)

- Hiện tượng: ở lượt 2 của `mode=confirm` (phiên tiếp tục bằng `--resume`), Kiro viết báo cáo với tiêu đề tự đặt ("Tổng quan", "File test đã tạo", "Lỗi có sẵn"...) thay cho các mục có đánh số của `templates/report.md`. Gặp ở Angular (run `20261006-112221-339f`) và Python (run `20261006-133206-6860`); lượt chính thức của cả hai stack đều đạt.
- Phân loại: **sửa lõi** (D5 (a): lặp lại trên Kiro và đã từng xảy ra với Codex, xem `codex-react.md` vòng 1).
- Hành động: `core/phases/05-report.md` bước 1 yêu cầu đọc lại `templates/report.md` ngay trước khi viết (kể cả khi phiên được tiếp tục sau bước xác nhận), chép đúng tiêu đề có số thứ tự, không đổi tên hay thêm mục ngang hàng.
- Hồi quy (run `20261006-133621-4086`): Kiro · python · confirm và Kiro · angular · confirm đều 0 mục "Không đạt" (A3, D8, E1 "Đạt"); kèm Claude Code · java-spring-boot · confirm (xem `eval-automation-check.md`).

### Sửa lõi lần 3: kế hoạch thiếu mục "8. Xác nhận" ở `mode=auto` (A8)

- Phân loại cập nhật: A8 ban đầu được **chỉ ghi nhận**, nhưng sau đó lặp lại trên Kiro (nodejs, vue, angular, flutter) và Codex (nodejs confirm). Vì vậy A8 được **sửa lõi** ở task 4.3 (D5 (a)): `core/phases/02-plan.md` bước 1 yêu cầu chép đúng tiêu đề có số từ `templates/plan.md`, kể cả mục 8 khi `mode=auto`.
- Lượt hồi quy kiro · angular · auto ngày 2026-10-11 không chạy được vì máy thiếu `kiro-cli`.
- Hồi quy (2026-10-12, run `20261012-155416-d23a`, `kiro-cli-chat 2.29.1`, bản build hiện tại): Kiro · angular · auto có **0 mục "Không đạt"**, 11 Đạt.
  - A8 "Đạt": kế hoạch đủ 8 mục, có "## 8. Xác nhận" với câu "Chế độ tự động: bắt đầu sinh test."
  - A5, D5, D8, E1 cũng "Đạt": `InvoiceExporterService` ở "Đơn vị bỏ qua" kèm gợi ý refactor; 2 file spec có sẵn (`price-calculator.spec.ts`, `tax-rule.spec.ts`) chỉ được thêm case, không sửa dòng cũ; `coverage/`, `.angular/`, `dist/` đã được dọn.
  - Transcript không có lệnh dừng tiến trình.
