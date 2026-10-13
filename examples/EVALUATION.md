# Checklist đánh giá agent

Dùng checklist này sau mỗi lần chạy agent trên một dự án mẫu trong `examples/`, với từng client. Ghi kết quả vào `examples/results/<client>-<stack>.md`, mỗi mục ghi **Đạt / Không đạt / Không áp dụng** kèm bằng chứng: trích output, đường dẫn file, lệnh đã chạy.

Mỗi mục tham chiếu scenario tương ứng trong `openspec/specs/`.

Tên đơn vị trong checklist lấy theo `java-spring-boot`. Với dự án mẫu khác, dùng đơn vị tương ứng ghi trong README của dự án đó. Ví dụ `nodejs`: `DiscountService` → `src/discount/discount-service.js`, `InvoiceExporter` → `src/invoice/invoice-exporter.js`, `TaxRuleTests` → `test/pricing/tax-rule.spec.js`, `src/main` → `src`. `python`: `DiscountService` → `src/shop/discount/discount_service.py`, `InvoiceExporter` → `src/shop/invoice/invoice_exporter.py`, `TaxRuleTests` → `tests/pricing/test_tax_rule.py`, `src/main` → `src`.

## Chạy tự động

`scripts/eval.mjs` tự làm phần chuẩn bị và kiểm chứng độc lập dưới đây. Script chấm máy các mục kiểm được bằng máy và đánh dấu "Cần chấm tay" cho các mục cần đọc hiểu. Lệnh gọi từng client và thông tin từng dự án mẫu nằm trong `eval.config.json` ở gốc repo.

**Yêu cầu:**
- Node ≥ 18.
- CLI của client đã đăng nhập (`claude`, `kiro-cli`, `codex`) và có trong PATH. Nếu vừa cài `kiro-cli`, hãy mở terminal mới.
- Toolchain của stack: JDK + Maven, Node + npm, Python, Chrome (cho Angular).

Thiếu thứ gì thì lượt đó ghi "không chạy được" kèm lý do, các lượt khác vẫn chạy tiếp.

```bash
# Xem trước các lượt và lệnh sẽ chạy (không tạo bản copy, không gọi agent)
npm run eval -- --client kiro --stack java-spring-boot --mode both --dry-run

# Chạy thật: client và stack ngăn cách bằng dấu phẩy; --mode confirm | auto | both (mặc định both)
npm run eval -- --client claude-code,kiro --stack java-spring-boot,react --mode auto
```

Các stack đã cấu hình: `java-spring-boot`, `nodejs`, `python`, `react`, `vue`, `angular`, `android-java`, `flutter`. Một số lệnh trong cấu hình đang dùng dạng Windows:
- Python dùng `.venv/Scripts/python.exe`; trên macOS/Linux sửa thành `.venv/bin/python`.
- Android dùng `./gradlew.bat`; trên macOS/Linux sửa thành `./gradlew`.

`ios-swift` chưa được cấu hình, vì cần macOS và Xcode.

**Mỗi lượt đánh giá:**
1. Copy dự án mẫu ra thư mục tạm của hệ điều hành (`<tmp>/brownfield-eval/<runId>/`), bỏ thư mục build.
2. Chuẩn bị dependency, cài adapter mức project, rồi chụp snapshot ban đầu.
3. Gọi agent:
   - `mode=auto`: một lượt `scope=<scope> mode=auto`;
   - `mode=confirm`: lượt kế hoạch (`scope=<scope>`), chụp snapshot, rồi lượt `đồng ý kế hoạch, làm tiếp` trên cùng phiên.
4. So snapshot, `diff` test có sẵn, chạy lại test trên một bản sao thứ hai, grep dấu hiệu xấu, đối chiếu tiêu đề kế hoạch và báo cáo với `core/templates/`.

Trước mỗi lần chạy thật, script chạy `build` và `check` (mục F2). Thêm `--skip-check` để bỏ bước này.

**Đọc kết quả.** File mặc định là `.eval/<runId>/results.md` (đổi bằng `--out`):
- Phần tóm tắt ở đầu: mục "Không đạt", lượt "không chạy được", số mục cần chấm tay.
- Mỗi lượt (client × stack × chế độ) có một bảng `| # | Kết quả | Bằng chứng |` theo mã mục của checklist này. Đây khác với "Mẫu file kết quả" ở cuối file, vốn gộp hai lần chạy vào cùng một bảng.
- Kết quả ghi phiên bản client nhưng không ghi model, vì CLI không báo model đã dùng. Khi chép sang `examples/results/`, hãy bổ sung model bằng tay.
- Bản copy, transcript (`turn1.log`, `turn2.log`) và `verify.log` nằm ở `<workdir>` và `<workdir>.meta/`.

Script tự chấm A3, A4, A5, A6, A7, A8, C2, D1, D5, D8, E1, F1, F2. Các mục còn lại ghi "Cần chấm tay" kèm trích đoạn: tên test case mới, mục coverage, đơn vị bỏ qua…

Mã thoát:
- `0`: không mục nào "Không đạt";
- `1`: có mục "Không đạt" hoặc có lượt "không chạy được";
- `2`: sai tham số hoặc cấu hình.

**Chế độ chỉ kiểm chứng**, khi bạn tự chạy agent (ví dụ trong IDE, hoặc với client chưa có trong cấu hình):

```bash
node scripts/eval.mjs --prepare --client kiro --stack nodejs --mode confirm   # in đường dẫn bản copy
# client chưa có trong cấu hình: thêm --adapter <tên adapter>
# ... chạy lượt kế hoạch trong bản copy, rồi:
node scripts/eval.mjs --mark-mid <workdir>
# ... xác nhận, chờ agent xong, lưu kế hoạch và báo cáo ra file, rồi:
node scripts/eval.mjs --verify <workdir> --plan-output plan.txt --report-output report.txt
```

**An toàn và chi phí:**
- Cấu hình cho agent quyền rộng: Claude Code được phép mọi lệnh shell, Kiro chạy với `--trust-all-tools`, Codex với `danger-full-access`. Script chỉ chạy agent trong bản copy ở thư mục tạm, không bao giờ trong `examples/`.
- Mỗi lượt gọi agent thật và tốn hạn mức hoặc credit của client. Hãy dùng `--dry-run` trước khi chạy một ma trận lớn.

Kết quả tự động không thay thế việc chấm tay các mục "Cần chấm tay". Muốn lưu kết quả lâu dài thì copy phần cần giữ vào `examples/results/`.

## Chuẩn bị

Phần này dành cho việc chấm tay. Nếu dùng công cụ tự động ở trên thì bỏ qua.

1. Build và cài agent cho client theo `adapters/<client>/INSTALL.md`.
2. Copy dự án mẫu ra thư mục tạm; mọi bước sau chạy trên bản copy để bản gốc không bị lẫn `target/`, `node_modules/`... Ghi lại trạng thái đầu trên một bản copy riêng. Ví dụ với `java-spring-boot`: chạy `mvn test`, chỉ `TaxRuleTests` fail. Với `nodejs`: chạy `npm ci` rồi `npm test`, chỉ `tax-rule.spec.js` fail. Với `python`: tạo `.venv` và cài `requirements-dev.txt` như README, rồi chạy `python -m pytest`, chỉ `test_tax_rule.py` fail.
3. Chụp danh sách file để so sánh sau phiên. Dự án mẫu không phải git repo thì dùng `find src -type f | sort > /tmp/before.txt` và copy thư mục `src/main`.
4. Chạy hai lần:
   - **Lần 1:** `mode=confirm` (mặc định).
   - **Lần 2:** `mode=auto`, trên bản sạch của dự án mẫu.

## A. Quy trình lõi (agent-core-workflow)

| # | Kiểm tra | Scenario |
|---|---|---|
| A1 | Chạy đủ 5 pha đúng thứ tự: phân tích → kế hoạch → sinh test → kiểm chứng → báo cáo | Chạy đầy đủ quy trình |
| A2 | Không tạo file test nào trước khi phân tích xong | Không bỏ qua pha phân tích |
| A3 | `mode=confirm`: in kế hoạch và **dừng**, không ghi file cho tới khi được xác nhận | Chế độ mặc định có xác nhận |
| A4 | `mode=auto`: in kế hoạch rồi làm tiếp, không hỏi | Chế độ tự động |
| A5 | Không sửa file nào trong `src/main`. Đơn vị khó test (`InvoiceExporter`) nằm ở "Đơn vị bỏ qua" kèm gợi ý refactor | Code khó test |
| A6 | Dependency test mới (nếu có) được nêu trong kế hoạch trước khi thêm | Cần thêm dependency test |
| A7 | Test cũ đang fail (`TaxRuleTests`) được giữ nguyên và báo là lỗi có sẵn | Test cũ đang fail |
| A8 | Chỉ truyền `scope`: các tham số còn lại dùng mặc định, bảng tham số in ở đầu kế hoạch | Chỉ cung cấp phạm vi |
| A9 | `scope=changed:<ref>` chỉ chọn file production thay đổi (chỉ khi dự án là git repo) | Phạm vi theo thay đổi git |

## B. Phân tích dự án (project-analysis)

| # | Kiểm tra | Scenario |
|---|---|---|
| B1 | Nhận diện đúng stack, công cụ build, test framework, thư viện mock/assert | Dự án một stack; Dự án đã có test framework |
| B2 | Học đúng quy ước sẵn có. Với `java-spring-boot`: hậu tố `*Tests`, tên `given_when_then`, AssertJ, chú thích `// arrange/act/assert` | Có quy ước rõ ràng |
| B3 | Ưu tiên đơn vị chưa có test (`DiscountService`), bỏ qua code sinh tự động | Ưu tiên code chưa có test; Bỏ qua code sinh tự động |
| B4 | Kiểm tra toolchain trước khi chạy; thiếu thì báo rõ, không phỏng đoán | Thiếu toolchain |

## C. Chất lượng test (stack-playbooks)

| # | Kiểm tra | Scenario |
|---|---|---|
| C1 | Dùng đúng playbook của stack, không đọc playbook của stack khác | Chọn playbook |
| C2 | Test cô lập: mock repository/API ngoài, không khởi động toàn bộ context | Service gọi repository và API ngoài |
| C3 | Thời gian/ngẫu nhiên được kiểm soát (nếu đơn vị có dùng) | Logic phụ thuộc thời gian |
| C4 | Mỗi đơn vị có case chính, biên và lỗi. Với `DiscountService`: các hạng, thưởng ≥10 đơn, trần 30% (PLATINUM có thưởng), thiếu id, không tìm thấy khách, số tiền âm | Hàm có nhánh xử lý lỗi |
| C5 | Mọi test đều có assertion có ý nghĩa | Test không có assertion |

## D. Kiểm chứng (test-verification)

| # | Kiểm tra | Scenario |
|---|---|---|
| D1 | Test mới được chạy thật bằng công cụ của dự án và kết quả được trích dẫn | Test chạy xanh |
| D2 | Tự sửa không vượt `max-fix-attempts` (mặc định 3) cho mỗi file | Dùng giá trị mặc định; Sửa thành công |
| D3 | Giá trị tham số không hợp lệ (ví dụ `max-fix-attempts=20`) bị báo và thay bằng mặc định | Giá trị không hợp lệ |
| D4 | Test vẫn fail sau khi hết vòng sửa: gỡ với `remove`, skip kèm `TODO(unit-test-agent)` với `disable` | Mặc định gỡ test fail; Chọn giữ lại dạng disable |
| D5 | Không sửa hay disable test có sẵn | Không động tới test có sẵn |
| D6 | Nghi ngờ bug production thì báo lại, không sửa assertion cho khớp hành vi sai | Nghi ngờ bug trong code production |
| D7 | Chạy lại để phát hiện flaky | Test flaky |
| D8 | So sánh thay đổi cuối phiên: chỉ có file test (và dependency đã duyệt) | Phát hiện thay đổi ngoài phạm vi |

## E. Báo cáo (test-reporting)

| # | Kiểm tra | Scenario |
|---|---|---|
| E1 | Báo cáo đủ các mục theo `core/templates/report.md` | Phiên thành công |
| E2 | Coverage trước/sau có số liệu, hoặc ghi rõ lý do không đo được | Đo được coverage; Không đo được coverage |
| E3 | Đơn vị khó test có khuyến nghị refactor | Có đơn vị khó test |
| E4 | Không khẳng định test pass nếu chưa chạy | Test chưa chạy |
| E5 | `save-report=true` lưu vào `.unit-test-agent/reports/` | Người dùng yêu cầu lưu báo cáo |

## F. Adapter (client-adapters)

| # | Kiểm tra | Scenario |
|---|---|---|
| F1 | Cài đúng theo `INSTALL.md`, gọi được bằng lệnh và bằng subagent/agent của client | Cài và gọi trong <client> |
| F2 | `npm run check` pass sau build (không lệch lõi) | Phát hiện adapter lệch lõi |
| F3 | Kết quả trên cùng dự án mẫu nhất quán giữa các client: cùng đơn vị mục tiêu, cùng quy ước, cùng xử lý test cũ fail | So sánh giữa client |

## Mẫu file kết quả

```markdown
# Kết quả: <client> trên <stack>

- Ngày chạy / phiên bản client / model:
- Phiên bản agent (package.json):
- Lệnh gọi lần 1 (confirm):
- Lệnh gọi lần 2 (auto):

| # | Lần 1 | Lần 2 | Bằng chứng |
|---|---|---|---|
| A1 | | | |
...

## Vấn đề phát hiện và việc cần sửa
```
