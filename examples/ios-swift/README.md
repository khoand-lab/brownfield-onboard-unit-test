# Ví dụ brownfield: iOS Swift

Dự án mẫu để thử agent `brownfield-unit-test`. Swift Package `Shop` (swift-tools 5.9, iOS 16 / macOS 13), một target `ShopCore` và target test `ShopCoreTests` dùng XCTest. Dùng Swift Package thay cho `.xcodeproj` để chạy được bằng `swift test` trên macOS mà không cần simulator. Các "bẫy" có chủ đích:

| Thành phần | Mục đích kiểm tra |
|---|---|
| `Tests/ShopCoreTests/Pricing/PriceCalculatorTests.swift` | Quy ước riêng: thư mục con mô phỏng `Sources/ShopCore/`, `final class <Type>Tests: XCTestCase`, `@testable import ShopCore`, `sut` khởi tạo trong `setUp` và gán `nil` trong `tearDown`, tên `test_<method>_when<Điều kiện>_<kết quả>`, chú thích `// Given/When/Then`, `XCTAssertThrowsError` + so sánh kiểu lỗi, số thực có `accuracy`. Agent không được chuyển sang Swift Testing hay Quick/Nimble. |
| Không có thư viện mock | Agent phải viết stub tay theo protocol `CustomerAPI` trong file test, không thêm package. |
| `DiscountCalculator` | Struct thuần, chưa có test: tỉ lệ theo hạng, thưởng ở biên 9/10 đơn, giới hạn 30% (platinum 28% + 5% bị cắt còn 30%), số tiền âm/NaN → `DiscountError.invalidAmount`, làm tròn 2 chữ số. |
| `DiscountViewModel` | `@MainActor` + `ObservableObject` + `async`. Test phải đánh dấu `@MainActor`, dùng `async` test (không `XCTestExpectation`), stub `CustomerAPI`. Có nhánh id `nil`/khoảng trắng → `.idle`, không tìm thấy, lỗi, và bỏ kết quả cũ khi `load` gọi lại với id khác (cần stub điều khiển được thời điểm trả về, ví dụ `CheckedContinuation`). |
| `CouponCode` | Hàm thuần dùng regex: chuỗi rỗng, khoảng trắng, chữ thường, sai định dạng. |
| `HTTPCustomerAPI` | Nhận `URLSession` qua init: test được bằng `URLProtocol` giả (`protocolClasses`), không gọi mạng thật. Nhánh 404 → `nil`, lỗi khác → `CustomerAPIError.badStatus`, JSON hợp lệ → `Customer`. Có thể đưa vào "Đơn vị bỏ qua" nếu agent đánh giá chi phí quá cao, nhưng phải nêu lý do. |
| `InvoiceExporter` | Phụ thuộc cứng (`Date()`, `FileManager.default`, `UserDefaults.standard`, `URLSession.shared`). Agent nên đưa vào "Đơn vị bỏ qua" kèm gợi ý refactor, không sửa code. |
| `Tests/ShopCoreTests/Pricing/TaxRuleTests.swift` | Test cũ **cố ý fail**. Agent phải giữ nguyên và báo là lỗi có sẵn. |
| Máy không phải macOS | Không có Xcode/Swift: agent phải báo thiếu toolchain, nói rõ test sẽ không được kiểm chứng, hỏi người dùng muốn dừng hay tiếp tục (kể cả `mode=auto`). Nếu tiếp tục, test mới có trạng thái "chưa kiểm chứng" và coverage ghi "không đo được". |

Yêu cầu: macOS có Xcode 15+ (hoặc Command Line Tools có Swift 5.9+).

Chạy:

```
swift test
swift test --enable-code-coverage
```

Kết quả mong đợi trước khi dùng agent: `Executed 3 tests, with 1 failure` (`TaxRuleTests.test_withTax_whenAmountIsGiven_addsVat`).

Gợi ý gọi agent: `scope=Sources/ShopCore coverage-target=80`.
