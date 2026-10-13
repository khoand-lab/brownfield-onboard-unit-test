# Nguồn kiểm chứng: adapter Kiro

- Ngày kiểm chứng: 2026-10-02
- Phiên bản Kiro trên máy kiểm chứng: Kiro IDE 1.1.14 (`kiro --version`). **Kiro CLI (`kiro-cli`) chưa được cài**, nên các điểm về CLI dưới đây chỉ dựa trên tài liệu, chưa chạy thử.
- Tài liệu CLI tham chiếu (cập nhật 2026-09-12) nhắc tới tính năng của Kiro CLI v1.26.0; không tìm thấy số phiên bản mới nhất được công bố.

## Tài liệu tham chiếu

| Chủ đề | URL |
|---|---|
| Agent Skills | https://kiro.dev/docs/skills/ |
| Steering | https://kiro.dev/docs/steering/ |
| Prompt của Kiro CLI | https://kiro.dev/docs/cli/chat/manage-prompts/ |
| Custom agent (cấu hình) | https://kiro.dev/docs/custom-agents/configuration-reference/ |
| Lệnh Kiro CLI | https://kiro.dev/docs/reference/cli-commands/ |

## Các điểm đã xác nhận

### Skill (IDE và CLI)

- Vị trí:
  - workspace: `.kiro/skills/<tên>/SKILL.md`
  - global: `~/.kiro/skills/<tên>/SKILL.md`
  - trùng tên thì bản workspace được ưu tiên.
- Frontmatter bắt buộc: `name` (khớp tên thư mục, chữ thường, số, gạch nối, tối đa 64 ký tự) và `description` (tối đa 1024 ký tự). Tùy chọn: `license`, `compatibility`, `metadata`.
- Tài nguyên đi kèm trong cùng thư mục được tham chiếu bằng đường dẫn tương đối (máy kiểm chứng có sẵn skill global dùng `references/`, `scripts/`).
- Kích hoạt:
  - tự động khi yêu cầu khớp `description` (lúc khởi động chỉ nạp `name`/`description`, nội dung đầy đủ nạp khi dùng);
  - gọi tường minh bằng `/brownfield-unit-test`; phần chữ sau lệnh được chuyển làm ngữ cảnh.
- Thay thế `$ARGUMENTS`/`${N}` trong skill **chỉ có ở CLI**. Adapter không dựa vào cơ chế này: lõi tự đọc tham số `key=value` từ yêu cầu.
- Web và Mobile chỉ hỗ trợ skill mức workspace.

### Steering

- `.kiro/steering/*.md` (workspace) và `~/.kiro/steering/` (global); frontmatter `inclusion: always | fileMatch | manual | auto`.
- Kiro CLI chưa hỗ trợ các chế độ `inclusion`: mọi file steering đều được nạp.
- **Không dùng steering cho adapter**: steering `always` làm tốn context ở mọi phiên (lý do của design D2), và CLI không tôn trọng `manual`.

### Prompt (chỉ Kiro CLI)

- Vị trí: `.kiro/prompts/` (ưu tiên cao nhất), rồi `~/.kiro/prompts/`.
- Gọi bằng `@<tên>` (không phải `/`). Quản lý bằng `/prompts list|create|edit|details`.
- **Prompt dạng file không nhận tham số** và không có cú pháp placeholder.
- Phần mở rộng `.md` và việc không cần frontmatter: **chưa xác nhận** từ tài liệu (tài liệu không ghi rõ).
- Kiro IDE: không tìm thấy tính năng prompt dạng file trong tài liệu. Trong IDE dùng skill (`/brownfield-unit-test`).

### Custom agent (Kiro CLI)

- Vị trí: `.kiro/agents/` (workspace) và `~/.kiro/agents/` (global). Định dạng JSON (hoặc `.md` có frontmatter).
- Trường dùng trong adapter: `name`, `description`, `prompt`, `tools`, `allowedTools`, `resources`.
- Custom agent **không tự nạp skill**: phải khai báo trong `resources` bằng URI `skill://...` (nạp lười). `file://` nạp ngay khi khởi động.
- Đường dẫn tương đối trong `resources`: tài liệu nói đường dẫn tương đối của `prompt` tính từ thư mục file cấu hình; với `skill://` tài liệu dùng ví dụ `skill://.kiro/skills/*/SKILL.md` (tương đối với workspace). Hỗ trợ `~` trong URI: **chưa xác nhận**. Adapter khai báo cả hai dạng (workspace và `~`) để agent hoạt động với cài đặt project hoặc user.
- `allowedTools` cho phép glob nhưng không cho phép `"*"` đơn lẻ.
- Chạy: `kiro-cli chat --agent unit-test-writer "<yêu cầu>"`. Không tương tác: `kiro-cli chat --no-interactive --trust-all-tools "<yêu cầu>"` (hoặc `--trust-tools a,b`). Tiếp tục phiên: `--resume`/`-r`. Không có cờ `--model` được tài liệu hóa.
- Tên tool built-in trong `allowedTools` (`fs_read`, `grep`, `glob`): lấy theo tài liệu CLI, **chưa chạy thử**.

## Những gì cần kiểm chứng lại khi có Kiro CLI

1. Prompt `.kiro/prompts/unit-test.md` hiện trong `/prompts list` và gọi được bằng `@unit-test`.
2. `skill://~/.kiro/skills/...` trong `resources` của custom agent được nhận khi cài mức user.
3. Tên tool trong `allowedTools`.
