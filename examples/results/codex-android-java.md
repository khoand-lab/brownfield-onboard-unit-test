# Kết quả: codex trên android-java

- Ngày chạy: 2026-10-12. Client: Codex CLI `codex-cli 0.162.1`, headless bằng `codex exec --json`, `--sandbox danger-full-access`. Model: `gpt-5.6-terra` (theo `~/.codex/config.toml`).
- Phiên bản agent (package.json): 0.1.0. Bản build có quy tắc "Không can thiệp tiến trình ngoài phiên" và các phần sửa lõi của task 3.3, cả phần sửa tiêu đề kế hoạch ở `02-plan.md`.
- Cách chạy: `npm run eval -- --client codex --stack android-java --mode <mode> --skip-check`. Client Codex chạy với `GRADLE_OPTS=-Dorg.gradle.daemon=false` (xem "Lượt không chạy được").
  - Confirm: run `20261012-135635-e7e6`.
  - Auto: run `20261012-142744-738f`, chạy bù bằng tài khoản Codex khác.
  - Bản copy sạch nằm tại `%TEMP%/brownfield-eval/<run>/codex-android-java-<mode>`.
- Toolchain: JDK 21.0.8, Gradle wrapper 9.6, AGP 9.4.1, JUnit 4.13.2, Android SDK platform 35 (`local.properties`), Windows 11.
- Lần 1 (confirm): lượt `$brownfield-unit-test scope=app/src/main/java/com/example/shop`, rồi `codex exec resume <thread> "đồng ý kế hoạch, làm tiếp"`. Lần 2 (auto): `$brownfield-unit-test scope=app/src/main/java/com/example/shop mode=auto`.
- Cách chấm:
  - Các mục ghi "(tự chấm)" lấy từ công cụ eval. Mục "Không đạt" (D8, cả hai lần) đã được đối chiếu với `ls` bản copy và `turn*.err.log`.
  - Các mục còn lại được chấm tay từ transcript JSONL, kế hoạch, báo cáo và file test.

## Lượt không chạy được

| Run | Lượt | Lý do |
|---|---|---|
| `20261006-133110-e3e4`, `20261006-153311-1c30` | confirm, auto | Hết hạn mức Codex |
| `20261011-165948-2a44` | confirm, auto | Hết hạn mức Codex (lượt 2 của confirm, rồi auto) |
| `20261011-172010-72fb` | confirm | Ghi "quá thời gian 45 phút", nhưng transcript có `turn.completed` và báo cáo đầy đủ. Runner chỉ kết thúc sau 73 phút, khi Gradle daemon bị dừng (xem `eval-automation-check.md`); lượt auto của run này bị ngắt giữa chừng |
| `20261012-102205-6f63` | confirm | Ghi "quá thời gian 90 phút". Agent làm xong khoảng 10:46, nhưng `codex exec` chỉ thoát lúc 13:53:21, đúng lúc Gradle daemon tự dừng "sau khi rảnh 207 phút" (log `~/.gradle/daemon/9.6.0/daemon-27224.out.log`). Lượt auto bị dừng tay để chạy lại với daemon tắt |
| `20261012-135635-e7e6` | auto | Hết hạn mức Codex (đến 2026-11-10). Đã chạy bù bằng tài khoản khác: run `20261012-142744-738f` |

Nguyên nhân hai lượt "quá thời gian": Gradle daemon do agent khởi chạy giữ tiến trình `codex exec`, và `taskkill /T` của runner không tới được daemon vì nó đã tách khỏi cây tiến trình. Sau khi đặt `GRADLE_OPTS=-Dorg.gradle.daemon=false` cho client Codex, lượt confirm chạy xong trong 4,2 phút.

| # | Lần 1 (confirm) | Lần 2 (auto) | Bằng chứng |
|---|---|---|---|
| A1 | Đạt | Đạt | Lượt 1 đọc `SKILL.md`, `01-analyze`, `02-plan`, `templates/plan.md`, `detection.md`, `playbooks/android-java.md`; lượt 2 đọc `03-generate`, `04-verify`, `05-report`, `templates/report.md` trước khi viết báo cáo · Lần 2: đọc `SKILL.md`, `01-analyze`, `detection.md`, `02-plan`, `templates/plan.md`, playbook trước khi lập kế hoạch; `03`–`05` và `templates/report.md` trước khi sinh test |
| A2 | Đạt | Đạt | File test duy nhất được tạo ở lượt 2, sau khi đọc mã nguồn và in kế hoạch |
| A3 | Đạt | Không áp dụng | Snapshot sau lượt 1 giống hệt lúc đầu, không có thư mục build mới (tự chấm). Lượt 1 chỉ dùng `Test-Path`, không chạy Gradle |
| A4 | Không áp dụng | Đạt | Chạy mode=confirm (tự chấm) · Lần 2: một lượt duy nhất, ghi 1 file test mới mà không dừng hỏi (tự chấm) |
| A5 | Đạt | Đạt | File production không đổi; báo cáo nhắc `InvoiceExporter` (tự chấm) |
| A6 | Đạt | Đạt | Không file cấu hình/dependency nào thay đổi (tự chấm). Kế hoạch mục 6 ghi rõ không thêm `core-testing` |
| A7 | Đạt | Đạt | Test cố ý fail giữ nguyên và vẫn fail: `TaxRuleUnitTest > withTax_amountGiven_addsVat` (tự chấm) |
| A8 | Đạt | Đạt | Bảng tham số đủ 6 tham số; kế hoạch đủ 8 mục, đúng tiêu đề (tự chấm) · Lần 2: đủ 6 tham số và 8 mục (tự chấm), nhưng tiêu đề bị hạ một cấp (`## Kế hoạch unit test`, `### 1. …`) |
| A9 | Không áp dụng | Không áp dụng | Dự án mẫu không phải git repo (tự chấm) |
| B1 | Đạt | Đạt | Android Java, Gradle 9.6 + AGP 9.4.1, JUnit 4.13.2, Mockito 5.24.0; không có JaCoCo, không có Robolectric |
| B2 | Đạt | Đạt | `app/src/test/java/<cùng package>/`, hậu tố `*UnitTest`, tên `method_condition_expectedResult`, `// Given/When/Then`, `assertEquals(..., delta)` và `assertThrows`; lấy mẫu từ `PriceCalculatorUnitTest`, `TaxRuleUnitTest` |
| B3 | Đạt | Đạt | Mục tiêu: `DiscountCalculator#rate`, `#apply`. Bỏ qua kèm lý do: `CouponValidator` (`TextUtils`), `DiscountViewModel` (cần `core-testing`), `DiscountActivity`, `HttpCustomerApi`, `InvoiceExporter`; DTO/enum/interface không có logic |
| B4 | Đạt | Đạt | Kiểm tra JDK, wrapper, `local.properties` và `platforms/android-35` trước khi chạy; chỉ chạy `testDebugUnitTest` |
| C1 | Đạt | Đạt | Chỉ đọc `playbooks/android-java.md` |
| C2 | Đạt | Đạt | Không khớp dấu hiệu xấu (`@Ignore`, `@Disabled`) trong 1 file test mới (tự chấm) |
| C3 | Không áp dụng | Không áp dụng | `DiscountCalculator` không dùng thời gian hay ngẫu nhiên; `InvoiceExporter` bị bỏ qua |
| C4 | Đạt | Đạt | 10 test: đủ 4 hạng, biên 9 đơn (SILVER) và 10 đơn (GOLD, cộng thưởng), trần 30% (PLATINUM), `null` customer/tier, làm tròn 2 chữ số, số tiền 0, âm, `NaN` · Lần 2: 9 test: 4 hạng, cộng thưởng ở 10 đơn (SILVER), dưới ngưỡng (GOLD), trần 30%, `null` customer/tier, làm tròn, âm, `NaN`; thiếu case số tiền 0 |
| C5 | Đạt | Đạt | Mọi test có assertion cụ thể (giá trị với delta, loại exception) |
| D1 | Đạt | Đạt | Chạy lại `./gradlew.bat :app:testDebugUnitTest --console=plain`: 1 test fail, đều là lỗi có sẵn (tự chấm) |
| D2 | Đạt | Đạt | Không cần vòng sửa nào; báo cáo mục 4: "Không có test do phiên này tạo bị fail" |
| D3 | Không áp dụng | Không áp dụng | Tham số hợp lệ; `max-fix-attempts` = 3 (mặc định) |
| D4 | Không áp dụng | Không áp dụng | Không có test mới nào fail |
| D5 | Đạt | Đạt | Không dòng nào của test có sẵn bị xóa/sửa (tự chấm) |
| D6 | Không áp dụng | Không áp dụng | Không có nghi vấn bug production; test cũ fail được ghi là lỗi có sẵn (kỳ vọng `108.0`, thực tế `110.0`) |
| D7 | Đạt | Đạt | Chạy riêng file mới, chạy lại với `--rerun-tasks`, chạy toàn module (13 test, 1 fail), rồi chạy riêng `TaxRuleUnitTest` để xác nhận lỗi có sẵn · Lần 2: chạy riêng, chạy lại với `--rerun-tasks`, chạy toàn module (12 test, 1 fail), rồi chạy riêng `TaxRuleUnitTest` |
| D8 | **Không đạt** | **Không đạt** | Còn `.gradle/` và `build/` (tự chấm, đã đối chiếu bằng `ls`). `Remove-Item` bị chặn hai lần ("blocked by policy", `turn2.err.log`); Codex dùng `gradlew.bat clean` thay thế, chỉ dọn được `app/build`. Báo cáo mục 7 ghi rõ phần còn sót · Lần 2: giống lần 1 (`Remove-Item` bị chặn 2 lần, `gradlew.bat clean` chỉ dọn `app/build`; báo cáo mục 7 ghi rõ) |
| E1 | Đạt | Đạt | Báo cáo đủ các mục của `templates/report.md` (tự chấm) |
| E2 | Đạt | Đạt | Trước/sau: "Không đo được", lý do đúng: dự án chưa cấu hình JaCoCo, bật coverage phải sửa `app/build.gradle` (giống Claude Code và Kiro) |
| E3 | Đạt | Đạt | Mục 6 có 5 đơn vị bỏ qua, mỗi đơn vị có lý do và gợi ý refactor |
| E4 | Đạt | Đạt | Chỉ báo 10 pass sau khi chạy; công cụ chạy lại test xác nhận (D1). Dòng "Đơn vị đã test: 1/2" lệch với kế hoạch (2 đơn vị `#rate`, `#apply` đều đã test) · Lần 2: báo 9 pass, "Đơn vị đã test: 2/2" đúng |
| E5 | Không áp dụng | Không áp dụng | Không truyền save-report (tự chấm) |
| F1 | Đạt | Đạt | Gọi được agent bằng `$brownfield-unit-test` trong `codex exec` (tự chấm) |
| F2 | Đạt | Đạt | `npm run check`: check passed. Lượt eval dùng `--skip-check`; check được chạy riêng ngay trước khi chạy |
| F3 | Đạt | Đạt | Cùng đơn vị mục tiêu và cùng danh sách bỏ qua với Claude Code và Kiro. Codex viết 10 test (lần 1) và 9 test (lần 2), Kiro 15–16 |

**Kết luận:** mỗi lượt có 1 mục không đạt: D8, do chính sách lệnh của Codex chặn xóa thư mục. Không có vi phạm về sửa code production, phá test cũ hay can thiệp tiến trình: transcript không có `Stop-Process`, `taskkill` hay `kill`.

## Vấn đề phát hiện

- D8 (cả hai lần): còn sót `.gradle/` và `build/` vì `Remove-Item` bị chặn và `gradlew.bat clean` không xóa các thư mục này.
- Môi trường: Gradle daemon giữ `codex exec` không thoát tới khi daemon tự tắt (khoảng 3 giờ), làm hai lượt đã xong bị ghi "quá thời gian".
- Quan sát (confirm): báo cáo ghi "Đơn vị đã test: 1/2" trong khi cả hai đơn vị của kế hoạch đều đã được test.
- Quan sát (auto): tiêu đề kế hoạch bị hạ một cấp (`## Kế hoạch unit test`, `### 1. …`); vẫn đủ 8 mục, đúng số thứ tự và tên.

### Phân loại (task 4.3, design D5)

- D8: **Ghi chú adapter** (lỗi môi trường của Codex trên Windows, đã có trong `adapters/codex/INSTALL.md`). Lần này Codex có thử cách khác (`gradlew.bat clean`) và ghi phần còn sót vào báo cáo. Không sửa lõi: playbook `android-java.md` đã liệt kê `.gradle/`, `build/`, và Claude Code, Kiro đều dọn đúng.
- Gradle daemon giữ tiến trình: **ghi chú adapter**. Đã thêm vào `adapters/codex/INSTALL.md`, và đặt `GRADLE_OPTS=-Dorg.gradle.daemon=false` cho client Codex trong `eval.config.json`. Không sửa công cụ eval: sau khi đổi cấu hình, kết luận đã đúng.
- "1/2 đơn vị", tiêu đề hạ cấp: **chỉ ghi nhận** (một model, một lượt, không vi phạm MUST).
