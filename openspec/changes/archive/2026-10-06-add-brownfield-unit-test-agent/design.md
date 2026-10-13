# Design

## Context

- Repo `onboarding-unit-test` hiện chỉ có cấu hình OpenSpec, chưa có mã nguồn. Lý do làm change này: xem `proposal.md` (mục Why). Hành vi cần đạt: xem 6 spec trong `specs/`.
- "Agent" ở đây là **nội dung hướng dẫn cho LLM** (Markdown), không phải chương trình chạy riêng. Mọi thao tác như đọc code, ghi file hay chạy test đều do AI client thực hiện bằng các tool sẵn có của nó: đọc/ghi file, tìm kiếm, shell.
- Đợt đầu có 3 client, mỗi client nạp hướng dẫn theo cách riêng:
  - **Claude Code**: plugin (`.claude-plugin/plugin.json`) chứa subagent (`agents/*.md`), skill (`skills/<name>/SKILL.md`) và slash command.
  - **Kiro**: steering (`.kiro/steering/*.md`), prompt (`.kiro/prompts/*.prompt.md`), custom agent của Kiro CLI (`.kiro/agents/*.json`) và skill.
  - **Codex**: `AGENTS.md`, custom prompt (`~/.codex/prompts/*.md`) và skill (`.agents/skills/<name>/SKILL.md` hoặc `~/.codex/skills`).
- Cả 3 client đều hỗ trợ định dạng **Agent Skills** (`SKILL.md` với frontmatter `name`/`description` và tài nguyên đi kèm trong cùng thư mục). Đây là điểm chung lớn nhất giữa chúng, nên thiết kế dựa trên định dạng này. Đường dẫn cài đặt cụ thể của từng client phải được kiểm chứng lại khi làm adapter (xem Risks).

## Goals / Non-Goals

**Goals:**
- Chỉ có một nguồn nội dung lõi. Adapter cho từng client được sinh tự động từ nguồn này, không viết tay.
- Nạp nội dung theo nhu cầu: mỗi phiên chỉ nạp quy trình lõi và playbook của các stack thực sự xuất hiện trong phạm vi, để tiết kiệm context.
- Bộ tham số đầu vào và cấu trúc báo cáo cố định, giống nhau ở mọi client.
- Có cách kiểm thử chính agent trên các dự án mẫu brownfield của từng stack.

**Non-Goals:**
- Không viết chương trình/CLI riêng để sinh test, không gọi trực tiếp API của LLM.
- Không làm integration test, E2E test, UI test chạy trên thiết bị hay emulator. Agent chỉ viết unit test, kể cả với Android và iOS.
- Không tự refactor code production để dễ test. Agent chỉ đưa ra gợi ý trong báo cáo.
- Chưa hỗ trợ client khác ngoài Claude Code, Kiro, Codex. Chỉ tài liệu hóa hợp đồng adapter để bổ sung sau.
- Không tích hợp CI/CD ở đợt này.

## Decisions

### D1. Cấu trúc repo: tách `core/` (nguồn) và `adapters/` (đóng gói)

```
core/
  AGENT.md                 # quy trình 5 pha, nguyên tắc an toàn, tham số, cách chọn playbook
  phases/
    01-analyze.md          # nhận diện stack, tool, quy ước, toolchain
    02-plan.md             # chọn đơn vị mục tiêu, mẫu kế hoạch, điểm xác nhận
    03-generate.md         # nguyên tắc sinh test chung
    04-verify.md           # chạy test, vòng tự sửa, failed-test-policy, kiểm tra flaky, kiểm tra thay đổi ngoài phạm vi
    05-report.md           # quy tắc báo cáo
  playbooks/
    java-spring-boot.md  nodejs.md  python.md
    angular.md  react.md  vue.md
    android-java.md  ios-swift.md  flutter.md
  templates/
    plan.md  report.md     # mẫu kế hoạch và báo cáo có cấu trúc cố định
  detection.md             # bảng dấu hiệu nhận diện -> stack -> playbook
adapters/
  claude-code/  kiro/  codex/   # chỉ chứa phần bọc: manifest, frontmatter, file hướng dẫn cài
scripts/
  build.mjs                # sinh dist/<client>/ từ core + adapters
  check.mjs                # kiểm tra playbook đủ mục bắt buộc, dist đồng bộ với core, lõi không nhắc tên tool riêng của client
dist/                      # output của build, là thứ người dùng cài
examples/                  # dự án mẫu brownfield cho từng stack, dùng để kiểm thử agent
```

- **Lý do:** đáp ứng yêu cầu "Một nguồn lõi duy nhất" và "Độc lập với AI client". Playbook tách theo file để nạp theo nhu cầu.
- **Phương án đã cân nhắc:** (a) một file prompt lớn chứa mọi thứ: đơn giản nhưng phình context và khó bảo trì 9 stack; (b) viết tay adapter cho từng client: nhanh lúc đầu nhưng chắc chắn lệch nhau theo thời gian.

### D2. Đơn vị đóng gói chung là một Agent Skill: `brownfield-unit-test`

- `dist/<client>/` luôn chứa thư mục skill `brownfield-unit-test/`, gồm `SKILL.md` (sinh từ `core/AGENT.md`) và các tài nguyên đi kèm (`phases/`, `playbooks/`, `templates/`, `detection.md`) được tham chiếu bằng đường dẫn tương đối.
- Adapter thêm lớp gọi riêng của từng client:
  - **Claude Code**: plugin `brownfield-unit-test` gồm skill, subagent `unit-test-writer` (chạy trong context riêng, được giao task bởi agent chính) và slash command `/unit-test`.
  - **Kiro**: skill và prompt `unit-test` trong `.kiro/prompts/`. Có thêm custom agent JSON cho Kiro CLI nếu cần giới hạn tool.
  - **Codex**: skill và custom prompt `unit-test`. Có đoạn gợi ý để người dùng thêm vào `AGENTS.md` nếu muốn agent tự kích hoạt.
- **Lý do:** Agent Skills là định dạng chung của cả 3 client và hỗ trợ sẵn cơ chế nạp tài nguyên theo nhu cầu (progressive disclosure). Adapter nhờ đó rất mỏng.
- **Phương án đã cân nhắc:** chỉ dùng `AGENTS.md`/steering. Cách này luôn nạp vào mọi phiên nên tốn context cả khi không viết test, và không đóng gói kèm tài nguyên được.

### D3. Lõi chỉ mô tả thao tác chung; adapter ánh xạ sang tool cụ thể

- Lõi dùng các động từ trung lập: "đọc file", "tìm file theo mẫu", "tìm nội dung", "ghi file", "chạy lệnh shell", "hỏi người dùng".
- Nếu một client cần chỉ dẫn thêm (ví dụ quyền chạy shell, giới hạn tool của subagent), phần đó nằm trong frontmatter/manifest của adapter, không nằm trong lõi.
- `check.mjs` quét `core/` và báo lỗi nếu gặp tên tool hay cú pháp riêng của client (danh sách từ khóa cấm lưu trong script).

### D4. Tham số đầu vào: cú pháp `key=value` trong lời gọi, kèm hiểu ngôn ngữ tự nhiên

| Tham số | Mặc định | Giá trị |
|---|---|---|
| `scope` | bắt buộc | đường dẫn file/thư mục/module, `Class#method`, hoặc `changed:<git-ref>` |
| `coverage-target` | không đặt | phần trăm (0–100) |
| `mode` | `confirm` | `confirm` / `auto` |
| `max-fix-attempts` | `3` | số nguyên 1–10 |
| `failed-test-policy` | `remove` | `remove` / `disable` |
| `save-report` | không lưu | `true` (vị trí mặc định) hoặc đường dẫn file |

- Ví dụ: `/unit-test scope=src/main/java/com/acme/order mode=auto max-fix-attempts=5`.
- Người dùng cũng có thể nói tự nhiên ("viết test cho OrderService, chạy tự động"). Agent quy đổi sang tham số và in bảng tham số đã hiểu ở đầu kế hoạch.
- Giá trị không hợp lệ thì dùng mặc định và ghi lại trong kế hoạch (theo spec `test-verification`).
- **Lý do:** cả 3 client đều truyền phần chữ sau lệnh vào prompt dưới dạng văn bản, nên `key=value` là mẫu số chung. Không client nào có cơ chế tham số có kiểu dữ liệu dùng chung được.
- Vị trí lưu báo cáo mặc định là `.unit-test-agent/reports/<yyyyMMdd-HHmm>-report.md` trong dự án đích.

### D5. Nhận diện stack: bảng dấu hiệu, xét theo từng thư mục có manifest

- `detection.md` là bảng: dấu hiệu → stack. Ví dụ:
  - `pom.xml`/`build.gradle` có `spring-boot` → Spring Boot
  - `build.gradle` có `com.android.application` → Android
  - `package.json` có `@angular/core` / `react` / `vue` → frontend tương ứng, ngược lại là Node.js
  - `pyproject.toml`/`requirements.txt`/`setup.py` → Python
  - `*.xcodeproj`/`Package.swift` → iOS
  - `pubspec.yaml` có `flutter` → Flutter
- Thứ tự ưu tiên cố định để tách các trường hợp chồng lấn (ví dụ Angular/React/Vue được xét trước Node.js).
- Monorepo: tìm các manifest nằm trong phạm vi, mỗi thư mục chứa manifest là một module có stack riêng.

### D6. Pha phân tích học quy ước từ mẫu có giới hạn

- Mỗi module lấy tối đa khoảng 5 file test gần đơn vị mục tiêu nhất (cùng package/thư mục trước, rồi tới module). Từ đó rút ra quy ước đặt tên, cấu trúc, style assertion và helper dùng chung.
- Kết quả ghi thành mục "Quy ước đã nhận diện" trong kế hoạch, để người dùng sửa được trước khi agent sinh test.
- **Lý do:** đọc toàn bộ test của dự án lớn thì tốn context; lấy mẫu gần mục tiêu thì sát với phong cách của đúng module đó.

### D7. Kiểm chứng: từ hẹp đến rộng, kiểm tra thay đổi bằng git

- Thứ tự chạy: test mới đơn lẻ → vòng tự sửa (`max-fix-attempts`, tính riêng cho từng file) → chạy lại lần 2 để phát hiện flaky → chạy toàn bộ test của module → đo coverage (nếu có).
- Coverage "trước" đo ở cuối pha phân tích và chỉ trên phạm vi mục tiêu. Nếu lệnh đo quá lâu hoặc lỗi thì ghi "không đo được" kèm lý do.
- Kiểm tra thay đổi ngoài phạm vi: nếu dự án đích là git repo thì dùng `git status`/`git diff --name-only` so với trạng thái đầu phiên (ghi nhận ở pha 1). Nếu không phải git repo thì agent tự lưu danh sách file đã ghi và đối chiếu. File production nào bị đổi thì hoàn tác.
- `failed-test-policy=disable` dùng cơ chế disable chuẩn của framework: `@Disabled` (JUnit 5), `@Ignore` (JUnit 4), `it.skip`/`xit`, `@pytest.mark.skip`, `XCTSkip`, `skip:` (flutter_test). Mỗi playbook ghi cú pháp cụ thể, kèm chú thích `TODO(unit-test-agent): <lý do>`.

### D8. Build và kiểm tra bằng Node.js, không dùng dependency ngoài

- `scripts/build.mjs` và `scripts/check.mjs` chỉ dùng module có sẵn của Node (≥ 18). Chạy bằng `node scripts/build.mjs [--client <name>]` và `node scripts/check.mjs`.
- Có thêm lệnh cài tiện lợi `node scripts/install.mjs --client <name> --target <project|user>` để sao chép `dist/<client>` vào đúng vị trí. Tài liệu vẫn ghi cách cài thủ công.
- **Lý do:** Node có mặt ở hầu hết máy dev và chạy được trên cả Windows/macOS/Linux. Không cần `npm install`.
- **Phương án đã cân nhắc:** script shell/PowerShell khó chạy chéo nền tảng; Python cũng được nhưng đội frontend/mobile ít khi có sẵn đúng phiên bản.

### D9. Kiểm thử chính agent bằng dự án mẫu và checklist

- `examples/<stack>/` là dự án nhỏ mang đặc điểm brownfield: có vài test cũ theo một quy ước riêng, một class dễ test, một class khó test (phụ thuộc cứng), và một test cũ đang fail có chủ đích.
- `examples/EVALUATION.md` là checklist chấm theo scenario trong spec: có tuân quy ước không, có sửa production không, có giữ test cũ không, báo cáo có đủ mục không…
- Đợt đầu chấm thủ công trên cả 3 client. Tự động hóa để sau.

## Risks / Trade-offs

- [Định dạng và đường dẫn cài của client thay đổi hoặc khác so với mô tả ở Context] → Mỗi adapter có tài liệu nguồn tham chiếu và phiên bản đã kiểm chứng. Task đầu tiên của mỗi adapter là kiểm chứng lại định dạng thực tế. Thay đổi chỉ ảnh hưởng `adapters/`.
- [LLM không tuân thủ tuyệt đối nguyên tắc an toàn, ví dụ vẫn sửa code production] → Kiểm tra bằng git ở D7 là lớp bảo vệ cuối. Nguyên tắc được lặp lại ngắn gọn ở cả `AGENT.md` và `04-verify.md`. Dự án mẫu có tình huống bẫy để phát hiện.
- [Dự án lớn làm tràn context] → Nạp playbook theo nhu cầu, lấy mẫu test có giới hạn (D6). Khuyến nghị dùng `scope` hẹp. Với Claude Code, việc chạy trong subagent giúp tách context khỏi phiên chính.
- [Thiếu toolchain (Xcode chỉ chạy trên macOS; Android SDK và Flutter SDK nặng)] → Agent báo rõ và hỏi người dùng (spec `project-analysis`). Test được đánh dấu "chưa kiểm chứng" thay vì giả định pass.
- [Build Gradle/Xcode chậm khiến vòng tự sửa tốn thời gian] → Chạy test đơn lẻ trước (D7). Giới hạn `max-fix-attempts` ≤ 10. Playbook ghi lệnh chạy nhanh nhất cho từng stack (ví dụ `--tests`, `-only-testing`).
- [Hành vi giữa 3 client lệch nhau do khác biệt về model và tool] → Mẫu kế hoạch và báo cáo cố định (`core/templates`). Checklist ở D9 chạy trên cả 3 client.
- [Trade-off: dùng Agent Skill làm đơn vị chung phụ thuộc vào việc client hỗ trợ skill] → Với client không hỗ trợ skill, hợp đồng adapter cho phép dùng phương án dự phòng: gộp `AGENT.md` thành một file prompt/steering và tham chiếu playbook bằng đường dẫn.

## Migration Plan

Không áp dụng: đây là tính năng mới, chưa có người dùng hay dữ liệu cần chuyển đổi. Phát hành bằng cách chạy build rồi phân phối `dist/<client>/`. Gỡ cài bằng cách xóa các file đã cài, theo hướng dẫn của từng adapter.

## Open Questions

- Tên hiển thị cuối cùng của plugin và lệnh (`brownfield-unit-test`, `/unit-test`) có thể đổi trước khi phát hành mà không ảnh hưởng spec.
- Có phát hành plugin Claude Code qua một marketplace nội bộ hay chỉ cài từ thư mục local: quyết định lúc phát hành.
