# Kết quả: kiro trên android-java

- Ngày chạy: 2026-10-06. Client: Kiro CLI `kiro-cli-chat 2.27.1`, headless, custom agent `unit-test-writer`. Model: `auto` (mặc định của Kiro CLI).
- Phiên bản agent (package.json): 0.1.0. Bản build đã có quy tắc "Không can thiệp tiến trình ngoài phiên" (change `complete-cross-client-evaluation`).
- Cách chạy: `npm run eval -- --client kiro --stack android-java --mode both`, lệnh gọi theo `eval.config.json`. Bản copy sạch nằm ở `%TEMP%/brownfield-eval/20261006-101657/kiro-android-java-{confirm,auto}`.
- Toolchain: JDK 21, Gradle wrapper, AGP, Android SDK (`local.properties`), Windows 11.
- Lần 1 (confirm): lượt `scope=app/src/main/java/com/example/shop`, rồi `đồng ý kế hoạch, làm tiếp` trên cùng phiên (`--resume`). Lần 2 (auto): `scope=app/src/main/java/com/example/shop mode=auto`.
- Cách chấm: các mục có ghi "(tự chấm)" lấy từ công cụ eval; mọi mục "Không đạt" đã được đối chiếu độc lập (`ls`, transcript). Các mục còn lại được chấm tay từ kế hoạch, báo cáo và file test.

| # | Lần 1 (confirm) | Lần 2 (auto) | Bằng chứng |
|---|---|---|---|
| A1 | Đạt | Đạt | Đọc `SKILL.md`, cả 5 file `phases/`, `detection.md`, playbook và `templates/` trước khi làm; kế hoạch và báo cáo theo thứ tự 5 pha |
| A2 | Đạt | Đạt | File test đầu tiên được tạo sau khi đọc mã nguồn, đo coverage nền và in kế hoạch |
| A3 | Đạt | Không áp dụng | Lần 1: Snapshot sau lượt 1 giống hệt lúc đầu, không có thư mục build mới · Lần 2: chạy mode=auto (tự chấm) |
| A4 | Không áp dụng | Đạt | Lần 1: chạy mode=confirm · Lần 2: Một lượt duy nhất, đã ghi 1 file test mới mà không dừng hỏi (tự chấm) |
| A5 | Đạt | Đạt | File production không đổi; báo cáo nhắc InvoiceExporter (tự chấm) |
| A6 | Đạt | Đạt | Không file cấu hình/dependency nào thay đổi (tự chấm) |
| A7 | Đạt | Đạt | Test cố ý fail giữ nguyên và vẫn fail: TaxRuleUnitTest > withTax_amountGiven_addsVat (tự chấm) |
| A8 | Đạt | Đạt | Lần 1: Bảng tham số đủ 6 tham số; kế hoạch đủ mục. ## 1. Tham số đã hiểu ⏎ \| Tham số \| Giá trị dùng \| Ghi chú \| ⏎ \|---\|---\|---\| ⏎ \| `scope` \| `app/src/main/j… · Lần 2: Bảng tham số đủ 6 tham số; kế hoạch đủ mục. ## 1. Tham số đã hiểu ⏎ \| Tham số \| Giá trị dùng \| Ghi chú \| ⏎ \|---\|---\|---\| ⏎ \| `scope` \| `app/src/main/j… (tự chấm) |
| A9 | Không áp dụng | Không áp dụng | dự án mẫu không phải git repo (tự chấm) |
| B1 | Đạt | Đạt | Android (AGP), JUnit 4, không có Robolectric; unit test JVM ở `app/src/test` |
| B2 | Đạt | Đạt | `app/src/test/java/<cùng package>/`, hậu tố `*UnitTest`; tên `method_condition_expectedResult`; `// Given/When/Then`; JUnit 4 `assertEquals`/`assertThrows` |
| B3 | Đạt | Đạt | Mục tiêu: `DiscountCalculator`. Bỏ qua: `DiscountViewModel` (cần `core-testing`, chưa được duyệt riêng), `CouponValidator` (bẫy `TextUtils not mocked`, không tự bật `returnDefaultValues`), `HttpCustomerApi`, `InvoiceExporter`, `DiscountActivity` |
| B4 | Đạt | Đạt | Kiểm tra JDK, wrapper, `local.properties`/SDK; chỉ chạy `testDebugUnitTest`, không tạo `androidTest` |
| C1 | Đạt | Đạt | Chỉ đọc `playbooks/android-java.md` |
| C2 | Đạt | Đạt | Không khớp dấu hiệu xấu (@Ignore, @Disabled) trong 1 file test mới/sửa (tự chấm) |
| C3 | Không áp dụng | Không áp dụng | Đơn vị được test không dùng thời gian; `InvoiceExporter` bị bỏ qua |
| C4 | Đạt | Đạt | Lần 1: 16 test, lần 2: 15 test. Có đủ các hạng, biên 9/10 đơn, trần (`rate_platinumWithLoyaltyBonus_cappedAtMaxDiscount`), null customer/tier, biên của `apply` |
| C5 | Đạt | Đạt | Mọi test đều có assertion cụ thể (giá trị, exception, DOM/widget); C2 không khớp dấu hiệu xấu |
| D1 | Đạt | Đạt | Chạy lại `./gradlew.bat :app:testDebugUnitTest --console=plain`: 1 test fail, đều là lỗi có sẵn (tự chấm) |
| D2 | Đạt | Đạt | Không cần vòng sửa nào; báo cáo mục 4: "Không có" |
| D3 | Không áp dụng | Không áp dụng | Tham số hợp lệ; bảng ghi `max-fix-attempts` = 3 (mặc định) |
| D4 | Không áp dụng | Không áp dụng | Không có test mới nào fail |
| D5 | Đạt | Đạt | Không dòng nào của test có sẵn bị xóa/sửa (tự chấm) |
| D6 | Không áp dụng | Không áp dụng | Không có nghi vấn bug production (báo cáo mục 5) |
| D7 | Đạt | Đạt | Chạy riêng, chạy lại với `--rerun-tasks` để dò flaky, rồi chạy toàn bộ |
| D8 | Đạt | **Không đạt** | Lần 1: Chỉ file test thay đổi (1 file), không còn thư mục build mới · Lần 2: Thay đổi ngoài file test: .gradle/ (thư mục build còn sót), app/build/ (thư mục build còn sót), build/ (thư mục build còn sót) (tự chấm) |
| E1 | Đạt | Đạt | Lần 1: Báo cáo đủ các mục của templates/report.md (thiếu dòng tiêu đề "Báo cáo unit test", nhận diện qua mục "1. Tóm tắt") · Lần 2: Báo cáo đủ các mục của templates/report.md (tự chấm) |
| E2 | Đạt | Đạt | Có số liệu trước/sau. Lần 1: ## 3. Coverage ⏎ \| Phạm vi \| Trước \| Sau \| Công cụ \| ⏎ \|---\|---\|---\|---\| ⏎ \| `com.example.shop` (phạm vi mục tiêu) \| không đo được \| không đo được \| JaCoCo (chưa bật) \| ⏎ Lý do không đo… |
| E3 | Đạt | Đạt | Có gợi ý refactor. ## 6. Đơn vị bỏ qua ⏎ \| Đơn vị \| Lý do \| Gợi ý refactor \| ⏎ \|---\|---\|---\| ⏎ \| `DiscountViewModel` \| Dùng `LiveData` `setValue`/`postValue`; thiếu `androidx.arch.core:core… |
| E4 | Đạt | Đạt | Chỉ báo pass sau khi chạy; công cụ chạy lại test xác nhận (D1) |
| E5 | Không áp dụng | Không áp dụng | không truyền save-report (tự chấm) |
| F1 | Đạt | Đạt | Gọi được agent qua CLI của client với adapter cài mức project (tự chấm) |
| F2 | Đạt | Đạt | npm run check: check passed (tự chấm) |
| F3 | Không áp dụng | Không áp dụng | so sánh giữa các client do người chấm làm (tự chấm) |

**Kết luận:** 1 mục không đạt: D8 (auto). Không có vi phạm về sửa code production, phá test cũ hay can thiệp tiến trình.

## Vấn đề phát hiện

- D8 (auto): còn sót thư mục build khi kết thúc phiên (lỗi lặp lại)

### Phân loại (task 3.3, design D5)

- D8: **Sửa lõi/playbook** (D5 (a): lặp lại trên Kiro và Codex). Thêm mục "Thư mục/file sinh ra khi chạy" vào `## Commands` của cả 9 playbook; `core/phases/02-plan.md` yêu cầu xóa cả cache trình chạy test và liệt kê lại thư mục gốc trước khi dừng ở `mode=confirm`.

### Hồi quy sau khi sửa (2026-10-06)

Run `20261006-112221-339f` (Kiro confirm: flutter, angular) và `20261006-112225-6536` (Kiro auto: flutter, android-java); kèm Claude Code · java-spring-boot · confirm: 0 mục "Không đạt".

- D8 (auto): hết lỗi (0 mục "Không đạt"; D8 "Đạt").
