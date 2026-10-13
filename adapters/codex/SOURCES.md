# Nguồn kiểm chứng: adapter Codex

- Ngày kiểm chứng: 2026-10-02
- Phiên bản Codex CLI dùng để kiểm chứng: codex-cli 0.154.0 (`codex --version`). Bản phát hành mới nhất lúc kiểm chứng: 0.160.0 (https://github.com/openai/codex/releases/latest).

## Tài liệu tham chiếu

| Chủ đề | URL |
|---|---|
| Agent Skills | https://developers.openai.com/codex/skills (chuyển tới https://learn.chatgpt.com/docs/build-skills) |
| Custom prompt (đã deprecated) | https://learn.chatgpt.com/docs/custom-prompts |
| AGENTS.md | https://learn.chatgpt.com/docs/agent-configuration/agents-md |
| Chế độ không tương tác (`codex exec`) | https://learn.chatgpt.com/docs/non-interactive-mode |

## Các điểm đã xác nhận

### Skill

- Vị trí:
  - repo: `.agents/skills/<tên>/SKILL.md`, xét ở mọi thư mục từ thư mục hiện tại lên tới gốc repo;
  - user: `~/.agents/skills/<tên>/SKILL.md`;
  - admin: `/etc/codex/skills`; system: đi kèm Codex.
- `~/.codex/skills` không còn được nhắc trong tài liệu (máy kiểm chứng vẫn có thư mục này từ bản cũ). Adapter dùng `~/.agents/skills`.
- Frontmatter bắt buộc: `name`, `description`. Tùy chọn: file `agents/openai.yaml` (giao diện, `policy.allow_implicit_invocation`, mặc định `true`).
- Kích hoạt: nhắc tên `$brownfield-unit-test`, chọn qua `/skills`, hoặc tự động khi yêu cầu khớp `description`.
- Danh sách skill ban đầu bị giới hạn khoảng 2% context window; `description` của skill (311 ký tự) nằm trong giới hạn.

### Custom prompt

- **Đã deprecated**, tài liệu khuyên dùng skill. Vẫn hoạt động ở bản đã kiểm chứng.
- Chỉ có mức user: `~/.codex/prompts/*.md` (chỉ cấp trên cùng). **Không có mức project.**
- Frontmatter: `description`, `argument-hint`. Gọi bằng `/prompts:<tên>`.
- Placeholder: `$1`…`$9`, `$ARGUMENTS`, tên viết hoa `$KEY` (truyền `KEY=value`), `$$` cho ký tự `$`.
- Adapter cài prompt `unit-test` chỉ khi `--target user`, dùng `$ARGUMENTS` để chuyển nguyên chuỗi `key=value`.

### AGENTS.md

- Global: `~/.codex/AGENTS.override.md` nếu có, nếu không là `~/.codex/AGENTS.md`.
- Project: đi từ gốc git xuống thư mục hiện tại, mỗi thư mục lấy tối đa một file (`AGENTS.override.md` → `AGENTS.md` → tên dự phòng). Các file được nối từ gốc xuống, file gần thư mục hiện tại có hiệu lực sau cùng.
- Tổng dung lượng mặc định tối đa 32 KiB (`project_doc_max_bytes`).
- Adapter **không ghi đè** `AGENTS.md` của dự án; chỉ cung cấp đoạn gợi ý `AGENTS.snippet.md` để người dùng tự chèn.

### `codex exec` (không tương tác)

- Đã xác nhận bằng `codex exec --help` (0.154.0): `-C/--cd`, `-s/--sandbox <read-only|workspace-write|danger-full-access>`, `--skip-git-repo-check`, `--json`, `-o/--output-last-message <file>`, `--ephemeral`, `-m/--model`.
- Sandbox mặc định của `exec` là read-only; muốn agent ghi file test cần `--sandbox workspace-write`.
- `exec` từ chối chạy ngoài git repo nếu không có `--skip-git-repo-check`.
- `--full-auto` đã deprecated (dùng `--sandbox workspace-write`).
- Tiếp tục phiên: `codex exec resume --last "<tin nhắn>"`.
- Skill trong `exec`: tài liệu không nói rõ; kiểm chứng bằng chạy thật ở task 9.3 (nhắc `$brownfield-unit-test` trong prompt).
