# So sánh giữa các client

## Ma trận stack × client (change `complete-cross-client-evaluation`, cập nhật 2026-10-12)

Mỗi ô ghi kết quả cuối cùng sau khi sửa lõi (nếu có), số mục "Không đạt" còn lại và cách xử lý, kèm file kết quả.
- "Đạt" nghĩa là không còn mục "Không đạt" nào.
- "Ghi chú adapter" nghĩa là mục "Không đạt" do môi trường của client, đã ghi vào `adapters/<client>/INSTALL.md`; lõi không cần sửa.
- Mỗi tổ hợp chạy cả `confirm` và `auto`.

| Stack | Claude Code | Kiro | Codex |
|---|---|---|---|
| java-spring-boot | Đạt ([kết quả](claude-code-java-spring-boot.md)) | Đạt ở vòng 2, sau khi sửa lõi D3, E2, D8 ([kết quả](kiro-java-spring-boot.md)) | Đạt sau khi sửa playbook (E2) ([kết quả](codex-java-spring-boot.md)) |
| nodejs | Đạt ([kết quả](claude-code-nodejs.md)) | Đạt khi gọi bằng `@unit-test`; lệch nhỏ về tiêu đề kế hoạch, đã sửa lõi (`02-plan.md`) ([kết quả](kiro-nodejs.md)) | 3 "Không đạt" ở confirm: A8 đã sửa lõi (`02-plan.md`), hồi quy Đạt; A3, D8: ghi chú adapter. Auto: Đạt ([kết quả](codex-nodejs.md)) |
| python | Đạt ([kết quả](claude-code-python.md)) | Đạt sau khi sửa lõi (A3, E1); hồi quy 0 "Không đạt" ([kết quả](kiro-python.md)) | 3 "Không đạt": A3 (confirm), D8 (cả hai): ghi chú adapter ([kết quả](codex-python.md)) |
| react | Đạt ([kết quả](claude-code-react.md)) | Đạt ([kết quả](kiro-react.md)) | Đạt sau khi sửa lõi (E1); D8: ghi chú adapter ([kết quả](codex-react.md)) |
| vue | Đạt ([kết quả](claude-code-vue.md)) | A8 ở auto đã sửa lõi (`02-plan.md`); hồi quy kiro · vue · auto: 0 "Không đạt" ([kết quả](kiro-vue.md)) | Đạt ([kết quả](codex-vue.md)) |
| angular | Đạt ([kết quả](claude-code-angular.md)) | Đạt sau khi sửa lõi (A3, E1, A8); hồi quy kiro · angular · auto (2026-10-12): 0 "Không đạt" ([kết quả](kiro-angular.md)) | 1 "Không đạt": E2 (auto), chỉ ghi nhận ([kết quả](codex-angular.md)) |
| android-java | Đạt ([kết quả](claude-code-android-java.md)) | Đạt sau khi sửa playbook (D8); hồi quy 0 "Không đạt" ([kết quả](kiro-android-java.md)) | 2 "Không đạt": D8 (cả hai): ghi chú adapter ([kết quả](codex-android-java.md)) |
| flutter | Đạt ([kết quả](claude-code-flutter.md)) | Đạt sau khi sửa playbook (A3, D8); A8 ở auto đã sửa lõi, hồi quy trên vue ([kết quả](kiro-flutter.md)) | 3 "Không đạt": A3 (confirm), D8 (cả hai): ghi chú adapter ([kết quả](codex-flutter.md)) |
| ios-swift | Chỉ kiểm nhánh "báo thiếu toolchain": máy không có macOS/Xcode ([kết quả](claude-code-ios-swift.md)) | **Chưa kiểm chứng**: cần macOS và Xcode (ngoài phạm vi change) | **Chưa kiểm chứng**: cần macOS và Xcode (ngoài phạm vi change) |

**Tóm tắt:**
- Không client nào vi phạm requirement MUST: không sửa code production, không phá test có sẵn, không dừng tiến trình ngoài phiên.
- Mọi mục "Không đạt" còn lại của Codex đều thuộc một trong hai loại:
  - lỗi môi trường: chính sách lệnh chặn xóa thư mục trên Windows;
  - lỗi chỉ ghi nhận: một model, một lượt.

## Lệch theo client và cách xử lý

| Lệch | Client | Cách xử lý |
|---|---|---|
| Còn sót thư mục build/cache tại điểm dừng `mode=confirm` (A3) hoặc khi kết thúc (D8) | Kiro (python, angular, flutter, android-java), Codex (react) | **Sửa lõi/playbook**: mục "Thư mục/file sinh ra khi chạy" trong `## Commands` của 9 playbook; `02-plan.md` yêu cầu dọn cả cache trình chạy test và liệt kê lại thư mục gốc trước khi dừng. Hồi quy: hết trên Kiro và Claude Code |
| Báo cáo không theo tiêu đề của `templates/report.md` (E1) | Kiro (lượt tiếp tục của confirm: angular, python), Codex (react vòng 1) | **Sửa lõi**: `05-report.md` yêu cầu đọc lại template ngay trước khi viết và chép đúng tiêu đề có số. Hồi quy: hết |
| Kế hoạch đổi tên, rút gọn hoặc bỏ mục, nhất là thiếu "8. Xác nhận" ở `mode=auto` (A8) | Kiro (nodejs, vue, angular, flutter), Codex (nodejs confirm) | **Sửa lõi** (task 4.3): `02-plan.md` yêu cầu chép đúng tiêu đề có số từ mẫu, kể cả mục 8 khi `mode=auto`. Hồi quy: kiro · vue · auto và kiro · angular · auto Đạt; 8 lượt Codex sau đó đều A8 Đạt |
| Dừng tiến trình không do mình khởi chạy | Codex (react, vòng trước) | **Sửa lõi**: nguyên tắc an toàn số 7 trong `AGENT.md`, mục "Lệnh chạy quá lâu" trong `04-verify.md`. Hồi quy: hết; 13 lượt Codex sau đó không có lệnh dừng tiến trình lấy từ danh sách hệ thống |
| Chạy song song hai lệnh coverage rồi dừng PID lấy từ thông báo lỗi của chính lệnh đó | Codex (vue confirm) | **Chỉ ghi nhận**: PID thuộc tiến trình của agent, không vi phạm MUST; một lượt |
| Chính sách lệnh chặn `Remove-Item` trên Windows, còn sót `coverage/`, `__pycache__/`, `.gradle/`, `build/` (A3, D8) | Codex (nodejs, python, react, android-java, flutter) | **Ghi chú adapter** (`adapters/codex/INSTALL.md`). Codex có lúc dọn được bằng `[System.IO.Directory]::Delete`, `cmd /c rmdir` hoặc `gradlew clean`, có lúc không thử cách khác; luôn ghi phần còn sót vào báo cáo |
| Gradle daemon giữ `codex exec` không thoát tới khi daemon tự tắt (khoảng 3 giờ) | Codex (android-java) | **Ghi chú adapter** và cấu hình eval: đặt `GRADLE_OPTS=-Dorg.gradle.daemon=false` cho client Codex. Sau khi đổi, lượt chạy còn 2–4 phút |
| Coverage ghi "không đo được" với lý do sai, dù lệnh coverage đã chạy (E2) | Codex (angular auto) | **Chỉ ghi nhận** (một model, một lượt) |
| Kẹp `max-fix-attempts` về biên thay vì mặc định | Kiro (java, vòng 1) | **Sửa lõi** (vòng trước). Hồi quy: hết |
| Test đơn vị "khó test" bằng stub/fake timers toàn cục thay vì bỏ qua | Codex (react, nodejs, vue) | **Chỉ ghi nhận**: test vẫn cô lập và tất định, không sửa production; hợp lệ theo playbook. Trên android-java và flutter, Codex bỏ qua `InvoiceExporter` giống hai client kia |
| Lệch nhỏ về hình thức báo cáo (đếm "1/2 đơn vị", bảng mục 2/8 rút gọn, tiêu đề kế hoạch hạ một cấp) | Codex (android-java, flutter) | **Chỉ ghi nhận**: tiêu đề có số vẫn đúng mẫu, công cụ chấm A8/E1 Đạt |

## Chi tiết so sánh trên java-spring-boot (task 11.1, 2026-10-05)

- Ngày chạy: 2026-10-05. Agent 0.1.0. Claude Code và Kiro dùng bản build sau khi sửa lõi trong ngày. Codex dùng bản build có thêm phần sửa playbook Java (mục Coverage).
- Input chung: `scope=src/main/java/com/example/shop mode=auto`. Các tham số khác để mặc định.
- Dự án: mỗi client chạy trên một bản copy sạch riêng của `examples/java-spring-boot`, cài adapter mức project bằng `install.mjs`.
- Lệnh:
  - Claude Code 2.1.289: `claude -p "/unit-test scope=src/main/java/com/example/shop mode=auto" --permission-mode acceptEdits --allowedTools ...`
  - Kiro CLI 2.27.1 (model `auto`): `kiro-cli chat --agent unit-test-writer --no-interactive --trust-all-tools "scope=src/main/java/com/example/shop mode=auto"`
  - Codex CLI 0.160.0 (`gpt-5.6-terra`): `codex exec --skip-git-repo-check --sandbox danger-full-access '$brownfield-unit-test scope=src/main/java/com/example/shop mode=auto'`
- Kiểm chứng độc lập: so sha256 trước và sau, so `diff` các file test có sẵn, tự chạy `mvn -q test` trên từng bản copy, đọc kế hoạch và báo cáo.

### Kết quả

| Tiêu chí | Claude Code | Kiro | Codex |
|---|---|---|---|
| Đủ 5 pha, đúng thứ tự | Có | Có | Có |
| Kế hoạch đủ 8 mục theo `templates/plan.md` | Có | Có | Có |
| Báo cáo đủ 8 mục theo `templates/report.md` | Có | Có | Có |
| Bảng tham số, mặc định ghi rõ | Có | Có | Có |
| Quy ước: `*Tests`, `given_when_then`, AAA, AssertJ | Có | Có | Có |
| Mock `CustomerRepository` bằng Mockito, không dùng `@SpringBootTest` | Có | Có | Có |
| Đơn vị mục tiêu | `DiscountService` + thêm case `PriceCalculator` | `DiscountService` | `DiscountService` + thêm 1 case `TaxRule` (làm tròn) |
| Test trần 30% (PLATINUM + thưởng) | Có | Có | Có |
| `InvoiceExporter` vào "Đơn vị bỏ qua" kèm gợi ý refactor | Có | Có | Có |
| Case cũ `TaxRuleTests` giữ nguyên, báo là lỗi có sẵn | Có | Có | Có (file có thêm case mới; case cũ không đổi) |
| Coverage dòng trước → sau (JaCoCo, toàn scope) | 14.3% → 58.9% | `DiscountService` 0% → 100% | 14.3% → 57.1% |
| File production bị đổi | Không | Không | Không |
| `mvn -q test` chạy độc lập | 26 test, 1 fail (`TaxRuleTests`) | 19 test, 1 fail | 14 test, 1 fail |
| Dọn `target/` | Có | Có | Có |

**Kết luận task 11.1:**
- Cả ba client thực hiện đủ 5 pha.
- Kế hoạch và báo cáo của cả ba có cùng các mục bắt buộc.
- Cả ba theo cùng quy ước, cùng xử lý đơn vị khó test và test cũ đang fail, và không sửa file production.

### Khác biệt (đều hợp lệ theo spec)

1. **Độ rộng phạm vi khi không có `coverage-target`.** Cả ba đều chọn `DiscountService` làm mục tiêu chính. Claude Code thêm nhánh `unitPrice` còn thiếu của `PriceCalculator`. Codex thêm một case làm tròn cho `TaxRule`. Kiro chỉ làm `DiscountService`. Theo `02-plan.md`, thêm case vào file test có sẵn là được phép, miễn không sửa case cũ.
2. **Cách báo coverage.** Claude Code và Codex báo cho toàn scope; Kiro báo cho đơn vị mục tiêu. Cả ba đều có số "trước" và "sau".
3. **Ranh giới "khó test" trên frontend.** Codex từng test `exportInvoice` của React bằng stub global, trong khi hai client kia bỏ qua đơn vị này (`codex-react.md`). Với Java, cả ba nhất quán.

### Lỗi phát hiện qua so sánh và đã sửa

- **Codex lượt đầu ghi coverage "không đo được".** Nguyên nhân: test cũ đang fail làm Maven dừng trước `jacoco:report`. Đã sửa `core/playbooks/java-spring-boot.md` (thêm `-Dmaven.test.failure.ignore=true`). Lượt chạy lại trong bảng trên đã đo được.
