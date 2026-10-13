# Kết quả: claude-code trên ios-swift

- Ngày chạy: 2026-10-02. Client: Claude Code 2.1.287, chạy headless (`claude -p`). Model: `cc/claude-opus-5-5`.
- Phiên bản agent (package.json): 0.1.0
- **Máy chạy là Windows 11, không có macOS/Xcode/Swift.** Theo task 7.2, lần đánh giá này kiểm chứng nhánh "agent báo thiếu toolchain đúng spec", không kiểm chứng test chạy được. Kết quả chạy thật trên macOS còn để trống (xem cuối file).
- Cài đặt: cách A (dạng rời, mức project) bằng `install.mjs --target project` vào hai bản copy sạch của `examples/ios-swift`.
- Lệnh gọi lần 1 (confirm), hai lượt:
  1. `claude -p "/unit-test scope=Sources/ShopCore coverage-target=80" --session-id <uuid> --model cc/claude-opus-5-5 ...`
  2. `claude -p "Tiếp tục sinh test mà không kiểm chứng. Đồng ý kế hoạch." --resume <uuid> ...`
- Lệnh gọi lần 2 (auto), hai lượt:
  1. `claude -p "/unit-test scope=Sources/ShopCore coverage-target=80 mode=auto" ...`
  2. `claude -p "Tiếp tục viết test mà không chạy (cách 2)." --resume <uuid> ...`
- Tham số chung: như kết quả Android, thêm `swift`, `xcodebuild`, `xcrun`, `which`, `uname` (Bash) và `Get-Command` (PowerShell) vào allowedTools.
- Kiểm chứng độc lập: so sánh sha256 trước, giữa và sau; grep nội dung test mới; đọc transcript `.jsonl`. Không biên dịch được test (không có Swift).

| # | Lần 1 (confirm) | Lần 2 (auto) | Bằng chứng |
|---|---|---|---|
| A1 | Đạt | Đạt | Đọc `01-analyze` → `detection.md` → `playbooks/ios-swift.md` → `02-plan` → `templates/plan.md` → `03-generate` → `04-verify` → `05-report` → `templates/report.md` |
| A2 | Đạt | Đạt | Write đầu tiên chỉ xuất hiện ở lượt 2, sau khi phân tích và người dùng chọn tiếp tục |
| A3 | Đạt | Không áp dụng | Lượt 1 kết thúc bằng kế hoạch và hai câu hỏi (dừng/tiếp tục vì thiếu toolchain; đồng ý kế hoạch); hash không đổi |
| A4 | Không áp dụng | Đạt | Dừng ở lượt 1 **chỉ** vì thiếu toolchain (theo `01-analyze`: "Hỏi ngay cả khi `mode=auto`"); hash không đổi. Sau khi người dùng chọn tiếp tục thì làm hết không hỏi thêm |
| A5 | Đạt | Đạt | Hash `Sources/` không đổi. `InvoiceExporter` ở "Đơn vị bỏ qua" kèm gợi ý tiêm `now`, thư mục, `URLSession`, `UserDefaults` |
| A6 | Đạt | Đạt | Không thay đổi `Package.swift`, không thêm package (không Quick/Nimble, không thư viện mock) |
| A7 | Đạt | Đạt | `TaxRuleTests.swift` giữ nguyên hash; báo cáo ghi là lỗi có sẵn (theo README, vì không chạy được) |
| A8 | Đạt | Đạt | Bảng tham số in ở đầu kế hoạch/kết quả phân tích |
| A9 | Không áp dụng | Không áp dụng | Không phải git repo |
| B1 | Đạt | Đạt | Swift Package `Shop` (tools 5.9, iOS 16/macOS 13), target `ShopCoreTests`, XCTest, không có thư viện mock |
| B2 | Đạt | Đạt | Thư mục con mô phỏng `Sources/`, `final class <Type>Tests: XCTestCase`, `@testable import ShopCore`, `// Given/When/Then`, `accuracy:`, `XCTAssertThrowsError` + so kiểu lỗi. Tên `test_<method>_when..._...`: lần 2 đúng toàn bộ 42 method; lần 1 có 3/45 method thiếu đoạn `when` (`test_init_stateIsIdle`, ...) — lệch nhỏ, vẫn có tiền tố `test` nên chạy được |
| B3 | Đạt | Đạt | Mục tiêu: `DiscountCalculator`, `CouponCode`, `DiscountViewModel`, `HTTPCustomerAPI` (lần 2 thêm 1 case cho `PriceCalculator`, đã nêu trong kế hoạch); bỏ qua `Customer`, `Tier`, `InvoiceExporter` |
| B4 | Đạt | Đạt | Kiểm tra `swift --version`, `xcodebuild -version` (Bash) và `Get-Command swift, xcodebuild` (PowerShell); báo **thiếu toolchain**, nói rõ test sẽ không được kiểm chứng, coverage không đo được, và hỏi dừng hay tiếp tục — đúng scenario "Thiếu toolchain" của `project-analysis`. Lần 2 còn chỉ ra test `DiscountViewModel` cần macOS vì dùng `Combine` |
| C1 | Đạt | Đạt | Chỉ đọc `playbooks/ios-swift.md` |
| C2 | Đạt | Đạt | Stub tay theo protocol `CustomerAPI` trong file test; `MockURLProtocol` gắn qua `URLSessionConfiguration.ephemeral`; không có `URLSession.shared` trong test |
| C3 | Không áp dụng | Không áp dụng | Đơn vị dùng thời gian bị bỏ qua |
| C4 | Đạt | Đạt | Theo nội dung test (chưa chạy): 4 hạng, biên 9/10 đơn, trần 30%, số tiền âm/NaN, làm tròn; ViewModel: id `nil`/khoảng trắng, `.loading`, `.ready`, không tìm thấy, lỗi, bỏ kết quả cũ (stub giữ request bằng `CheckedContinuation`); API: 200, URL đúng, 404, 500, JSON hỏng |
| C5 | Đạt | Đạt | Mọi test có `XCTAssert*`; ViewModel test là `@MainActor` + `async`, không `XCTestExpectation`, không `sleep` |
| D1 | Đạt | Đạt | Không chạy được; mọi test mới ghi "chưa kiểm chứng" kèm lý do (scenario "Không chạy được test" của `test-verification`) |
| D2 | Không áp dụng | Không áp dụng | Không có vòng sửa vì không chạy được |
| D3 | Không áp dụng | Không áp dụng | — |
| D4 | Không áp dụng | Không áp dụng | — |
| D5 | Đạt | Đạt | Không sửa hay disable test có sẵn. Lần 2 **thêm** 1 case vào `PriceCalculatorTests.swift`, giữ nguyên 2 case cũ (đã diff) |
| D6 | Không áp dụng | Không áp dụng | — |
| D7 | Không áp dụng | Không áp dụng | Không chạy được |
| D8 | Đạt | Đạt | Hash: lần 1 chỉ có 4 file test mới; lần 2 có 4 file test mới và `PriceCalculatorTests.swift` (thêm case) |
| E1 | Đạt | Đạt | Đủ 8 mục theo `templates/report.md` |
| E2 | Đạt | Đạt | "Trước/sau: không đo được" kèm lý do; ước lượng thô ghi rõ "không phải số đo" |
| E3 | Đạt | Đạt | Gợi ý refactor `InvoiceExporter` |
| E4 | Đạt | Đạt | Không khẳng định pass; số test đếm là "chưa kiểm chứng" (lần 1: 42, lần 2: 44 theo báo cáo). Cả hai ghi lệnh để chạy trên Mac và kết quả mong đợi |
| E5 | Không áp dụng | Không áp dụng | Không truyền `save-report` |
| F1 | Đạt | Đạt | Cài bằng `install.mjs --target project`; gọi bằng `/unit-test` thành công |
| F2 | Đạt | Đạt | `npm run check`: "check passed" |
| F3 | Không áp dụng | Không áp dụng | Chưa có kết quả của Kiro và Codex |

**Kết luận:**
- Không có mục nào "Không đạt".
- Nhánh thiếu toolchain hoạt động đúng spec ở cả hai chế độ: phát hiện thiếu Swift/Xcode, hỏi người dùng (kể cả `mode=auto`), không ghi file trước khi được trả lời, đánh dấu mọi test là "chưa kiểm chứng", coverage "không đo được" kèm lý do, và để lại lệnh chạy trên macOS.

## Vấn đề phát hiện và việc cần sửa

1. **Số test trong báo cáo lệch với số method thực tế.** Lần 1 báo 42 test nhưng file có 45 method `test_`; lần 2 báo 44 nhưng có 42 method mới + 1 case thêm. Vì không biên dịch/chạy được nên agent đếm tay và đếm sai. Ảnh hưởng nhỏ (trạng thái vẫn là "chưa kiểm chứng"), nhưng `05-report` có thể yêu cầu: khi không chạy được test, đếm bằng tìm kiếm nội dung (ví dụ số method có tiền tố `test`) thay vì ước lượng. Chưa sửa.
2. **Chưa kiểm chứng trên macOS.** Cần chạy lại `swift test` (hai bản copy) trên một máy Mac để xác nhận test mới biên dịch và pass (dự kiến `Executed 48 tests, with 1 failure` cho lần 1 và `Executed 46 tests, with 1 failure` cho lần 2, chỉ fail ở `TaxRuleTests`). Khi có máy Mac, ghi kết quả bổ sung vào file này.
