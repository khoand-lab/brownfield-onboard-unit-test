# Tasks

## 1. Cấu hình và dự án mẫu giả

- [x] 1.1 Viết `scripts/eval/config.mjs`: nạp `eval.config.json`, kiểm tra các khóa bắt buộc của `clients` và `stacks` theo design D2, thay placeholder `{prompt}`/`{sessionId}`/`{workdir}`, mở rộng biến môi trường trong `executable`, và báo lỗi liệt kê giá trị hợp lệ khi chọn client hoặc stack không có. Kiểm chứng: `node --test scripts/test/eval-config.test.mjs` có ca hợp lệ, ca thiếu khóa và ca chọn client/stack không tồn tại
- [x] 1.2 Tạo fixture trong `scripts/test/fixtures/eval/`:
  - dự án mẫu giả Node, có 1 file production, 1 file test cũ, 1 test cố ý fail; lệnh test là `node run-tests.mjs`;
  - `fake-agent.mjs` gồm 6 kịch bản `good`, `edits-prod`, `writes-in-plan`, `leaves-build`, `deletes-old-test-line`, `short-report`, điều khiển qua biến môi trường; in kế hoạch/báo cáo theo `core/templates/`;
  - `eval.config.json` riêng cho test, trỏ tới client giả.

  Kiểm chứng: chạy tay `node fake-agent.mjs` với từng kịch bản trên một bản copy và quan sát đúng thay đổi file mong đợi

## 2. Chuẩn bị bản copy và snapshot

- [x] 2.1 Viết `scripts/eval/workspace.mjs` (design D3, D4):
  - tạo bản copy trong `os.tmpdir()/brownfield-eval/<runId>/...`, bỏ `buildDirs` và `deps.dir`;
  - copy `deps.dir` từ bản gốc nếu có, nếu không thì chạy `deps.install`;
  - cài adapter bằng `install()` của `scripts/install.mjs`;
  - chụp snapshot đường dẫn + sha256, bỏ qua thư mục adapter và `deps.dir`, vẫn liệt kê `buildDirs`;
  - lưu snapshot JSON ngoài bản copy.

  Kiểm chứng: `node --test scripts/test/eval-workspace.test.mjs` cho thấy bản copy không có `buildDirs`, có thư mục adapter, snapshot không chứa file adapter, và hash `examples/`/fixture gốc không đổi sau khi chạy
- [x] 2.2 Thêm hàm so sánh snapshot: phân loại file thêm/sửa/xóa thành test/production/cấu hình/khác theo glob `testPaths`, `prodPaths` và manifest; diff theo dòng cho file test có sẵn (dòng bị xóa hoặc sửa, dòng thêm). Kiểm chứng: test đơn vị với các cặp snapshot dựng sẵn cho từng loại thay đổi, gồm "chỉ thêm dòng" và "sửa một dòng"

## 3. Chạy client

- [x] 3.1 Viết `scripts/eval/runner.mjs` (design D6):
  - `spawn` không qua shell; trên Windows tìm `.cmd`/`.bat` theo PATH rồi chạy qua `cmd.exe /d /s /c` với hàm quote riêng;
  - hỗ trợ `promptVia: "stdin"`;
  - timeout và kill cây tiến trình;
  - lưu stdout/stderr vào `turnN.log`;
  - trả `{ exitCode, timedOut, durationMs, command }`.

  Kiểm chứng: `node --test scripts/test/eval-runner.test.mjs`:
  - quote đúng các tham số có `$`, dấu cách, dấu ngoặc kép, tiếng Việt;
  - một tiến trình con ngủ lâu bị kill khi hết timeout;
  - prompt qua stdin tới được tiến trình con
- [x] 3.2 Thêm luồng chạy theo chế độ:
  - `auto`: một lượt;
  - `confirm`: lượt 1, chụp snapshot `mid`, rồi lượt 2 bằng lời xác nhận;
  - id phiên lấy theo `sessionId.generate` hoặc `sessionId.fromOutput`;
  - client lỗi, timeout hay thiếu CLI/toolchain (`requires`) thì lượt đó là "không chạy được" kèm lý do, các lượt khác vẫn chạy.

  Kiểm chứng: test với client giả cho 2 ca:
  - confirm với id phiên trích từ output;
  - một client trỏ tới lệnh không tồn tại bị bỏ qua mà không dừng các lượt khác
- [x] 3.3 Viết `scripts/eval/transcript.mjs`: trích văn bản kế hoạch và báo cáo từ transcript định dạng `claude-stream-json`, `codex-jsonl` và `text` (bỏ mã ANSI). Kiểm chứng: test đơn vị với mẫu transcript thu gọn của cả 3 định dạng, lấy từ dạng output đã gặp ở đợt đánh giá trước

## 4. Kiểm chứng và chấm điểm

- [x] 4.1 Viết `scripts/eval/checks.mjs` dạng hàm thuần (design D5, D7):
  - chạy lại test trên bản sao `<workdir>-verify/` và trích tên test fail bằng `failurePattern`;
  - chấm các mục tự chấm A3, A5, A7, D1, D5, D8, E1, F2 và heuristic A8, C2;
  - các mục còn lại là "Cần chấm tay" kèm trích đoạn (tên test case mới, mục coverage và đơn vị bỏ qua trong báo cáo);
  - "Không áp dụng" theo chế độ.

  Kiểm chứng: `node --test scripts/test/eval-checks.test.mjs` chạy 6 kịch bản của client giả:
  - `good` → không mục nào "Không đạt";
  - `edits-prod` → A5/D8 "Không đạt";
  - `writes-in-plan` → A3 "Không đạt";
  - `leaves-build` → D8 "Không đạt";
  - `deletes-old-test-line` → D5 "Không đạt";
  - `short-report` → E1 "Không đạt";
  - không mục cần đọc hiểu nào ra "Đạt";
  - bản copy của agent không có thư mục build mới sau khi kiểm chứng
- [x] 4.2 Viết `scripts/eval/report.mjs` (design D8): xuất `results.md` gồm tóm tắt đầu file và mỗi lượt một phần theo mẫu `EVALUATION.md`, có phiên bản client, lệnh đã chạy, thời gian, bảng mục + bằng chứng, đường dẫn bản copy/transcript. Kiểm chứng: test snapshot Markdown cho một lần chạy có một lượt đạt, một lượt không đạt và một lượt không chạy được

## 5. CLI và tài liệu

- [x] 5.1 Viết `scripts/eval.mjs`:
  - tham số `--client`, `--stack`, `--mode confirm|auto|both`, `--config`, `--out`;
  - in số lượt và cảnh báo về cờ quyền rộng trước khi chạy, chạy `npm run check` (F2);
  - chạy tuần tự các lượt, in tóm tắt, mã thoát 0/1/2 theo design D8;
  - thêm script `eval` vào `package.json` và `.eval/` vào `.gitignore`.

  Kiểm chứng: `node --test scripts/test/eval-cli.test.mjs` chạy với cấu hình client giả, kiểm tra mã thoát 0 (kịch bản `good`), 1 (`edits-prod`), 2 (stack không tồn tại), và `examples/` không đổi
- [x] 5.2 Thêm chế độ chỉ kiểm chứng: `--prepare` in đường dẫn bản copy và lưu snapshot `before`; `--verify <workdir> [--plan-output] [--report-output] [--mid]` cho kết quả giống lượt tự động. Kiểm chứng: test chạy `--prepare`, dùng client giả như người dùng chạy tay, rồi `--verify`, so kết quả với lượt tự động cùng kịch bản
- [x] 5.3 Viết `eval.config.json` thật:
  - 3 client `claude-code`, `kiro`, `codex`, với lệnh và cờ đã kiểm chứng ở đợt đánh giá trước;
  - các stack chạy được trên máy Windows hiện tại: `java-spring-boot`, `nodejs`, `python`, `react`, `angular`, `vue`;
  - stack mobile để sau, theo Open Questions trong design.

  Kiểm chứng: cấu hình qua được bước kiểm tra của `config.mjs`, và `node scripts/eval.mjs --client kiro --stack nodejs --mode auto --dry-run` in đúng lệnh sẽ chạy mà không gọi agent
- [x] 5.4 Cập nhật `examples/EVALUATION.md` (mục "Chạy tự động"), `README.md` và `package.json`: cách cài, chạy, đọc kết quả, chế độ chỉ kiểm chứng, cảnh báo cờ quyền và chi phí. Kiểm chứng: làm theo đúng tài liệu để chạy `npm run eval -- --dry-run` thành công và mọi đường dẫn nhắc tới đều tồn tại

## 6. Kiểm chứng tích hợp với client thật

- [x] 6.1 Chạy `npm run eval -- --client claude-code,kiro --stack java-spring-boot --mode both`, rồi so kết quả tự chấm với kết quả chấm tay đã có trong `examples/results/` (cùng client, cùng stack). Kiểm chứng: không có mục tự chấm nào cho kết luận ngược với kết quả chấm tay; ghi so sánh vào `examples/results/eval-automation-check.md`
- [x] 6.2 Chạy `npm run eval -- --client codex --stack react --mode auto` để kiểm chứng định dạng `codex-jsonl` và đường gọi `.cmd` trên Windows. Kiểm chứng: lượt chạy được, kế hoạch/báo cáo được trích đúng (E1 có kết quả, không phải "không tìm thấy báo cáo"), bổ sung vào cùng file so sánh
- [x] 6.3 Chạy `openspec validate add-eval-automation-script --strict`, `npm test` (gồm các test eval mới) và `npm run check`. Kiểm chứng: tất cả pass
