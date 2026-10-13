# Kết quả: codex trên java-spring-boot

- Ngày chạy: 2026-10-05. Client: Codex CLI `codex-cli 0.160.0`, chạy headless bằng `codex exec`. Model: `gpt-5.6-terra`, reasoning `medium` (theo `~/.codex/config.toml`).
- Phiên bản agent (package.json): 0.1.0
- Cài đặt: `install.mjs --client codex --target project` vào các bản copy sạch của `examples/java-spring-boot`. Toolchain: JDK 21, Maven 3.9.11, Windows 11.
- Sandbox: `--sandbox danger-full-access`, chỉ dùng trên bản copy trong thư mục tạm, theo ghi chú Windows trong `adapters/codex/INSTALL.md`. Người dùng đã cho phép.
- Lệnh gọi:
  - Lần 1 (confirm), hai lượt:
    1. `codex exec --skip-git-repo-check --sandbox danger-full-access --json '$brownfield-unit-test scope=src/main/java/com/example/shop coverage-target=80'`
    2. `codex exec resume <thread_id> --skip-git-repo-check --dangerously-bypass-approvals-and-sandbox "đồng ý kế hoạch, làm tiếp"`
  - Lần 2 (auto): `codex exec ... '$brownfield-unit-test scope=src/main/java/com/example/shop coverage-target=80 mode=auto max-fix-attempts=20'`
- Kiểm chứng độc lập:
  - So sha256 trước, giữa (sau lượt 1 của lần confirm) và sau.
  - So `diff` các file test có sẵn với bản gốc.
  - Tự chạy `mvn -q test`: lần 1 có 15 test và 1 fail; lần 2 có 15 test và 1 fail. Test fail duy nhất là `TaxRuleTests.givenAmount_whenWithTax_thenAddsVat`, lỗi có sẵn.

| # | Lần 1 (confirm) | Lần 2 (auto) | Bằng chứng |
|---|---|---|---|
| A1 | Đạt | Đạt | Đọc lần lượt từng file pha khi tới pha đó. Kế hoạch đủ 8 mục, báo cáo đủ 8 mục |
| A2 | Đạt | Đạt | Thay đổi file đầu tiên xuất hiện sau khi in kế hoạch |
| A3 | Đạt | Không áp dụng | Lượt 1 kết thúc bằng "Kế hoạch đang chờ bạn xác nhận". Hash sau lượt 1 không đổi; không còn `target/` |
| A4 | Không áp dụng | Đạt | In kế hoạch xong là làm tiếp |
| A5 | Đạt | Đạt | `src/main` không đổi. `InvoiceExporter` nằm ở "Đơn vị bỏ qua", kèm gợi ý tiêm `Clock`, writer và HTTP client |
| A6 | Đạt | Đạt | Không sửa `pom.xml`; JaCoCo chạy qua goal CLI |
| A7 | Đạt | Đạt | Case cũ của `TaxRuleTests` giữ nguyên (diff không có dòng nào bị xóa) và được báo là lỗi có sẵn |
| A8 | Đạt | Đạt | Bảng tham số có ghi mặc định |
| B1, B2 | Đạt | Đạt | Maven, JUnit 5, Mockito (`MockitoExtension`), AssertJ. Hậu tố `*Tests`, tên `given..._when..._then...`, có AAA |
| B3 | Đạt | Đạt | `DiscountService` là mục tiêu chính |
| B4 | Đạt | Đạt | Kiểm tra JDK và Maven |
| C1 | Đạt | Đạt | Chỉ đọc `playbooks/java-spring-boot.md` |
| C2 | Đạt | Đạt | Mock `CustomerRepository`; không dùng `@SpringBootTest` |
| C4 | Đạt | Đạt | Có test trần 30% (`isEqualByComparingTo("0.30")`), các hạng, biên, các nhánh lỗi |
| C5 | Đạt | Đạt | Mọi test đều có assertion |
| D1, D7 | Đạt | Đạt | Chạy hẹp → rộng, chạy lại để dò flaky |
| D3 | Không áp dụng | Đạt | "`max-fix-attempts` \| 3 \| Bạn truyền `20`, ngoài khoảng 1–10; dùng mặc định 3" |
| D5 | Đạt | Đạt | Lần 1 chỉ thêm case vào `PriceCalculatorTests`. Lần 2 thêm case vào `PriceCalculatorTests` và `TaxRuleTests` (`givenFractionalAmount_whenWithTax_thenRoundsHalfUp`) mà không sửa case cũ. `02-plan.md` cho phép thêm case vào file có sẵn |
| D8 | Đạt | Đạt | Hash: chỉ có file test thay đổi. `target/` đã được dọn |
| E1 | Đạt | Đạt | Đủ 8 mục |
| E2 | Đạt | **Không đạt → đã sửa** | Lần 1: 14.3% → 58.9% dòng, 100% nhánh. Lần 2 ghi "không đo được baseline vì test cũ fail" (Maven dừng trước goal `report`); số "sau" chỉ có 52.24%. Đã sửa playbook (xem bên dưới) |
| E3 | Đạt | Đạt | Có gợi ý refactor `InvoiceExporter` |
| E4 | Đạt | Đạt | Chỉ báo pass sau khi đã chạy |
| F1 | Đạt | Đạt | Gọi bằng `$brownfield-unit-test`; skill được nạp từ `.agents/skills` |
| F2 | Đạt | Đạt | `npm run check` pass |
| F3 | Đạt | Đạt | Xem `cross-client.md` |

Các mục A9, C3, D2, D4, D6, E5 không áp dụng: không phải git repo, đơn vị được test không phụ thuộc thời gian, không cần vòng sửa nào, không có test fail, không nghi bug, không lưu báo cáo.

## Vấn đề phát hiện và việc đã sửa

1. **Coverage "trước" bị ghi "không đo được" vì có test cũ đang fail.** Lỗi gặp ở lần 2 và ở lượt 11.1 đầu tiên. Maven dừng ở `test` nên không chạy tới `jacoco:report`. Claude Code và Kiro tự thêm `-Dmaven.test.failure.ignore=true`; Codex lúc có thêm, lúc không.
   - Đã sửa: mục Coverage của `core/playbooks/java-spring-boot.md` ghi rõ tham số này và nói rõ test cũ fail không phải lý do để ghi "không đo được".
   - Kiểm chứng: chạy lại lượt 11.1 với bản build mới, Codex đo được 14.3% → 57.1% dòng (`cross-client.md`).
2. **Lịch sử:**
   - 2026-10-04, codex-cli 0.154.0 với `workspace-write`: Maven không đọc được `~/.m2`. Agent báo thiếu môi trường rồi hỏi, đúng spec.
   - 2026-10-05 sáng: tài khoản hết hạn mức.
   - Lần chạy hiện tại dùng tài khoản mới và codex-cli 0.160.0.
3. **`resume <thread_id>`:** dùng thay cho `--last` khi chạy song song nhiều phiên. Lượt resume dùng `--dangerously-bypass-approvals-and-sandbox` để có quyền tương đương lượt 1; chỉ dùng trên bản copy.
