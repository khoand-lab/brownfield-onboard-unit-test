# Design

## Context

- Động cơ của change: xem `proposal.md` (mục Why). Hành vi cần đạt: xem `specs/agent-evaluation/spec.md`.
- Repo đã có hạ tầng Node không dependency: `scripts/lib.mjs` (`listFiles`, `sha256`, `copyDir`, `parseArgs`, `loadAdapter`), `scripts/install.mjs` (hàm `install()` export được), cùng test bằng `node --test`. Công cụ mới tái sử dụng các phần này.
- Đợt đánh giá thủ công vừa rồi đã cho thấy các ràng buộc thực tế mà thiết kế phải tính tới:
  - Ba client có cách gọi headless, cách resume phiên và định dạng transcript khác nhau:
    - Claude Code: `claude -p ... --session-id/--resume`, transcript `stream-json`.
    - Kiro: `kiro-cli chat --no-interactive --resume`, output là text có mã ANSI.
    - Codex: `codex exec --json`, rồi `codex exec resume <thread_id>`.
  - Trên Windows: `claude` và `codex` là shim `.cmd`. Mã thoát của `mvn` khi chạy qua PowerShell không đáng tin. Đường dẫn có dấu cách. Ký tự `$` trong prompt Codex dễ bị shell hiểu sai.
  - Nếu agent chạy trong thư mục nằm bên dưới một git repo, nó sẽ thấy `git status` của repo cha. Do đó bản copy phải nằm ngoài repo.
  - Dự án mẫu JS cần `node_modules` mới chạy được test. Một số dự án mẫu gốc đang có sẵn `node_modules`, số khác thì không.
  - Agent có thể đọc mọi file trong bản copy. Vì vậy thông tin về "bẫy" (đơn vị khó test, test cố ý fail) không được nằm trong bản copy.

## Goals / Non-Goals

**Goals:**
- Một lệnh chạy được toàn bộ ma trận client × dự án mẫu × chế độ, hoặc một phần của ma trận.
- Kết quả kiểm chứng phải tất định: cùng trạng thái thư mục thì cùng kết luận.
- Test được chính công cụ mà không cần gọi AI thật. Dùng client giả và dự án mẫu giả để chạy cả đường đạt lẫn đường không đạt.

**Non-Goals:**
- Không dùng LLM để chấm các mục cần đọc hiểu. Các mục đó luôn là "Cần chấm tay".
- Không chạy song song nhiều lượt trong v1, để tránh tranh chấp tài nguyên như `~/.m2` hay hạn mức của client.
- Không tích hợp CI và không theo dõi lịch sử kết quả giữa các lần chạy.
- Không đánh giá năng suất hay chi phí (token, thời gian) ngoài việc ghi lại thời gian chạy mỗi lượt.

## Decisions

### D1. Cấu trúc: một entry point, nhiều module nhỏ

```
scripts/eval.mjs              # CLI: đọc tham số, dựng ma trận lượt, gọi các module, in tóm tắt, đặt mã thoát
scripts/eval/
  config.mjs                  # nạp + kiểm tra cấu hình, thay placeholder
  workspace.mjs               # tạo bản copy sạch, chuẩn bị dependency, cài adapter, snapshot
  runner.mjs                  # gọi CLI của client (spawn, timeout, kill cây tiến trình, lưu transcript)
  transcript.mjs              # trích văn bản kế hoạch/báo cáo từ transcript theo định dạng
  checks.mjs                  # các kiểm tra độc lập, mỗi kiểm tra trả { id, result, evidence }
  evaluate.mjs                # ghép một lượt: yêu cầu → bản copy → các lượt agent → snapshot → kiểm chứng → chấm
  report.mjs                  # dựng Markdown kết quả + tóm tắt
eval.config.json              # cấu hình client và dự án mẫu (gốc repo)
scripts/test/eval*.test.mjs   # test với client giả và dự án mẫu giả
```

- **Lý do:** mỗi module test riêng được. `checks.mjs` là phần chứa logic chấm, nên phải là hàm thuần nhận vào snapshot và output.
- **Phương án đã cân nhắc:** một file duy nhất. Cách này khó test, vì phần chạy client thật lẫn với logic chấm.

### D2. Cấu hình JSON ở gốc repo, ngoài thư mục dự án mẫu

- `eval.config.json` có hai khóa: `clients` và `stacks`. JSON đọc được bằng Node thuần (YAML thì cần parser ngoài).
- Không đặt cấu hình trong `examples/<stack>/`. Thư mục đó được copy nguyên vào bản copy, nên agent sẽ đọc được thông tin bẫy, và kết quả đánh giá sẽ bị sai lệch.
- `clients.<id>`:
  - `executable`: tên lệnh, theo PATH, hoặc đường dẫn tuyệt đối có thể chứa biến môi trường (ví dụ `%LOCALAPPDATA%/Kiro-Cli/kiro-cli.exe`).
  - `versionArgs`: tham số để lấy phiên bản client.
  - `adapter`: tên adapter dùng với `install.mjs`.
  - `turns.auto`, `turns.confirmPlan`, `turns.confirmApprove`: mảng tham số, có thể dùng placeholder `{prompt}`, `{sessionId}`, `{workdir}`.
  - `sessionId`: cách lấy id phiên. Có hai kiểu:
    - `{ "generate": "uuid" }` cho Claude: công cụ tự sinh id và truyền vào lượt 1;
    - `{ "fromOutput": "<regex>" }` cho Codex: lấy `thread_id` từ output của lượt 1.

    Kiro resume theo thư mục nên không cần id.
  - `promptPrefix`: phần đứng trước tham số (`/unit-test `, `$brownfield-unit-test `, hoặc chuỗi rỗng khi gọi qua custom agent).
  - `transcriptFormat`: `claude-stream-json`, `codex-jsonl` hoặc `text`.
  - `timeoutMinutes`.
  - `promptVia` (tùy chọn): `"arg"` (mặc định) hoặc `"stdin"`.
  - `env` (tùy chọn): biến môi trường thêm cho tiến trình client, dạng object chuỗi. Test dùng khóa này để chọn kịch bản của client giả.
- `stacks.<id>`:
  - `example`: thư mục trong `examples/`.
  - `scope`: scope mặc định khi gọi agent.
  - `prodPaths` và `testPaths`: glob. File khớp `testPaths` được xếp loại test trước, nên test đặt cạnh mã nguồn (`src/**/*.spec.ts`) vẫn đúng loại.
  - `deps` (tùy chọn): `{ "dir": "node_modules", "install": ["npm", "ci"] }`. `install` có thể là một lệnh, hoặc danh sách nhiều lệnh chạy lần lượt, ví dụ Python: `[["python","-m","venv",".venv"], [".venv/Scripts/python.exe","-m","pip","install","-r","requirements-dev.txt"]]`. Lệnh có đường dẫn tương đối được tính từ bản copy.
  - `testCommand`.
  - `expectedFailures`: danh sách `{ "file", "name" }`. `file` là file test cố ý fail (để chấm A7/D5), `name` là chuỗi so khớp với tên test fail trích từ output.
  - `failurePattern`: regex trích tên test fail từ output (nhóm 1 là tên). Output được bỏ mã ANSI trước khi so khớp.
  - `buildDirs`: ví dụ `["target", "coverage"]`.
  - `badMarkers` (tùy chọn): các regex dấu hiệu xấu.
  - `hardUnits` (tùy chọn): danh sách `{ "file", "name" }`. `file` là file production khó test, `name` là chuỗi mong đợi xuất hiện trong báo cáo (để chấm A5).
  - `requires` (tùy chọn): danh sách lệnh kiểm tra toolchain, ví dụ `[["java","-version"], ["mvn","-v"]]`.
  - `manifests` (tùy chọn): tên file được xếp loại "cấu hình". Mặc định là danh sách manifest phổ biến (`pom.xml`, `package.json`, `pyproject.toml`…).
- Mỗi chế độ dùng chung tham số `scope=<scope>` của stack. Chế độ `confirm` không truyền `mode`; chế độ `auto` thêm `mode=auto`. Lời xác nhận cố định là `đồng ý kế hoạch, làm tiếp`.
- **Lý do:** đáp ứng requirement "Cấu hình tách khỏi công cụ" và giữ được những gì đã kiểm chứng tay trong đợt vừa rồi.

### D3. Bản copy nằm trong thư mục tạm của hệ điều hành

- Đường dẫn: `os.tmpdir()/brownfield-eval/<runId>/<client>-<stack>-<mode>/`. Bản copy và transcript (`turn1.log`, `turn2.log`) được giữ lại sau khi chạy.
- Copy dự án mẫu nhưng bỏ `buildDirs` và `deps.dir`. Nếu bản gốc có `deps.dir` thì copy riêng thư mục đó, vì nhanh hơn cài lại; nếu không có thì chạy `deps.install`. Sau đó cài adapter bằng `install()` của `scripts/install.mjs`.
- **Lý do:**
  - Thư mục nằm ngoài repo nên agent không thấy git của repo cha.
  - Copy `node_modules` sẵn có giúp tránh gọi mạng và tiết kiệm vài phút cho mỗi lượt.

### D4. Snapshot = danh sách đường dẫn + sha256, bỏ qua thư mục của adapter và dependency

- Bỏ qua thư mục cài đặt của adapter (`.claude/`, `.kiro/`, `.agents/`, lấy từ `adapter.json`) và `deps.dir`. Vẫn **giữ** `buildDirs` trong danh sách đường dẫn, để phát hiện thư mục sinh ra mà lúc đầu không có; chỉ không hash nội dung bên trong các thư mục này.
- Có ba snapshot: `before`, `mid` (chỉ ở chế độ confirm, chụp sau lượt 1) và `after`.
- Phân loại mỗi file thay đổi theo glob `testPaths` và `prodPaths`. File không khớp glob nào là "khác". Riêng manifest như `pom.xml`, `package.json` được xếp vào loại "cấu hình".

### D5. Chạy lại test trên bản sao thứ hai

- Kiểm tra thư mục còn sót trên bản copy mà agent đã chạy. Sau đó copy bản đó sang `<workdir>-verify/` rồi mới chạy `testCommand` ở đó.
- **Lý do:** lệnh test sinh ra `target/` hoặc `coverage/`. Nếu chạy ngay trên bản copy của agent, kết quả của mục D8 bị nhiễu, và người chấm không còn nhìn thấy đúng trạng thái agent để lại. Spec có yêu cầu riêng về điểm này.
- Không tin mã thoát của lệnh test. Công cụ trích tên các test fail bằng `failurePattern` rồi so tập đó với `expectedFailures`.

### D6. Gọi tiến trình bằng `spawn` không qua shell, xử lý `.cmd` trên Windows

- Trên POSIX: `spawn(executable, args, { shell: false })`.
- Trên Windows: nếu `executable` tìm theo PATH ra file `.cmd` hoặc `.bat`, thì chạy `cmd.exe /d /s /c` với các tham số được quote theo quy tắc của `cmd`. Prompt có thể chứa `$`, dấu ngoặc kép hoặc ký tự tiếng Việt, nên khi client hỗ trợ đọc prompt qua stdin (cờ `promptVia: "stdin"` trong cấu hình) thì ưu tiên cách đó.
- Hết thời gian thì kill cả cây tiến trình: `taskkill /T /F /PID` trên Windows, kill theo process group trên POSIX. Lượt đó được đánh dấu "không chạy được: timeout".
- **Phương án đã cân nhắc:** `shell: true`. Cách này đơn giản nhưng dễ vỡ khi quote các prompt có `$` hoặc dấu cách, và vướng thay đổi bảo mật của Node ≥ 18.20 khi spawn file `.cmd`.

### D7. Bảng mục: tự chấm, heuristic, cần chấm tay

| Loại | Mục | Cách chấm |
|---|---|---|
| Tự chấm | A3 | `mid` == `before` (chỉ chế độ confirm; chế độ auto thì "Không áp dụng") |
| Tự chấm | A5 | Có file production thay đổi thì "Không đạt". Không có thì xét báo cáo: báo cáo nhắc mọi `hardUnits[].name` thì "Đạt"; nếu không nhắc thì "Cần chấm tay" (agent có thể đã test được đơn vị đó mà không cần refactor) |
| Tự chấm | A7 | File chứa test cố ý fail không mất dòng nào, và test đó vẫn fail |
| Tự chấm | D1 | Chạy lại test: tập test fail ⊆ `expectedFailures`, và có ít nhất một file test mới hoặc đã sửa. "Không đạt" nếu không chạy lại được, hoặc nếu lệnh test trả mã lỗi mà không trích được test fail nào (lỗi biên dịch/cấu hình) |
| Tự chấm | D5 | Mọi file test có sẵn không mất hay sửa dòng nào (diff theo dòng; chỉ thêm dòng thì vẫn đạt) |
| Tự chấm | D8 | Chỉ file test thay đổi; không còn thư mục `buildDirs` mà lúc đầu không có |
| Tự chấm | E1 | Báo cáo có đủ tiêu đề mục của `templates/report.md`, so khớp không phân biệt cấp `#` và bỏ qua khác biệt về khoảng trắng |
| Tự chấm | F2 | `npm run check` pass trước khi chạy |
| Tự chấm | A4 | Chế độ auto: một lượt duy nhất đã ghi file test mới (chế độ confirm thì "Không áp dụng") |
| Tự chấm | A6 | Không file cấu hình/dependency nào thay đổi; có thay đổi thì "Cần chấm tay" để đối chiếu với kế hoạch |
| Tự chấm | F1 | "Đạt" khi lượt chạy được; lượt không chạy được thì cả lượt ghi "không chạy được" |
| Heuristic | A8 | Kế hoạch có mục "Tham số đã hiểu" và đủ 6 tên tham số. Kế hoạch thiếu mục 8 "Xác nhận" thì báo "Không đạt" kèm trích đoạn |
| Heuristic | C2 | Không khớp `badMarkers`. Khớp thì "Không đạt" kèm dòng khớp |
| Cần chấm tay | A1, A2, B1, B2, B3, B4, C1, C3, C4, C5, D2, D3, D4, D6, D7, E2, E3, E4 | Ghi "Cần chấm tay" kèm trích đoạn: tên test case mới, các mục coverage và đơn vị bỏ qua trong báo cáo |

- A9, E5, F3 là "Không áp dụng" trong v1. Lý do: dự án mẫu không phải git repo; `save-report` không được truyền; F3 cần so sánh nhiều client nên để người chấm làm.
- **Lý do:** heuristic được phép trả "Không đạt" khi có bằng chứng cụ thể. Nó chỉ trả "Đạt" cho những gì kiểm được bằng máy. Như vậy vẫn đúng requirement "không tự kết luận Đạt cho mục cần đọc hiểu".

### D8. Output và mã thoát

- File kết quả mặc định nằm ở `.eval/<runId>/results.md` trong repo (thêm `.eval/` vào `.gitignore`). Đổi bằng `--out`. Người dùng tự quyết định có copy kết quả vào `examples/results/` hay không.
- Cấu trúc file: tóm tắt đầu file, gồm số lượt, mục "Không đạt", lượt "không chạy được" và số mục cần chấm tay. Sau đó mỗi lượt có một phần theo mẫu trong `EVALUATION.md`, kèm đường dẫn bản copy và transcript.
- Mã thoát:
  - `0`: không có mục "Không đạt" và mọi lượt đều chạy được;
  - `1`: có mục "Không đạt" hoặc có lượt "không chạy được";
  - `2`: lỗi cấu hình hoặc tham số dòng lệnh.
- `--dry-run`: kiểm tra cấu hình, rồi in danh sách lượt và lệnh sẽ chạy cho từng lượt. Không tạo bản copy, không gọi agent. Dùng để kiểm cấu hình và tài liệu mà không tốn credit.
- `--verify-only` có hai bước:
  - `--prepare`: tạo bản copy, chụp `before` và in đường dẫn bản copy;
  - `--mark-mid <workdir>`: chỉ dùng với `mode=confirm`, chạy sau lượt kế hoạch và trước khi xác nhận, để chụp snapshot `mid`. Không có snapshot này thì A3 là "Cần chấm tay".
  - `--verify <workdir> [--plan-output <file>] [--report-output <file>]`: kiểm chứng trên bản copy đó. Snapshot được lưu dạng JSON trong `<workdir>.meta/`, ngoài bản copy để agent không thấy.
  - Client chưa có trong cấu hình: dùng `--prepare --client <tên> --adapter <adapter>`.

### D9. Test công cụ bằng client giả

- `scripts/test/fixtures/fake-agent.mjs` là một "client" Node. Hành vi của nó được điều khiển bằng biến môi trường, theo các kịch bản:
  - `good`: thêm file test, in kế hoạch và báo cáo đủ mục;
  - `edits-prod`: sửa file production;
  - `writes-in-plan`: ghi file ngay ở lượt 1 của chế độ confirm;
  - `leaves-build`: để lại thư mục build;
  - `deletes-old-test-line`: xóa một dòng trong test cũ;
  - `short-report`: báo cáo thiếu mục.
- Dự án mẫu giả là một project Node nhỏ, `testCommand` là `node run-tests.mjs`, có một test cố ý fail.
- Mỗi kịch bản phải cho đúng kết quả ở mục tương ứng. Cách này bao phủ các scenario của spec mà không tốn credit AI.

## Risks / Trade-offs

- **[Cờ CLI của client đổi theo phiên bản]**, ví dụ Codex đã đổi từ 0.154 lên 0.160. → Cờ nằm trong `eval.config.json`. Kết quả ghi phiên bản client lấy từ `versionArgs` để dễ đối chiếu.
- **[Quote tham số trên Windows sai, làm lệnh gọi client hỏng]** → Ưu tiên truyền prompt qua stdin khi client hỗ trợ. Có test đơn vị cho hàm quote với `$`, dấu cách, dấu ngoặc kép và tiếng Việt. Mọi lượt đều lưu lệnh thực tế đã chạy vào kết quả.
- **[Heuristic trích tên test fail hoặc tiêu đề mục sai, gây chấm nhầm]** → Mỗi kết luận đều kèm bằng chứng thô (dòng output, danh sách tiêu đề tìm thấy), để người chấm kiểm lại được. Pattern nằm trong cấu hình nên sửa được theo từng stack.
- **[Cờ quyền rộng (`--trust-all-tools`, `danger-full-access`) cho agent toàn quyền trên máy]** → Chỉ dùng trên bản copy trong thư mục tạm. Ghi rõ trong tài liệu, và in cảnh báo trước khi chạy agent thật.
- **[Chi phí: một ma trận đầy đủ 9 stack × 3 client × 2 chế độ tốn nhiều credit]** → Mặc định chỉ chạy những gì người dùng chọn. Không có lựa chọn "chạy tất cả" ngầm định. Trước khi chạy, công cụ in số lượt sẽ chạy.
- **[Trade-off: snapshot bằng sha256 không phân biệt được "sửa nhỏ" với "sửa lớn"]** → Với file test có sẵn, D5 dùng thêm diff theo dòng. Với file production thì bất kỳ thay đổi nào cũng là "Không đạt".
- **[Kiro resume theo thư mục, `--resume` có thể nối nhầm phiên nếu thư mục đã có phiên cũ]** → Mỗi lượt dùng một thư mục mới, nên mỗi thư mục chỉ có đúng một phiên.

## Migration Plan

Không áp dụng: đây là công cụ mới. Thêm `.eval/` vào `.gitignore`. Hướng dẫn đánh giá thủ công trong `EVALUATION.md` vẫn giữ nguyên, script chỉ là cách làm nhanh hơn.

## Open Questions

- Có nên tự sinh luôn file `examples/results/<client>-<stack>.md` theo định dạng hiện có không, hay chỉ xuất ra `.eval/`? Câu này quyết định được lúc dùng thực tế mà không ảnh hưởng spec, vì spec chỉ yêu cầu xuất theo mẫu.
- Danh sách `expectedFailures`/`failurePattern` cho các stack mobile (Android, iOS, Flutter) chỉ kiểm được trên máy có toolchain. V1 có thể chỉ cấu hình các stack đã chạy được trên Windows, còn lại bổ sung sau.
