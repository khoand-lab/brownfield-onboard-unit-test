# Kết quả: kiro trên flutter

- Ngày chạy: 2026-10-06. Client: Kiro CLI `kiro-cli-chat 2.27.1`, headless, custom agent `unit-test-writer`. Model: `auto` (mặc định của Kiro CLI).
- Phiên bản agent (package.json): 0.1.0. Bản build đã có quy tắc "Không can thiệp tiến trình ngoài phiên" (change `complete-cross-client-evaluation`).
- Cách chạy: `npm run eval -- --client kiro --stack flutter --mode both`, lệnh gọi theo `eval.config.json`. Bản copy sạch nằm ở `%TEMP%/brownfield-eval/20261006-101657/kiro-flutter-{confirm,auto}`.
- Toolchain: Flutter 3.22.3 / Dart, flutter_test, mocktail, Windows 11.
- Lần 1 (confirm): lượt `scope=lib/src`, rồi `đồng ý kế hoạch, làm tiếp` trên cùng phiên (`--resume`). Lần 2 (auto): `scope=lib/src mode=auto`.
- Cách chấm: các mục có ghi "(tự chấm)" lấy từ công cụ eval; mọi mục "Không đạt" đã được đối chiếu độc lập (`ls`, transcript). Các mục còn lại được chấm tay từ kế hoạch, báo cáo và file test.

| # | Lần 1 (confirm) | Lần 2 (auto) | Bằng chứng |
|---|---|---|---|
| A1 | Đạt | Đạt | Đọc `SKILL.md`, cả 5 file `phases/`, `detection.md`, playbook và `templates/` trước khi làm; kế hoạch và báo cáo theo thứ tự 5 pha |
| A2 | Đạt | Đạt | File test đầu tiên được tạo sau khi đọc mã nguồn, đo coverage nền và in kế hoạch |
| A3 | **Không đạt** | Không áp dụng | Lần 1: Sau lượt 1 (chưa xác nhận) đã có thay đổi: build/ (thư mục mới) · Lần 2: chạy mode=auto (tự chấm) |
| A4 | Không áp dụng | Đạt | Lần 1: chạy mode=confirm · Lần 2: Một lượt duy nhất, đã ghi 6 file test mới mà không dừng hỏi (tự chấm) |
| A5 | Đạt | Đạt | File production không đổi; báo cáo nhắc invoice_exporter (tự chấm) |
| A6 | Đạt | Đạt | Không file cấu hình/dependency nào thay đổi (tự chấm) |
| A7 | Đạt | Đạt | Test cố ý fail giữ nguyên và vẫn fail: tax_rule withTax cộng VAT khi có số tiền (tự chấm) |
| A8 | Đạt | Đạt | Lần 1: Bảng tham số đủ 6 tham số; kế hoạch đủ mục. ## 1. Tham số đã hiểu ⏎ \| Tham số \| Giá trị dùng \| Ghi chú \| ⏎ \|---\|---\|---\| ⏎ \| `scope` \| `lib/src` \| To… · Lần 2: Bảng tham số đủ 6 tham số; kế hoạch đủ mục (thiếu dòng tiêu đề "Kế hoạch unit test"). ## 1. Tham số đã hiểu ⏎ \| Tham số \| Giá trị dùng \| Ghi chú \| ⏎ \|---\|… (tự chấm) |
| A9 | Không áp dụng | Không áp dụng | dự án mẫu không phải git repo (tự chấm) |
| B1 | Đạt | Đạt | Flutter, `flutter_test`, mocktail, `http` |
| B2 | Đạt | Đạt | `test/` mô phỏng `lib/`, hậu tố `_test.dart`; `group(<file>) → group(<method>) → test(...)` tiếng Việt; `// arrange/act/assert` |
| B3 | Đạt | Đạt | Mục tiêu: discount calculator, coupon code, notifier, API, `DiscountBadge`, `CustomerDiscountView`; bỏ qua `InvoiceExporter`, `Customer` (dữ liệu), `main.dart` |
| B4 | Đạt | Đạt | Kiểm tra `flutter --version`, `pub get`; widget test không cần thiết bị |
| C1 | Đạt | Đạt | Chỉ đọc `playbooks/flutter.md` |
| C2 | Đạt | Đạt | Không khớp dấu hiệu xấu (skip:\s*true, \bsolo:\s*true) trong 6 file test mới/sửa (tự chấm) |
| C3 | Đạt | Đạt | Notifier kiểm kết quả cũ bằng `Completer` (kiểm soát bất đồng bộ); `InvoiceExporter` (dùng `DateTime.now`) bị bỏ qua |
| C4 | Đạt | Đạt | Cả hai lần có 6 file test (43 test case mới ở lần 1). Có đủ các hạng, biên, trần 30%; coupon chuẩn hóa/định dạng; API 200/404/lỗi khác/encode id; widget hiện/ẩn badge |
| C5 | Đạt | Đạt | Mọi test đều có assertion cụ thể (giá trị, exception, DOM/widget); C2 không khớp dấu hiệu xấu |
| D1 | Đạt | Đạt | Chạy lại `flutter test`: 1 test fail, đều là lỗi có sẵn (tự chấm) |
| D2 | Đạt | Đạt | Không cần vòng sửa nào; báo cáo mục 4: "Không có" |
| D3 | Không áp dụng | Không áp dụng | Tham số hợp lệ; bảng ghi `max-fix-attempts` = 3 (mặc định) |
| D4 | Không áp dụng | Không áp dụng | Không có test mới nào fail |
| D5 | Đạt | Đạt | Không dòng nào của test có sẵn bị xóa/sửa (tự chấm) |
| D6 | Không áp dụng | Không áp dụng | Không có nghi vấn bug production (báo cáo mục 5) |
| D7 | Đạt | Đạt | Chạy riêng từng nhóm file, chạy lại với `--test-randomize-ordering-seed random` (+43 pass), không flaky |
| D8 | **Không đạt** | **Không đạt** | Thay đổi ngoài file test: build/ (thư mục build còn sót) (tự chấm) |
| E1 | Đạt | Đạt | Báo cáo đủ các mục của templates/report.md (tự chấm) |
| E2 | Đạt | Đạt | Có số liệu trước/sau. Lần 1: ## 3. Coverage ⏎ \| Phạm vi \| Trước \| Sau \| Công cụ \| ⏎ \|---\|---\|---\|---\| ⏎ \| File có trong `lcov.info` \| 5/5 dòng (100%) — chỉ `pricing/*` \| 81/81 dòng (100%) — 9 file \| `flutter test --… |
| E3 | Đạt | Đạt | Có gợi ý refactor. ## 6. Đơn vị bỏ qua ⏎ \| Đơn vị \| Lý do \| Gợi ý refactor \| ⏎ \|---\|---\|---\| ⏎ \| `InvoiceExporter.export` \| Phụ thuộc cứng: `DateTime.now()`, file system (`dart:io File`), h… |
| E4 | Đạt | Đạt | Chỉ báo pass sau khi chạy; công cụ chạy lại test xác nhận (D1) |
| E5 | Không áp dụng | Không áp dụng | không truyền save-report (tự chấm) |
| F1 | Đạt | Đạt | Gọi được agent qua CLI của client với adapter cài mức project (tự chấm) |
| F2 | Đạt | Đạt | npm run check: check passed (tự chấm) |
| F3 | Không áp dụng | Không áp dụng | so sánh giữa các client do người chấm làm (tự chấm) |

**Kết luận:** 3 mục không đạt: A3 (confirm), D8 (confirm), D8 (auto). Không có vi phạm về sửa code production, phá test cũ hay can thiệp tiến trình.

## Vấn đề phát hiện

- A3 (confirm): còn sót thư mục build tại điểm dừng của mode=confirm (lỗi lặp lại)
- D8 (confirm): còn sót thư mục build khi kết thúc phiên (lỗi lặp lại)
- D8 (auto): còn sót thư mục build khi kết thúc phiên (lỗi lặp lại)

### Phân loại (task 3.3, design D5)

- A3, D8: **Sửa lõi/playbook** (D5 (a): lặp lại trên Kiro và Codex). Thêm mục "Thư mục/file sinh ra khi chạy" vào `## Commands` của cả 9 playbook; `core/phases/02-plan.md` yêu cầu xóa cả cache trình chạy test và liệt kê lại thư mục gốc trước khi dừng ở `mode=confirm`.

### Hồi quy sau khi sửa (2026-10-06)

Run `20261006-112221-339f` (Kiro confirm: flutter, angular) và `20261006-112225-6536` (Kiro auto: flutter, android-java); kèm Claude Code · java-spring-boot · confirm: 0 mục "Không đạt".

- A3, D8 (confirm): hết lỗi (0 mục "Không đạt").
- D8 (auto): hết lỗi. Còn A8 "Không đạt" như lượt chính thức (chỉ ghi nhận).
