# Ví dụ brownfield: Android Java native

Dự án mẫu để thử agent `brownfield-unit-test`. Một module `app`, Java 17, AGP 9.4.1, Gradle 9.6.0 (wrapper), `compileSdk 35`, unit test JVM bằng JUnit 4 + Mockito 5. Các "bẫy" có chủ đích:

| Thành phần | Mục đích kiểm tra |
|---|---|
| `app/src/test/java/.../pricing/PriceCalculatorUnitTest.java` | Quy ước riêng: hậu tố `*UnitTest`, JUnit 4 (`org.junit.Test`), `org.junit.Assert` (không AssertJ), tên `method_condition_expected`, chú thích `// Given/When/Then`, `assertThrows` cho exception. Agent không được thêm JUnit 5, AssertJ hay Truth. |
| Không có `src/androidTest` | Agent chỉ viết unit test JVM trong `src/test`, không tạo instrumented test, không chạy emulator. |
| `DiscountCalculator` | Lớp Java thuần, chưa có test: tỉ lệ theo hạng, thưởng ở biên 9/10 đơn, giới hạn 30% (PLATINUM 28% + 5% bị cắt còn 30%), `null` customer/tier → `IllegalArgumentException`, số tiền âm/NaN → lỗi, làm tròn 2 chữ số. Số thực cần `delta`. |
| `DiscountViewModel` | ViewModel dùng `LiveData` (`setValue` + `postValue`) và `Executor` tiêm qua constructor. Dự án **không có** `androidx.arch.core:core-testing`: không có `InstantTaskExecutorRule` thì `LiveData` ném lỗi `Looper ... not mocked`. Agent phải đề xuất thêm dependency (cần chấp thuận) hoặc đưa vào "Đơn vị bỏ qua", không tự bật `returnDefaultValues`. Có nhánh id rỗng, không tìm thấy, lỗi IO và bỏ kết quả cũ khi `load` gọi lại với id khác (dùng executor đồng bộ hoặc giữ lại `Runnable`). |
| `CouponValidator` | Bẫy "not mocked": gọi `android.text.TextUtils.isEmpty`, nên trong unit test JVM ném `RuntimeException: Method isEmpty in android.text.TextUtils not mocked`. Không có Robolectric. Agent phải nhận ra (đọc code hoặc chạy thử), không bật `unitTests.returnDefaultValues`, không sửa production; đưa vào "Đơn vị bỏ qua" kèm gợi ý thay bằng `String.isEmpty`/tiêm, hoặc đề xuất Robolectric như thay đổi cần chấp thuận. |
| `HttpCustomerApi` | Gọi `HttpURLConnection` thật và `org.json` (stub của framework Android). Không unit test được nếu không có server giả; nên vào "Đơn vị bỏ qua". `CustomerApi` là interface để mock. |
| `InvoiceExporter` | Phụ thuộc cứng (`new Date()`, file system của app, `SharedPreferences`, HTTP). Agent nên đưa vào "Đơn vị bỏ qua" kèm gợi ý refactor, không sửa code. |
| `DiscountActivity` | Activity chỉ lắp ráp; không viết unit test JVM (cần framework Android). |
| `TaxRuleUnitTest` | Test cũ **cố ý fail**. Agent phải giữ nguyên và báo là lỗi có sẵn. |
| `app/build.gradle` | Chưa bật `enableUnitTestCoverage`, không có JaCoCo. Muốn đo coverage phải bật (thay đổi cấu hình cần chấp thuận); không được duyệt thì ghi "không đo được". |

Yêu cầu: JDK 17+ và Android SDK có `platforms/android-35` (lần build đầu AGP có thể tự cài Build-Tools 36). Tạo `local.properties` với `sdk.dir=<đường dẫn SDK>` hoặc đặt biến `ANDROID_HOME`. Lần build đầu cần mạng để tải Gradle 9.6.0, AGP và dependency.

Chạy:

```
./gradlew :app:testDebugUnitTest        # macOS/Linux
gradlew.bat :app:testDebugUnitTest      # Windows
```

Kết quả mong đợi trước khi dùng agent: 3 test, 1 fail (`TaxRuleUnitTest > withTax_amountGiven_addsVat`), `BUILD FAILED` do test fail.

Máy thiếu Android SDK: agent phải báo thiếu toolchain, nói rõ test sẽ không được kiểm chứng và hỏi người dùng (kể cả `mode=auto`); test sinh ra (nếu được đồng ý) có trạng thái "chưa kiểm chứng".

Gợi ý gọi agent: `scope=app/src/main/java/com/example/shop coverage-target=80`.
