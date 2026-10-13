# Kết quả: claude-code trên java-spring-boot

- Ngày chạy: 2026-09-30. Client: Claude Code 2.1.285, chạy headless (`claude -p`). Model: `cc/claude-opus-5-5`.
- Phiên bản agent (package.json): 0.1.0
- Cài đặt: cách A (dạng rời, mức project) vào hai bản copy sạch của `examples/java-spring-boot`. Toolchain: JDK 21, Maven 3.9.11.
- Lệnh gọi lần 1 (confirm), hai lượt trên cùng session:
  1. `claude -p "/unit-test scope=src/main/java/com/example/shop coverage-target=80" --session-id <uuid> ...`
  2. `claude -p "đồng ý kế hoạch, làm tiếp" --resume <uuid> ...`
- Lần 3 (subagent, confirm): `claude -p "Dùng subagent unit-test-writer viết test cho scope=src/main/java/com/example/shop coverage-target=80 ..."`
- Lệnh gọi lần 2 (auto): `claude -p "/unit-test scope=src/main/java/com/example/shop coverage-target=80 mode=auto max-fix-attempts=20" ...`
- Tham số chung: `--permission-mode acceptEdits`, allowedTools gồm Read/Write/Edit/Glob/Grep/Skill và Bash giới hạn (`mvn`, `ls`, `find`, `cat`, `git`, `mkdir`, `date`, `java`).
- Kiểm chứng độc lập:
  - Lấy sha256 của `src/` trước và sau mỗi lần chạy để so sánh.
  - Tự chạy `mvn -q test` trên cả hai bản: 23 test, 1 fail (`TaxRuleTests.givenAmount_whenWithTax_thenAddsVat`, lỗi có sẵn).
  - Đọc transcript `.jsonl` để lấy thứ tự tool call.

| # | Lần 1 (confirm) | Lần 2 (auto) | Bằng chứng |
|---|---|---|---|
| A1 | Đạt | Đạt | Transcript đọc lần lượt `01-analyze` → `detection.md` → playbook → `02-plan` → `03-generate` → `04-verify` → `05-report`; kế hoạch và báo cáo đúng template |
| A2 | Đạt | Đạt | Write/Edit đầu tiên xuất hiện sau khi đọc xong mã nguồn, chạy baseline JaCoCo và in kế hoạch |
| A3 | Đạt | Không áp dụng | Lượt 1 kết thúc bằng kế hoạch và câu hỏi xác nhận; lúc đó `src/` vẫn đúng 10 file, hash không đổi. Chỉ ghi file sau lượt "đồng ý kế hoạch, làm tiếp" |
| A4 | Không áp dụng | Đạt | In "Kế hoạch unit test" rồi Write `DiscountServiceTests.java` ngay, không hỏi |
| A5 | Đạt | Đạt | Hash `src/main` không đổi. `InvoiceExporter` nằm ở "Đơn vị bỏ qua", kèm gợi ý tiêm `Clock`, storage và `HttpClient` |
| A6 | Đạt | Đạt | Không thêm dependency. JaCoCo chạy qua CLI (`org.jacoco:jacoco-maven-plugin:0.8.12:...`), không sửa `pom.xml` |
| A7 | Đạt | Đạt | `TaxRuleTests` giữ nguyên hash; báo cáo mục 7 ghi là lỗi có sẵn (VAT 8% so với 10%) |
| A8 | Đạt | Đạt | Bảng "Tham số đã hiểu" ở đầu kế hoạch: `mode=confirm`, `max-fix-attempts=3`, `failed-test-policy=remove` là mặc định |
| A9 | Không áp dụng | Không áp dụng | Dự án mẫu không phải git repo. Agent kiểm tra bằng `git rev-parse` và ghi nhận điều này |
| B1 | Đạt | Đạt | Maven, JUnit 5, Mockito, AssertJ, Spring Boot |
| B2 | Đạt | Đạt | Hậu tố `*Tests`, tên `given_when_then`, `// arrange/act/assert`, AssertJ `isEqualByComparingTo` |
| B3 | Đạt | Đạt | `DiscountService` là mục tiêu chính; bỏ qua record, enum, interface, exception và `ShopApplication` |
| B4 | Đạt | Đạt | Chạy `java -version`, `mvn -v`, kiểm tra `mvnw` trước khi chạy test |
| C1 | Đạt | Đạt | Chỉ đọc `playbooks/java-spring-boot.md` |
| C2 | Đạt | Đạt | `@ExtendWith(MockitoExtension.class)`, `@Mock CustomerRepository`, không có `@SpringBootTest` |
| C3 | Không áp dụng | Không áp dụng | Đơn vị được test không dùng thời gian hay ngẫu nhiên. Đơn vị có dùng (`InvoiceExporter`) bị bỏ qua đúng |
| C4 | Đạt | Đạt | Có đủ: các hạng, thưởng ở biên 9/10 đơn, id null/rỗng/trắng, không tìm thấy khách, số tiền null/âm/0, làm tròn HALF_UP. Trần 30% không thể chạm tới (xem vấn đề 1); cả hai lần đều phát hiện và ghi rõ |
| C5 | Đạt | Đạt | Mọi test có `assertThat`/`assertThatThrownBy`; case lỗi thêm `verify(..., never())` |
| D1 | Đạt | Đạt | Báo cáo trích số lượt chạy (20 pass) và kết quả `mvn`. Tự chạy lại cho cùng kết quả |
| D2 | Đạt | Đạt | Không cần vòng sửa nào; test pass ngay lần đầu |
| D3 | Không áp dụng | Đạt | Báo cáo: "`max-fix-attempts=20`, ngoài khoảng 1–10, nên tôi dùng mặc định 3" |
| D4 | Không áp dụng | Không áp dụng | Không có test mới nào fail |
| D5 | Đạt | Đạt | Test cũ trong `PriceCalculatorTests` giữ nguyên; chỉ thêm method mới. `TaxRuleTests` không đổi |
| D6 | Không áp dụng | Không áp dụng | Không có nghi vấn bug production. Test đúng theo Javadoc |
| D7 | Đạt | Đạt | Chạy lại lần 2 (lần 1 chạy 3 lần), kết quả giống hệt |
| D8 | Đạt | Đạt | So sánh hash: chỉ `DiscountServiceTests.java` (mới) và `PriceCalculatorTests.java` (thêm case). Agent tự xóa `target/` |
| E1 | Đạt | Đạt | Đủ 8 mục theo `templates/report.md` |
| E2 | Đạt | Đạt | JaCoCo: dòng 14.5% → 58.2%, nhánh 4/19 → 19/19. Ghi rõ chưa đạt 80% và lý do |
| E3 | Đạt | Đạt | Có gợi ý refactor `InvoiceExporter`, ước tính coverage đạt ~94% sau refactor |
| E4 | Đạt | Đạt | Chỉ báo pass sau khi đã chạy `mvn` |
| E5 | Không áp dụng | Không áp dụng | Không truyền `save-report`; báo cáo ghi "Không lưu file báo cáo" |
| F1 | Đạt | Đạt | Cài bằng `install.mjs --target project`; gọi bằng `/unit-test` thành công. Lần 3 gọi qua subagent: transcript có `subagent_type: unit-test-writer`, subagent trả kế hoạch và dừng, `src/` không đổi |
| F2 | Đạt | Đạt | `npm run check`: "check passed" |
| F3 | Không áp dụng | Không áp dụng | Chưa có kết quả của Kiro và Codex; sẽ so sánh ở task 8.x và 9.x |

**Kết luận:** không có mục nào "Không đạt". Hai lần chạy cho kết quả nhất quán: cùng đơn vị mục tiêu, cùng quy ước, cùng coverage, cùng cách xử lý `TaxRuleTests`.

## Vấn đề phát hiện và việc cần sửa

1. **Dự án mẫu có trần 30% không chạm tới được** (mức cao nhất là GOLD + thưởng = 25%), nên mục "trần 30%" của C4 không kiểm được thật. Agent phát hiện đúng điều này và không bịa test. **Đã sửa sau lần đánh giá này:** thêm hạng `PLATINUM` 0.28 (28% + thưởng 5% bị cắt còn 30%). Lần đánh giá sau (hoặc khi so sánh với Kiro/Codex) cần kiểm tra agent có test nhánh trần.
2. **Bổ sung quy tắc dọn dẹp tại điểm dừng của `mode=confirm`.**
   - Bối cảnh: lần 3 đầu tiên chạy trên bản copy còn `target/`. Thư mục này có từ trước vì bản gốc `examples/java-spring-boot/` bị bẩn bởi lần `mvn test` khi chuẩn bị. Agent đã nhận ra `target/` có sẵn và chỉ xóa `jacoco.exec` cùng `site/` do nó tạo ra. Hành vi này đúng.
   - Khoảng trống tìm thấy khi rà soát: quy tắc dọn file build chỉ nằm ở pha kiểm chứng. Nếu người dùng không xác nhận kế hoạch, file sinh ra khi đo coverage "trước" có thể còn lại.
   - Đã sửa: bổ sung quy tắc dọn dẹp tại điểm dừng vào `core/phases/02-plan.md`, rồi build lại.
   - Kiểm chứng: xóa `target/` khỏi bản gốc rồi chạy lại lần 3 trên bản sạch. Agent xóa `target/` trước khi dừng; dự án chỉ còn `.claude/`, `README.md`, `pom.xml`, `src/`.
   - Bài học cho bước chuẩn bị: copy dự án mẫu trước, rồi mới chạy `mvn test` trên bản copy.
3. **Model khi chạy headless qua gateway.** Khi đặt `ANTHROPIC_BASE_URL`, `--resume` hoặc `--model` phải dùng id `cc/claude-opus-5-5`; nếu không sẽ báo lỗi "issue with the selected model". Đây là đặc thù môi trường, không phải lỗi agent. Chỉ cần ghi chú cho người đánh giá.
4. **`plugin.json` chưa có `author`.** Đã sửa: thêm `author: khoand11`; `claude plugin validate` pass.

## Hồi quy sau khi sửa lõi (2026-10-05)

Phiên 2026-10-05 sửa `core/AGENT.md` và các file `core/phases/01-analyze.md`, `02-plan.md`, `04-verify.md`, `05-report.md`, dựa trên kết quả đánh giá Kiro và Codex. Lượt dưới đây chạy lại lần 1 (confirm) để kiểm tra Claude Code không bị ảnh hưởng ngược.

- Client: Claude Code 2.1.289, headless, cài mức project vào bản copy sạch.
- Lệnh, hai lượt trên cùng session:
  1. `claude -p "/unit-test scope=src/main/java/com/example/shop coverage-target=80" --session-id <uuid>`
  2. `claude -p "đồng ý kế hoạch, làm tiếp" --resume <uuid>`
- Kết quả:
  - **A3:** hash sau lượt 1 giống hệt lúc đầu; thư mục gốc chỉ còn `.claude`, `README.md`, `pom.xml`, `src`.
  - **E2:** coverage "trước" được đo ngay ở chế độ confirm: dòng 8/56 = 14.3%, nhánh 4/20 = 20%. Sau phiên: 58.9% dòng, 100% nhánh.
  - **E1:** kế hoạch và báo cáo đủ 8 mục.
  - **D5:** `PriceCalculatorTests` chỉ được thêm case, không dòng cũ nào bị xóa.
  - **D8:** không còn `target/` sau phiên.
  - **C4:** có test cho trần 30% (PLATINUM).
  - Tự chạy `mvn -q test`: 24 test, 1 fail (`TaxRuleTests`, lỗi có sẵn).
- Kết luận: không có hồi quy.
