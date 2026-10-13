# Kết quả: kiro trên java-spring-boot

- Ngày chạy: 2026-10-04 (vòng 1) và 2026-10-05 (vòng 2, sau khi sửa lõi). Client: Kiro CLI `kiro-cli-chat 2.27.1`, chạy headless. Model: `auto` (mặc định của Kiro CLI).
- Phiên bản agent (package.json): 0.1.0
- Cài đặt: cách A (mức project) bằng `install.mjs --client kiro --target project` vào các bản copy sạch của `examples/java-spring-boot`. Toolchain: JDK 21, Maven 3.9.11, Windows 11.
- Lệnh gọi (custom agent, đúng như `adapters/kiro/INSTALL.md`):
  - Lần 1 (confirm), hai lượt:
    1. `kiro-cli chat --agent unit-test-writer --no-interactive --trust-all-tools "scope=src/main/java/com/example/shop coverage-target=80"`
    2. `kiro-cli chat --resume --agent unit-test-writer --no-interactive --trust-all-tools "đồng ý kế hoạch, làm tiếp"`
  - Lần 2 (auto): `kiro-cli chat --agent unit-test-writer --no-interactive --trust-all-tools "scope=src/main/java/com/example/shop coverage-target=80 mode=auto max-fix-attempts=20"`
- Kiểm chứng độc lập:
  - Lấy sha256 các file (trừ `.kiro/`, `target/`) trước, giữa (sau lượt 1 của lần confirm) và sau mỗi lần chạy để so sánh.
  - Tự chạy `mvn -q test` trên từng bản: vòng 2 confirm có 21 test và 1 fail, vòng 2 auto có 19 test và 1 fail. Test fail duy nhất là `TaxRuleTests.givenAmount_whenWithTax_thenAddsVat`, lỗi có sẵn.
  - Đọc log tool call của Kiro.

## Vòng 1 (bản build trước khi sửa lõi)

Vòng 1 có ba mục không đạt, đều đã sửa trong lõi (xem phần cuối):

| # | Lần 1 (confirm) | Lần 2 (auto) | Bằng chứng |
|---|---|---|---|
| D3 | Không áp dụng | **Không đạt** | Kế hoạch: "người dùng đưa `20`, ngoài khoảng hợp lệ 1–10 → dùng tối đa hợp lệ **10**". Đúng ra phải dùng mặc định 3 |
| E2 | **Không đạt** | Đạt | Lần confirm không đo coverage "trước" ("không đo ở điểm dừng này để giữ dự án sạch"). Báo cáo chỉ ghi "0% (chưa có test)" / "một phần" thay cho số đo |
| D8 | **Không đạt** | Đạt | Sau lần confirm, dự án còn thư mục `target/`, dù lúc đầu phiên không có. Agent chỉ kiểm tra thời điểm sửa của `src/main` và `pom.xml` |

Các mục còn lại của vòng 1 cho kết quả giống vòng 2.

## Vòng 2 (bản build sau khi sửa lõi)

| # | Lần 1 (confirm) | Lần 2 (auto) | Bằng chứng |
|---|---|---|---|
| A1 | Đạt | Đạt | Đọc `SKILL.md` → `detection.md`, các file `phases/` → `playbooks/java-spring-boot.md` → `templates/`. Kế hoạch có đủ 8 mục, báo cáo có đủ 8 mục, đúng tên mục trong template |
| A2 | Đạt | Đạt | Lệnh tạo file đầu tiên (`Creating DiscountServiceTests.java`) xuất hiện sau khi đã đọc mã nguồn, đo coverage "trước" và in kế hoạch |
| A3 | Đạt | Không áp dụng | Lượt 1 kết thúc ở mục "8. Xác nhận". Hash sau lượt 1 giống hệt lúc đầu; `target/` sinh ra khi đo coverage đã bị xóa trước khi dừng |
| A4 | Không áp dụng | Đạt | In kế hoạch rồi tạo test ngay, không hỏi |
| A5 | Đạt | Đạt | Hash `src/main` không đổi. `InvoiceExporter` nằm ở "Đơn vị bỏ qua", kèm gợi ý tiêm `Clock`, writer và `HttpClient` |
| A6 | Đạt | Đạt | Không thêm dependency. JaCoCo chạy qua goal CLI, không sửa `pom.xml` |
| A7 | Đạt | Đạt | `TaxRuleTests` giữ nguyên hash; báo cáo ghi là lỗi có sẵn (VAT 10% so với kỳ vọng 8%) |
| A8 | Đạt | Đạt | Bảng "Tham số đã hiểu" ghi `(mặc định)` cho các tham số không truyền |
| A9 | Không áp dụng | Không áp dụng | Dự án mẫu không phải git repo; agent kiểm tra và ghi "không phải git repo" |
| B1 | Đạt | Đạt | Maven, Spring Boot 3.3.5, JUnit 5, Mockito, AssertJ (qua `spring-boot-starter-test`) |
| B2 | Đạt | Đạt | Hậu tố `*Tests`, tên `given_when_then`, `// arrange/act/assert`, AssertJ `isEqualByComparingTo` |
| B3 | Đạt | Đạt | `DiscountService` là mục tiêu chính; bỏ qua record, enum, interface, exception và `ShopApplication` |
| B4 | Đạt | Đạt | Chạy `java -version`, `mvn -v`, kiểm tra `mvnw` trước khi chạy test |
| C1 | Đạt | Đạt | Chỉ đọc `playbooks/java-spring-boot.md` |
| C2 | Đạt | Đạt | `@ExtendWith(MockitoExtension.class)` và mock `CustomerRepository`; không có `@SpringBootTest` |
| C3 | Không áp dụng | Không áp dụng | Đơn vị được test không dùng thời gian hay ngẫu nhiên |
| C4 | Đạt | Đạt | Đủ các hạng, biên 9/10 đơn, **trần 30% (PLATINUM 0.28 + 0.05 → 0.30)**, id null/blank, không tìm thấy khách, amount null/âm/0, làm tròn HALF_UP |
| C5 | Đạt | Đạt | Mọi test có `assertThat`/`assertThatThrownBy` |
| D1 | Đạt | Đạt | Chạy từng class bằng `mvn test -Dtest=...` rồi chạy toàn module; báo cáo trích số liệu surefire. Tự chạy lại cho cùng kết quả |
| D2 | Đạt | Đạt | Không cần vòng sửa nào |
| D3 | Không áp dụng | **Đạt** | Kế hoạch: "Người dùng đưa `20`, ngoài khoảng hợp lệ 1–10, dùng mặc định 3 (không kẹp về 10)" |
| D4 | Không áp dụng | Không áp dụng | Không có test mới nào fail |
| D5 | Đạt | Đạt | Lần confirm chỉ thêm 3 case vào `PriceCalculatorTests`; diff so với bản gốc không có dòng nào bị xóa. `TaxRuleTests` không đổi |
| D6 | Không áp dụng | Không áp dụng | Không có nghi vấn bug |
| D7 | Đạt | Đạt | "rerun both new files once more ... Consistent results" |
| D8 | **Đạt** | Đạt | Hash: chỉ có file test mới hoặc đã sửa. Thư mục gốc chỉ còn `.kiro`, `README.md`, `pom.xml`, `src` |
| E1 | Đạt | Đạt | Đủ 8 mục theo `templates/report.md` |
| E2 | **Đạt** | Đạt | Lần confirm: instruction ~16% → ~74%, hai đơn vị mục tiêu → 100%. Lần auto: 16.5% → 71.8%. Cả hai ghi rõ chưa đạt 80% ở mức package và lý do |
| E3 | Đạt | Đạt | Có gợi ý refactor `InvoiceExporter` |
| E4 | Đạt | Đạt | Chỉ báo pass sau khi đã chạy `mvn` |
| E5 | Không áp dụng | Không áp dụng | Không truyền `save-report` |
| F1 | Đạt | Đạt | Cài bằng `install.mjs --client kiro --target project` và gọi bằng custom agent `unit-test-writer`. Skill được nạp qua `resources` |
| F2 | Đạt | Đạt | `npm run check`: "check passed" |
| F3 | Đạt | Đạt | So với Claude Code: cùng đơn vị mục tiêu, cùng quy ước, cùng cách xử lý `TaxRuleTests` và `InvoiceExporter`. Xem `cross-client.md` |

**Kết luận:** vòng 2 không có mục nào "Không đạt".

## Vấn đề phát hiện và việc đã sửa

1. **Giá trị không hợp lệ bị kẹp về biên** (D3, vòng 1). Model tự suy ra rằng người dùng "muốn càng nhiều càng tốt" nên dùng 10. Đã sửa: `core/AGENT.md` nói rõ phải dùng đúng giá trị mặc định, không kẹp về biên, không đoán ý định.
2. **Không đo coverage "trước" ở `mode=confirm`** (E2, vòng 1). Đã sửa: `core/phases/01-analyze.md` ghi rõ phải đo trong mọi `mode`, và coi công cụ gọi được qua CLI (goal JaCoCo) là "có công cụ coverage".
3. **Bỏ sót `target/` khi kiểm tra thay đổi** (D8, vòng 1). Đã sửa: `core/phases/04-verify.md` bước 6 yêu cầu liệt kê thư mục gốc của module và so với lúc đầu phiên.
4. **Ghi chú môi trường:** `kiro-cli` cài ở `%LOCALAPPDATA%\Kiro-Cli\`. Thư mục này có trong PATH của user nhưng shell mở trước khi cài sẽ không thấy; cần mở shell mới. Khi chạy qua PowerShell, lệnh `mvn` trả exit code 1 vì cảnh báo ByteBuddy ghi ra stderr. Agent tự nhận ra điều này và đọc dòng `BUILD SUCCESS` để xác định kết quả.
