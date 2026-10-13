# Kết quả: claude-code trên flutter

- Ngày chạy: 2026-10-02. Client: Claude Code 2.1.287, chạy headless (`claude -p`). Model: `cc/claude-opus-5-5`.
- Phiên bản agent (package.json): 0.1.0
- Cài đặt: cách A (dạng rời, mức project) bằng `install.mjs --target project` vào các bản copy sạch của `examples/flutter` (đã `flutter pub get`). Toolchain: Flutter 3.22.3 / Dart 3.4.4, Windows 11.
- Lệnh gọi lần 1 (confirm), hai lượt:
  1. `claude -p "/unit-test scope=lib coverage-target=80" --session-id <uuid> --model cc/claude-opus-5-5 ...`
  2. `claude -p "đồng ý kế hoạch, làm tiếp" --resume <uuid> ...`
- Lệnh gọi lần 2 (auto): `claude -p "/unit-test scope=lib coverage-target=80 mode=auto" ...` trên bản copy `flauto2` (xem vấn đề 1 về bản copy đầu tiên).
- Tham số chung: như kết quả Android, thay Gradle/Java bằng `flutter`, `dart` (Bash và PowerShell).
- Kiểm chứng độc lập:
  - So sánh sha256 (trừ `.claude`, `.dart_tool`, `build`, `coverage`) trước, giữa và sau.
  - Tự chạy `flutter test --coverage --coverage-path <tạm>` và `flutter analyze test` trên cả hai bản:
    - lần 1: `+51 -1: Some tests failed.`, lcov 81/81 dòng trên 9 file; analyze sạch;
    - lần 2: `+50 -1: Some tests failed.`, lcov 81/81 dòng trên 9 file; analyze sạch;
    - test fail duy nhất ở cả hai là `tax_rule withTax cộng VAT khi có số tiền`, lỗi có sẵn.
  - Grep test mới: không có `mockito`, `pumpAndSettle`, `skip`, `HttpOverrides`, `Future.delayed`, `sleep`.
  - Đọc transcript `.jsonl` để lấy thứ tự tool call.
- Trạng thái đầu (bản copy sạch): `+2 -1: Some tests failed.`; lcov 5/5 dòng (chỉ `pricing/*`).

| # | Lần 1 (confirm) | Lần 2 (auto) | Bằng chứng |
|---|---|---|---|
| A1 | Đạt | Đạt | Đọc `01-analyze` → `detection.md` → `playbooks/flutter.md` → `02-plan` → `templates/plan.md` → `03-generate` → `04-verify` → `05-report` → `templates/report.md` |
| A2 | Đạt | Đạt | Write đầu tiên sau khi đọc mã nguồn, chạy baseline `flutter test --coverage` và in kế hoạch |
| A3 | Đạt | Không áp dụng | Lượt 1 kết thúc bằng kế hoạch và mục "8. Xác nhận"; hash không đổi; `coverage/`, `build/` sinh ra từ baseline đã được xóa trong lượt 1 |
| A4 | Không áp dụng | Đạt | In kế hoạch rồi Write ngay, không hỏi |
| A5 | Đạt | Đạt | Hash `lib/` không đổi. `InvoiceExporter` ở "Đơn vị bỏ qua" kèm gợi ý tiêm `http.Client`, clock, thư mục |
| A6 | Đạt | Đạt | Không thêm dependency; `pubspec.yaml`, `pubspec.lock`, `analysis_options.yaml` giữ nguyên hash. Dùng `MockClient` từ `package:http/testing.dart` có sẵn |
| A7 | Đạt | Đạt | `tax_rule_test.dart` giữ nguyên hash; báo cáo ghi là lỗi có sẵn (kỳ vọng 108, nhận 110.0) |
| A8 | Đạt | Đạt | Bảng "Tham số đã hiểu" ở đầu kế hoạch |
| A9 | Không áp dụng | Không áp dụng | Không phải git repo |
| B1 | Đạt | Đạt | Flutter 3.22.3 / Dart 3.4.4, `flutter_test`, `mocktail`, `provider` + `ChangeNotifier`, `http` |
| B2 | Đạt | Đạt | `test/` mô phỏng `lib/`, `_test.dart`, `package:shop_flutter/...`, `group('<tên_file>')` → `group('<hàm>')`, tên tiếng Việt "<kết quả> khi <điều kiện>", `// arrange/act/assert` |
| B3 | Đạt | Đạt | 7 đơn vị: `DiscountCalculator`, coupon, `Customer.fromJson`, `CustomerApi`, `DiscountNotifier`, `DiscountBadge`, `CustomerDiscountView`; bỏ qua `InvoiceExporter`, `main.dart`, `pricing/*` |
| B4 | Đạt | Đạt | Kiểm tra `flutter --version`, `.dart_tool/`, `pubspec.lock` mới hơn `pubspec.yaml` |
| C1 | Đạt | Đạt | Chỉ đọc `playbooks/flutter.md` |
| C2 | Đạt | Đạt | `mocktail` cho `CustomerApi`; `MockClient` cho HTTP; `ChangeNotifierProvider` + `MaterialApp` cho widget; không gọi mạng thật |
| C3 | Không áp dụng | Không áp dụng | Đơn vị dùng thời gian bị bỏ qua |
| C4 | Đạt | Đạt | 4 hạng, biên 9/10 đơn, trần 30%, số tiền âm/NaN, làm tròn; coupon rỗng/khoảng trắng/chữ thường/sai định dạng; `fromJson` tier hoa/không hợp lệ; API 200/404/500/encode id; notifier `idle`/`loading`/`ready`/không tìm thấy/lỗi/bỏ kết quả cũ (`Completer`); badge ẩn/hiện/tap/khóa; view spinner/lỗi/ready/áp dụng |
| C5 | Đạt | Đạt | Mọi test có `expect`; số thực dùng `closeTo`; widget test dùng `pump()` (không `pumpAndSettle` khi có `CircularProgressIndicator`) |
| D1 | Đạt | Đạt | Báo cáo trích kết quả `flutter test`; tự chạy lại cho cùng số test |
| D2 | Đạt | Đạt | Không cần vòng sửa; `flutter analyze` trước, chạy từng file/nhóm rồi toàn bộ |
| D3 | Không áp dụng | Không áp dụng | — |
| D4 | Không áp dụng | Không áp dụng | Không có test mới nào fail |
| D5 | Đạt | Đạt | `price_calculator_test.dart`, `tax_rule_test.dart` giữ nguyên hash |
| D6 | Không áp dụng | Không áp dụng | Không có bug production mới |
| D7 | Đạt | Đạt | Chạy lại với `--test-randomize-ordering-seed random` |
| D8 | Đạt | Đạt | Hash: mỗi lần chỉ có 7 file test mới. Lần 1 xóa `coverage/`, `build/`. Lần 2 **không xóa được** (lệnh `Remove-Item` bị từ chối quyền ở chế độ headless) và báo rõ trong báo cáo, yêu cầu người dùng tự xóa |
| E1 | Đạt | Đạt | Đủ các mục theo `templates/report.md` |
| E2 | Đạt | Đạt | Trước 5/5 (chỉ `pricing/*`), sau 81/81 trên 9 file; ước lượng ~89% cho toàn `lib` ghi rõ là ước lượng; nói rõ lcov chỉ tính file được import và Flutter không có branch coverage |
| E3 | Đạt | Đạt | Gợi ý refactor `InvoiceExporter` |
| E4 | Đạt | Đạt | Chỉ báo pass sau khi đã chạy |
| E5 | Không áp dụng | Không áp dụng | Không truyền `save-report` |
| F1 | Đạt | Đạt | Cài bằng `install.mjs --target project`; gọi bằng `/unit-test` thành công |
| F2 | Đạt | Đạt | `npm run check`: "check passed" (đủ 9 playbook) |
| F3 | Không áp dụng | Không áp dụng | Chưa có kết quả của Kiro và Codex |

**Kết luận:**
- Không có mục nào "Không đạt".
- Các bẫy riêng của Flutter đều được xử lý: giữ `mocktail` (không `mockito`/`build_runner`), dùng `MockClient` có sẵn, `ChangeNotifierProvider` + `MaterialApp`, tránh `pumpAndSettle` với spinner, giải thích giới hạn của lcov.

## Vấn đề phát hiện và việc cần sửa

1. **Lần chạy auto đầu tiên (`flauto`) bị lỗi xác thực API giữa chừng** (`OAuth access token has been revoked`) sau khi đã ghi 7 file test và `coverage/lcov.info`. Lần gọi lại trên cùng bản copy đó, agent coi 7 file này là test có sẵn (đúng, vì không phải do phiên đó tạo), không sửa chúng, chỉ thêm 1 case và báo cáo rõ nguồn gốc file dựa trên thời gian sửa — hành vi đúng với D5/D8. Vì bản copy đã bẩn, kết quả lần 2 trong bảng lấy từ bản copy sạch `flauto2`.
2. **Dọn thư mục sinh ra bị chặn quyền ở chế độ headless** (lần 2), giống kết quả Android. Agent báo trung thực. Có thể ghi chú trong `adapters/claude-code/INSTALL.md` rằng khi chạy headless nên cho phép `Remove-Item`/`rm` trên `coverage`, `build`. Chưa sửa.
