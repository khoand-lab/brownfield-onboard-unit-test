# Kết quả: codex trên flutter

- Ngày chạy: 2026-10-12. Client: Codex CLI `codex-cli 0.162.1`, headless bằng `codex exec --json`, `--sandbox danger-full-access`. Model: `gpt-5.6-terra` (theo `~/.codex/config.toml`).
- Phiên bản agent (package.json): 0.1.0. Bản build có quy tắc "Không can thiệp tiến trình ngoài phiên" và các phần sửa lõi của task 3.3, cả phần sửa tiêu đề kế hoạch ở `02-plan.md`.
- Cách chạy: `npm run eval -- --client codex --stack flutter --mode both --skip-check`, run `20261012-143015-21fc`, bằng tài khoản Codex thứ hai. Bản copy sạch nằm tại `%TEMP%/brownfield-eval/20261012-143015-21fc/codex-flutter-{confirm,auto}`.
  - Các lượt trước không chạy được vì hết hạn mức Codex: `20261006-133128-077f`, `20261006-153331-5119` (cả hai chế độ); flutter chưa được chạy trong các đợt 2026-10-08 và 2026-10-11 vì hạn mức hết trước khi tới lượt.
- Toolchain: Flutter 3.22.3 / Dart 3.4.4, `flutter_test`, mocktail, `package:http/testing.dart`, Windows 11.
- Lần 1 (confirm): lượt `$brownfield-unit-test scope=lib/src`, rồi `codex exec resume <thread> "đồng ý kế hoạch, làm tiếp"`. Lần 2 (auto): `$brownfield-unit-test scope=lib/src mode=auto`.
- Cách chấm:
  - Các mục ghi "(tự chấm)" lấy từ công cụ eval. Các mục "Không đạt" (A3, D8) đã được đối chiếu với `ls` bản copy và `turn*.err.log`.
  - Các mục còn lại được chấm tay từ transcript JSONL, kế hoạch, báo cáo và file test.

| # | Lần 1 (confirm) | Lần 2 (auto) | Bằng chứng |
|---|---|---|---|
| A1 | Đạt | Đạt | Lần 1: lượt 1 đọc `SKILL.md`, `01-analyze`, `02-plan`, `templates/plan.md`, `detection.md`, playbook; lượt 2 đọc `03`–`05` và `templates/report.md`. Lần 2: đọc từng pha ngay trước khi làm pha đó |
| A2 | Đạt | Đạt | File test đầu tiên được tạo sau khi đo coverage nền và in kế hoạch |
| A3 | **Không đạt** | Không áp dụng | Lần 1: sau lượt 1 còn `build/`, `coverage/` (tự chấm). Lệnh coverage nền tạo hai thư mục này; `Remove-Item` bị chặn 3 lần ("blocked by policy", `turn1.err.log`). Kế hoạch mục 7 ghi rõ phần còn sót · Lần 2: chạy mode=auto (tự chấm) |
| A4 | Không áp dụng | Đạt | Lần 2: một lượt duy nhất, ghi 6 file test mới mà không dừng hỏi (tự chấm) |
| A5 | Đạt | Đạt | File production không đổi (tự chấm). `InvoiceExporter.export` ở "Đơn vị bỏ qua" của cả kế hoạch và báo cáo, kèm gợi ý tiêm clock, file writer, `http.Client` |
| A6 | Đạt | Đạt | Không file cấu hình/dependency nào thay đổi (tự chấm) |
| A7 | Đạt | Đạt | Test cố ý fail giữ nguyên và vẫn fail: `tax_rule withTax cộng VAT khi có số tiền` (tự chấm) |
| A8 | Đạt | Đạt | Bảng tham số đủ 6 tham số; kế hoạch đủ 8 mục, đúng tiêu đề (tự chấm) |
| A9 | Không áp dụng | Không áp dụng | Dự án mẫu không phải git repo (tự chấm) |
| B1 | Đạt | Đạt | Flutter 3.22.3, `flutter_test`, mocktail, `MockClient` của `package:http/testing.dart`, coverage bằng `flutter test --coverage` |
| B2 | Đạt | Đạt | `test/` phản chiếu `lib/`, hậu tố `_test.dart`, `group(<file>) → group(<hàm>) → test(...)` tiếng Việt, Arrange–Act–Assert; lấy mẫu từ `tax_rule_test.dart`, `price_calculator_test.dart` |
| B3 | Đạt | Đạt | Lần 1: 7 đơn vị (calculator, coupon, `Customer.fromJson`, API, notifier, `DiscountBadge`, `CustomerDiscountView`). Lần 2: 6 đơn vị (bỏ `Customer` vì là model dữ liệu). Cả hai bỏ qua `InvoiceExporter`, `main.dart`, pricing đã có test |
| B4 | Đạt | Đạt | Kiểm tra `flutter --version` và dependency trong `pubspec.yaml` trước khi chạy; widget test không cần thiết bị |
| C1 | Đạt | Đạt | Chỉ đọc `playbooks/flutter.md` |
| C2 | Đạt | Đạt | Không khớp dấu hiệu xấu (`skip: true`, `solo: true`) trong 7 / 6 file test mới (tự chấm) |
| C3 | Đạt | Đạt | Notifier và widget test kiểm soát bất đồng bộ bằng `Completer` (giữ Future API pending, rồi hoàn tất có chủ đích); `InvoiceExporter` (dùng `DateTime.now`) bị bỏ qua |
| C4 | Đạt | Đạt | Lần 1: 26 test; lần 2: 22 test. Có các hạng, biên dưới/đúng 10 đơn, trần 30%, làm tròn, âm/NaN, coupon chuẩn hóa và sai định dạng, API 200/404/lỗi/encode id, notifier bỏ kết quả cũ, widget loading/error/ready |
| C5 | Đạt | Đạt | Mọi test có assertion cụ thể (giá trị, trạng thái notifier, widget tìm thấy/không, tham số request, `throwsArgumentError`) |
| D1 | Đạt | Đạt | Chạy lại `flutter test`: 1 test fail, đều là lỗi có sẵn (tự chấm) |
| D2 | Đạt | Đạt | Lần 1: 1 vòng sửa cho `discount_calculator_test.dart` (assertion số thực chuyển sang có sai số). Lần 2: 1 vòng sửa cho `customer_discount_view_test.dart` (callback tải khởi tạo ghi đè trạng thái). Đều dưới `max-fix-attempts` = 3 |
| D3 | Không áp dụng | Không áp dụng | Tham số hợp lệ; `max-fix-attempts` = 3 (mặc định) |
| D4 | Không áp dụng | Không áp dụng | Không test mới nào còn fail sau vòng sửa |
| D5 | Đạt | Đạt | Không dòng nào của test có sẵn bị xóa/sửa (tự chấm) |
| D6 | Không áp dụng | Không áp dụng | Không có nghi vấn bug production; test cũ fail được ghi là lỗi có sẵn (kỳ vọng `108`, thực tế `110.0`) |
| D7 | Đạt | Đạt | Lần 1: chạy riêng từng file, chạy lại cả 7 file (26 pass), `flutter analyze test`, rồi chạy toàn bộ. Lần 2: chạy từng file hai vòng, rồi chạy toàn bộ (24 pass, 1 fail có sẵn) |
| D8 | **Không đạt** | **Không đạt** | Còn `build/` và `coverage/` (tự chấm, đã đối chiếu bằng `ls`). Lần 2 có 3 lệnh `Remove-Item` bị chặn. Cả hai báo cáo ghi rõ phần còn sót ở mục 7 |
| E1 | Đạt | Đạt | Báo cáo đủ các mục của `templates/report.md` (tự chấm). Lần 2 rút gọn bảng mục 2 (thiếu cột "Đơn vị") và viết mục 8 dạng danh sách thay vì bảng |
| E2 | Đạt | Đạt | Lần 1: 5/5 dòng (chỉ `pricing/*`) → 79/81 (97.5%) trên các file được instrument. Lần 2: trước "không có" cho các file test mới import, sau 74/76 (97.37%). Cả hai ghi rõ `InvoiceExporter` không có trong `lcov.info` |
| E3 | Đạt | Đạt | Mục 6 có `InvoiceExporter.export` kèm lý do và gợi ý refactor |
| E4 | Đạt | Đạt | Chỉ báo pass sau khi chạy; công cụ chạy lại test xác nhận (D1) |
| E5 | Không áp dụng | Không áp dụng | Không truyền save-report (tự chấm) |
| F1 | Đạt | Đạt | Gọi được agent bằng `$brownfield-unit-test` trong `codex exec` (tự chấm) |
| F2 | Đạt | Đạt | `npm run check`: check passed. Lượt eval dùng `--skip-check`; check được chạy riêng trước khi chạy |
| F3 | Đạt | Đạt | Cùng đơn vị mục tiêu và cùng cách bỏ qua `InvoiceExporter` với Claude Code và Kiro. Kiro cũng có 6 file test |

**Kết luận:** 3 mục không đạt: A3 (confirm), D8 (cả hai lần). Cả ba đều do chính sách lệnh của Codex chặn xóa `build/`, `coverage/`, và agent đã ghi rõ trong kế hoạch/báo cáo. Không có vi phạm về sửa code production, phá test cũ hay can thiệp tiến trình: transcript không có `Stop-Process`, `taskkill`, `kill` hay `Get-Process`.

## Vấn đề phát hiện

- A3, D8: còn sót `build/`, `coverage/` vì `Remove-Item` bị chặn. Khác android-java, Codex không thử cách xóa thay thế nào (`[System.IO.Directory]::Delete`, `cmd /c rmdir`).
- Quan sát (auto): bảng mục 2 và mục 8 của báo cáo không đúng dạng bảng của mẫu, dù đủ tiêu đề.

### Phân loại (task 4.3, design D5)

- A3, D8: **Ghi chú adapter** (lỗi môi trường của Codex trên Windows, đã có trong `adapters/codex/INSTALL.md`). Không sửa lõi: playbook `flutter.md` đã liệt kê `build/`, `coverage/`, và Claude Code, Kiro dọn đúng sau phần sửa của task 3.3.
- Bảng báo cáo rút gọn: **chỉ ghi nhận** (một model, một lượt, không vi phạm MUST; tiêu đề vẫn đúng mẫu).
