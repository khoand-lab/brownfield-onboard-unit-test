# Ví dụ brownfield: Flutter

Dự án mẫu để thử agent `brownfield-unit-test`. Flutter 3.22+ (Dart 3.4+), `provider` + `ChangeNotifier`, `http`, test bằng `flutter_test` + `mocktail`. Các "bẫy" có chủ đích:

| Thành phần | Mục đích kiểm tra |
|---|---|
| `test/src/pricing/price_calculator_test.dart` | Quy ước riêng: `test/` mô phỏng `lib/`, hậu tố `_test.dart`, import `package:shop_flutter/...`, `group('<tên_file>')` → `group('<hàm>')`, tên `test` bằng tiếng Việt dạng "<kết quả> khi <điều kiện>", chú thích `// arrange/act/assert`. Agent phải theo đúng quy ước này. |
| `mocktail` có sẵn | Agent dùng `mocktail` (`extends Mock implements ...`), không thêm `mockito`/`build_runner`. Kiểu tùy biến dùng với `any()` cần `registerFallbackValue`. |
| `lib/src/discount/discount_calculator.dart` | Lớp thuần, chưa có test: tỉ lệ theo hạng, thưởng ở biên 9/10 đơn, giới hạn 30% (platinum 28% + 5% bị cắt còn 30%), số tiền âm/NaN → `ArgumentError`, làm tròn 2 chữ số. Số thực cần `closeTo`. |
| `lib/src/discount/coupon_code.dart` | Hàm top-level dùng regex: rỗng, khoảng trắng, chữ thường, sai định dạng. |
| `lib/src/api/customer_api.dart` | Nhận `http.Client` qua constructor: test bằng `MockClient` của `package:http/testing.dart` (không cần thêm package). Nhánh 404 → `null`, lỗi khác → `CustomerApiException`, id được `Uri.encodeComponent`. |
| `lib/src/discount/discount_notifier.dart` | `ChangeNotifier`: mock `CustomerApi` bằng `mocktail`. Nhánh id `null`/khoảng trắng → `idle`, `loading`, `ready`, không tìm thấy, lỗi, bỏ kết quả cũ khi `load` gọi lại với id khác (cần `Completer` để điều khiển thời điểm trả về). |
| `lib/src/discount/discount_badge.dart` | Widget test: bọc `MaterialApp`, ẩn khi rate ≤ 0, `tap` nút "Áp dụng" gọi `onApply`, nút bị khóa khi `disabled`. |
| `lib/src/discount/customer_discount_view.dart` | Widget dùng `Provider` và `addPostFrameCallback`: phải cung cấp `ChangeNotifierProvider` với notifier dùng API giả. Có `CircularProgressIndicator` (animation vô hạn), nên `pumpAndSettle()` sẽ **timeout** khi đang tải: phải dùng `pump()`. |
| `lib/src/invoice/invoice_exporter.dart` | Phụ thuộc cứng (`DateTime.now()`, file system, hàm top-level `http.post`). Agent nên đưa vào "Đơn vị bỏ qua" kèm gợi ý refactor, không sửa code. |
| `lib/main.dart` | Chỉ gọi `runApp`, không cần test. |
| `test/src/pricing/tax_rule_test.dart` | Test cũ **cố ý fail**. Agent phải giữ nguyên và báo là lỗi có sẵn. |
| Coverage | `flutter test --coverage` chỉ tính file được test import (trước: 5/5 dòng của `pricing/*`). Agent phải nói rõ giới hạn này, đọc `lcov.info` và xóa thư mục `coverage/` sinh ra. |

Yêu cầu: Flutter SDK 3.22+ trên PATH (không cần Android SDK hay Xcode cho `flutter test`).

Chạy:

```
flutter pub get
flutter test
```

Kết quả mong đợi trước khi dùng agent: `+2 -1: Some tests failed.` (`tax_rule withTax cộng VAT khi có số tiền`).

Gợi ý gọi agent: `scope=lib coverage-target=80`.
