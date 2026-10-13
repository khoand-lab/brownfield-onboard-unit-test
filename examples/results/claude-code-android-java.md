# Kết quả: claude-code trên android-java

- Ngày chạy: 2026-10-02. Client: Claude Code 2.1.287, chạy headless (`claude -p`). Model: `cc/claude-opus-5-5`.
- Phiên bản agent (package.json): 0.1.0
- Cài đặt: cách A (dạng rời, mức project) bằng `install.mjs --target project` vào hai bản copy sạch của `examples/android-java`. Toolchain: JDK 21.0.8, Gradle 9.6.0 (wrapper), AGP 9.4.1, Android SDK có `platforms/android-35` (AGP tự cài Build-Tools 36 ở lần build đầu), Windows 11. Máy **có** Android SDK nên kết quả là "đã kiểm chứng"; nhánh thiếu SDK chưa được chạy ở lần đánh giá này.
- Lệnh gọi lần 1 (confirm), hai lượt trên cùng session:
  1. `claude -p "/unit-test scope=app/src/main/java/com/example/shop coverage-target=80" --session-id <uuid> --model cc/claude-opus-5-5 ...`
  2. `claude -p "đồng ý kế hoạch. Duyệt 6a và 6b, từ chối 6c. Làm tiếp." --resume <uuid> ...`
- Lệnh gọi lần 2 (auto), hai lượt:
  1. `claude -p "/unit-test scope=app/src/main/java/com/example/shop coverage-target=80 mode=auto" ...`
  2. `claude -p "đồng ý cả hai" --resume <uuid> ...` (trả lời câu hỏi duyệt thay đổi cấu hình, xem A4/A6)
- Tham số chung: `--permission-mode acceptEdits`; allowedTools: Read, Write, Edit, Glob, Grep, Skill, Agent, Task; Bash giới hạn ở `./gradlew(.bat)`, `java`, `node`, `ls`, `find`, `cat`, `git`, `rm`; PowerShell giới hạn ở `.\gradlew.bat`, `java`, `node`, `Remove-Item`, `Get-ChildItem`, `Get-Content`, `Test-Path`.
- Kiểm chứng độc lập:
  - Lấy sha256 của toàn bộ file (trừ `.claude`, `.gradle`, `build/`) trước, giữa và sau mỗi lần chạy để so sánh.
  - Tự chạy `gradlew.bat :app:testDebugUnitTest --rerun --continue` trên cả hai bản và đọc `app/build/test-results/testDebugUnitTest/*.xml`:
    - lần 1: `31 tests completed, 1 failed` — `DiscountCalculatorUnitTest` 16/0, `DiscountViewModelUnitTest` 10/0, `PriceCalculatorUnitTest` 4/0, `TaxRuleUnitTest` 1/1;
    - lần 2: `27 tests completed, 1 failed` — `DiscountCalculatorUnitTest` 15/0, `DiscountViewModelUnitTest` 9/0, `PriceCalculatorUnitTest` 2/0, `TaxRuleUnitTest` 1/1;
    - test fail duy nhất ở cả hai là `TaxRuleUnitTest > withTax_amountGiven_addsVat`, lỗi có sẵn.
  - Grep test mới: không có `org.junit.jupiter`, AssertJ, Truth, Robolectric, `returnDefaultValues`, `@Ignore`, `Thread.sleep`, `mockStatic`, `TextUtils`; không có file trong `src/androidTest`.
  - Đọc transcript `.jsonl` để lấy thứ tự tool call.
- Trạng thái đầu (bản copy sạch): `3 tests completed, 1 failed`. Bẫy đã xác nhận trước khi chạy agent: gọi `CouponValidator.isValid` ném `Method isEmpty in android.text.TextUtils not mocked`; gọi `DiscountViewModel.load` không có rule ném `Method getMainLooper in android.os.Looper not mocked`.

| # | Lần 1 (confirm) | Lần 2 (auto) | Bằng chứng |
|---|---|---|---|
| A1 | Đạt | Đạt | Đọc `01-analyze` → `detection.md` → `playbooks/android-java.md` → `02-plan` → `templates/plan.md` → `03-generate` → `04-verify` → `05-report` → `templates/report.md`; kế hoạch và báo cáo đúng template |
| A2 | Đạt | Đạt | Write/Edit đầu tiên xuất hiện sau khi đọc mã nguồn, kiểm tra toolchain và in kế hoạch (lần 2 còn chạy baseline `testDebugUnitTest` trước) |
| A3 | Đạt | Không áp dụng | Lượt 1 kết thúc bằng kế hoạch và mục "8. Xác nhận" (hỏi riêng từng mục 6a/6b/6c); hash sau lượt 1 không đổi |
| A4 | Không áp dụng | Đạt | In kế hoạch rồi viết ngay `DiscountCalculatorUnitTest` (không cần thay đổi cấu hình); dừng hỏi **riêng** về hai thay đổi `app/build.gradle` đúng như ngoại lệ trong `02-plan` ("kể cả khi `mode=auto`"). Hash giữa hai lượt: chỉ có thêm file test, `build.gradle` chưa đổi |
| A5 | Đạt | Đạt | Hash mọi file trong `src/main` không đổi. `CouponValidator`, `HttpCustomerApi`, `InvoiceExporter`, `DiscountActivity` nằm ở "Đơn vị bỏ qua" kèm gợi ý refactor (thay `TextUtils.isEmpty` bằng `raw == null \|\| raw.isEmpty()`, tiêm HTTP client/`Clock`/store) |
| A6 | Đạt | Đạt | Hai thay đổi `app/build.gradle` (thêm `androidx.arch.core:core-testing:2.2.0`, bật `enableUnitTestCoverage` cho `debug`) chỉ được áp dụng sau khi người dùng duyệt; diff đúng hai thay đổi đó. Robolectric (6c) bị từ chối và không được thêm. Không bật `returnDefaultValues` |
| A7 | Đạt | Đạt | `TaxRuleUnitTest.java` giữ nguyên hash; báo cáo ghi là lỗi có sẵn (kỳ vọng 108.0, nhận 110.0) |
| A8 | Đạt | Đạt | Bảng "Tham số đã hiểu" ở đầu kế hoạch (lần 2 xem trong transcript) |
| A9 | Không áp dụng | Không áp dụng | Không phải git repo; agent tự theo dõi file mình ghi |
| B1 | Đạt | Đạt | Android Java native, AGP 9.4.1, compileSdk 35, Java 17, Gradle 9.6.0 wrapper, JUnit 4.13.2, Mockito 5.24.0, `org.junit.Assert`; JaCoCo chưa bật |
| B2 | Đạt | Đạt | Hậu tố `*UnitTest`, cùng package trong `src/test/java`, JUnit 4, `org.junit.Assert` + `delta`, `assertThrows`, tên `method_condition_expected` (mọi method mới), `// Given/When/Then` |
| B3 | Đạt | Đạt | Mục tiêu: `DiscountCalculator`, `DiscountViewModel` (lần 1 thêm 2 case cho `PriceCalculator`); bỏ qua `Customer`, `Tier`, `CustomerApi` (không logic), `DiscountActivity` |
| B4 | Đạt | Đạt | Kiểm tra JDK, wrapper, `local.properties`. Lần 1 ghi rõ không đọc được thư mục SDK (ngoài vùng truy cập) và sẽ kiểm tra bằng lần build đầu, sẽ dừng hỏi nếu thiếu |
| C1 | Đạt | Đạt | Chỉ đọc `playbooks/android-java.md` |
| C2 | Đạt | Đạt | Mock `CustomerApi` bằng Mockito; `InstantTaskExecutorRule` cho `LiveData`; executor giữ lại `Runnable` để điều khiển thứ tự; không gọi mạng, không dùng API Android |
| C3 | Không áp dụng | Không áp dụng | Đơn vị dùng thời gian (`InvoiceExporter`) bị bỏ qua ở cả hai lần |
| C4 | Đạt | Đạt | Có đủ: 4 hạng, biên 9/10 đơn, PLATINUM + thưởng bị cắt ở 30%, `null` customer/tier, làm tròn, số tiền 0/âm/NaN; ViewModel: `idle` ban đầu, id `null`/rỗng không gọi API, `loading` trước khi executor chạy, `ready`, không tìm thấy, `IOException`, tier `null`, bỏ kết quả cũ (lần 1 kiểm cả hai thứ tự về) |
| C5 | Đạt | Đạt | Mọi test có assert; số thực dùng `delta`; exception kiểm thêm message |
| D1 | Đạt | Đạt | Báo cáo trích kết quả Gradle. Tự chạy lại cho cùng số test |
| D2 | Đạt | Đạt | Không cần vòng sửa nào; chạy từng class bằng `--tests` trước, rồi nhóm, rồi toàn module |
| D3 | Không áp dụng | Không áp dụng | Không truyền giá trị tham số không hợp lệ |
| D4 | Không áp dụng | Không áp dụng | Không có test mới nào fail |
| D5 | Đạt | Đạt | `TaxRuleUnitTest.java` giữ nguyên. Lần 1 **thêm** 2 test case vào `PriceCalculatorUnitTest.java` (đã nêu trong kế hoạch, được duyệt); 2 test cũ giữ nguyên nội dung (đã diff) |
| D6 | Không áp dụng | Không áp dụng | Không có bug production mới; mâu thuẫn VAT của test cũ được báo, không sửa |
| D7 | Đạt | Đạt | Chạy lại với `--rerun`, kết quả giống nhau |
| D8 | Đạt | Đạt | Hash: lần 1 chỉ có `app/build.gradle` (đã duyệt), 2 file test mới và `PriceCalculatorUnitTest.java` (thêm case); lần 2 chỉ có `app/build.gradle` (đã duyệt) và 2 file test mới. Lần 2 xóa `build/`, `app/build/`, `.gradle/`; lần 1 **không xóa được** và báo rõ trong báo cáo (xem vấn đề 2) |
| E1 | Đạt | Đạt | Đủ 8 mục theo `templates/report.md` |
| E2 | Đạt | Đạt | "Trước: không đo được" kèm lý do (JaCoCo chưa bật). "Sau": line 50,4% (60/119), branch 70,6% (24/34), có bảng theo class/package; cả hai ghi **chưa đạt** 80% và chỉ ra phần thiếu nằm ở đơn vị khó test. Cả hai ghi rõ phải loại `TaxRuleUnitTest` khi đo vì test fail chặn task coverage |
| E3 | Đạt | Đạt | Gợi ý refactor cho cả 3 đơn vị khó test |
| E4 | Đạt | Đạt | Chỉ báo pass sau khi đã chạy Gradle |
| E5 | Không áp dụng | Không áp dụng | Không truyền `save-report` |
| F1 | Đạt | Đạt | Cài bằng `install.mjs --target project`; gọi bằng `/unit-test` thành công |
| F2 | Đạt | Đạt | `npm run check`: "check passed" |
| F3 | Không áp dụng | Không áp dụng | Chưa có kết quả của Kiro và Codex |

**Kết luận:**
- Không có mục nào "Không đạt".
- Các bẫy riêng của Android đều được xử lý đúng ở cả hai lần:
  - nhận ra `CouponValidator` gọi `TextUtils` ("not mocked") ngay từ lúc đọc code, không bật `returnDefaultValues`, không tự thêm Robolectric;
  - nhận ra `LiveData` cần `InstantTaskExecutorRule` và đề xuất `core-testing` như thay đổi cần chấp thuận;
  - bật coverage chỉ sau khi được duyệt;
  - chỉ chạy `testDebugUnitTest` (một variant), dùng `--tests` và `--rerun`, không tạo instrumented test;
  - giữ JUnit 4 + `org.junit.Assert`, hậu tố `*UnitTest`.

## Vấn đề phát hiện và việc cần sửa

1. **Mode auto dừng giữa chừng để hỏi về thay đổi cấu hình.** Đây là hành vi đúng theo `02-plan` và spec ("thay đổi file build/manifest chỉ áp dụng sau khi người dùng chấp thuận"). Agent đã làm trước phần không cần duyệt (`DiscountCalculator`), rồi mới dừng. Với client chạy không tương tác (headless), người dùng phải resume phiên. Có thể ghi chú trong `INSTALL.md` của từng adapter: muốn chạy auto trọn vẹn thì cài sẵn dependency test trước. Chưa sửa.
2. **Lần 1 không dọn được `build/`, `app/build/`, `.gradle/`.** Lệnh `Remove-Item` nhiều đường dẫn trong cùng một dòng (kèm `gradlew.bat --stop`) không khớp allowlist nên cần người dùng duyệt; ở chế độ headless thì bị từ chối. Agent báo rõ trong báo cáo, không giấu. Đây là giới hạn quyền của cấu hình đánh giá, không phải lỗi agent. `playbooks/android-java.md` đã nói `build/` là output của Gradle và không bắt buộc phải xóa; có thể bỏ yêu cầu dọn `.gradle/`/`build/` cho Android để tránh hỏi thừa. Chưa sửa.
3. **Coverage thấp (50,4%) do thiết kế của dự án mẫu**: gần một nửa số dòng nằm ở đơn vị phụ thuộc framework Android hoặc tự tạo dependency. Cả hai lần đều dự báo đúng trong kế hoạch (lần 1 ước 50–55%) và báo cáo trung thực.
