# Nguồn kiểm chứng: adapter Claude Code

- Ngày kiểm chứng: 2026-09-30
- Phiên bản Claude Code dùng để kiểm chứng: 2.1.285 (`claude --version`)

## Tài liệu tham chiếu

| Chủ đề | URL |
|---|---|
| Plugin (manifest, cấu trúc thư mục) | https://code.claude.com/docs/en/plugins-reference |
| Subagent | https://code.claude.com/docs/en/sub-agents |
| Skill và lệnh slash | https://code.claude.com/docs/en/skills |

## Các điểm đã xác nhận

### Plugin

- Manifest nằm ở `.claude-plugin/plugin.json`. Chỉ trường `name` (kebab-case) là bắt buộc.
- Trường tùy chọn: `version`, `description`, `author`, `homepage`, `repository`, `license`, `keywords`.
- Thành phần nằm ở gốc plugin, không nằm trong `.claude-plugin/`:
  - `skills/<tên>/SKILL.md`
  - `agents/*.md`
  - `commands/*.md` (định dạng cũ, vẫn được hỗ trợ)
- Thành phần của plugin được gắn namespace:
  - subagent: `brownfield-unit-test:unit-test-writer`
  - lệnh: `/brownfield-unit-test:unit-test`
- Nạp plugin để thử bằng `claude --plugin-dir <thư mục>`.
- Kiểm tra plugin bằng `claude plugin validate <thư mục>`.
- Biến `${CLAUDE_PLUGIN_ROOT}` được thay thế trong nội dung skill/lệnh/agent.

### Subagent

- Vị trí:
  - `.claude/agents/` (project)
  - `~/.claude/agents/` (user)
  - `agents/` trong plugin
- Frontmatter:
  - Bắt buộc: `name`, `description`.
  - Tùy chọn: `tools` (bỏ trống thì kế thừa toàn bộ), `model`, `skills`, `maxTurns`, `color`, …
- Trường `skills` nạp sẵn toàn bộ nội dung skill vào context của subagent. Skill có `disable-model-invocation: true` thì không nạp sẵn được.
- Phần thân file trở thành system prompt. Subagent chạy trong context riêng.
- Subagent của plugin bỏ qua các trường `hooks`, `mcpServers`, `permissionMode`.

### Skill và lệnh slash

- Vị trí skill:
  - `.claude/skills/<tên>/SKILL.md` (project)
  - `~/.claude/skills/<tên>/SKILL.md` (user)
- Vị trí lệnh: `.claude/commands/*.md` (project) hoặc `~/.claude/commands/*.md` (user), tạo lệnh `/<tên file>`.
- Frontmatter liên quan:
  - `name`, `description`: tổng độ dài `description` và `when_to_use` tối đa 1536 ký tự.
  - `argument-hint`, `disable-model-invocation`, `allowed-tools`.
- Thay thế tham số:
  - `$ARGUMENTS` là toàn bộ chuỗi tham số. Nếu nội dung không có placeholder, tham số được nối vào cuối dạng `ARGUMENTS: <giá trị>`.
  - `$ARGUMENTS[N]` / `$N` lấy tham số theo vị trí.
- File hỗ trợ (phases, playbooks, templates) được tham chiếu bằng đường dẫn tương đối từ `SKILL.md`. Nên giữ `SKILL.md` dưới 500 dòng.

## Hệ quả cho adapter

- `dist/claude-code/` là một plugin hoàn chỉnh: `.claude-plugin/plugin.json`, `skills/brownfield-unit-test/`, `agents/unit-test-writer.md`, `commands/unit-test.md`.
- Có hai cách cài:
  - **Dạng plugin:** thành phần có namespace, ví dụ `/brownfield-unit-test:unit-test`.
  - **Dạng rời** (mức project hoặc user): copy skill/agent/lệnh vào `.claude/` hoặc `~/.claude/`, gọi bằng `/unit-test` và subagent `unit-test-writer`.
- Khi Claude Code đổi định dạng, cập nhật file này cùng với `adapter.json` và `files/`.
