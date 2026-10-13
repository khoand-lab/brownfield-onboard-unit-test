# Cài agent `brownfield-unit-test` cho Kiro

Yêu cầu:

- Node.js ≥ 18 để build và cài.
- Kiro IDE (đã kiểm chứng định dạng với 1.1.14) và/hoặc Kiro CLI (`kiro-cli`). Xem `SOURCES.md` về những điểm đã và chưa kiểm chứng.

Mọi lệnh dưới đây chạy tại thư mục gốc của repo agent.

## 1. Build

```bash
npm run build -- --client kiro
```

Kết quả nằm ở `dist/kiro/`:

```
dist/kiro/
├── skills/brownfield-unit-test/   (SKILL.md, phases/, playbooks/, templates/, detection.md)
├── prompts/unit-test.md           (prompt cho Kiro CLI, gọi bằng @unit-test)
└── agents/unit-test-writer.json   (custom agent cho Kiro CLI)
```

## 2. Cài đặt

### Cách A: mức project (khuyến nghị cho một dự án)

```bash
node scripts/install.mjs --client kiro --target project --path <thư-mục-dự-án>
```

Lệnh này copy vào dự án đích:

- `.kiro/skills/brownfield-unit-test/`
- `.kiro/prompts/unit-test.md`
- `.kiro/agents/unit-test-writer.json`

Có thể commit các file này để cả nhóm dùng chung.

### Cách B: mức user (dùng cho mọi dự án trên máy)

```bash
node scripts/install.mjs --client kiro --target user
```

Lệnh này copy các file tương tự vào `~/.kiro/skills/`, `~/.kiro/prompts/` và `~/.kiro/agents/`. Nếu cùng lúc có bản cài mức project, Kiro ưu tiên bản project.

### Cài thủ công

Copy thư mục `dist/kiro/skills/brownfield-unit-test` vào `.kiro/skills/` (hoặc `~/.kiro/skills/`). Chỉ skill là bắt buộc; prompt và custom agent là tùy chọn, chỉ dùng cho Kiro CLI.

Sau khi cài, mở lại workspace trong Kiro IDE (hoặc khởi động phiên `kiro-cli chat` mới).

## 3. Cách gọi

### Kiro IDE: bằng lệnh skill

Trong khung chat:

```
/brownfield-unit-test scope=src/main/java/com/example/shop coverage-target=80
/brownfield-unit-test scope=OrderService#placeOrder mode=auto
/brownfield-unit-test scope=changed:origin/main failed-test-policy=disable max-fix-attempts=5
```

Phần chữ sau lệnh được chuyển cho skill; agent tự đọc các cặp `key=value`.

### Kiro IDE và CLI: bằng ngôn ngữ tự nhiên

Skill được tự nạp khi yêu cầu khớp mô tả, ví dụ: "viết unit test cho thư mục src/services, chạy tự động, coverage 80%". Agent quy đổi sang tham số và in bảng tham số đã hiểu ở đầu kế hoạch.

### Kiro CLI: bằng prompt

```
@unit-test scope=src/services mode=auto
```

Prompt dạng file của Kiro CLI không nhận tham số. Vì vậy prompt chỉ nạp hướng dẫn dùng skill; tham số được agent đọc từ phần chữ trong cùng tin nhắn. Nếu tin nhắn chưa có `scope`, agent sẽ hỏi.

### Kiro CLI: bằng custom agent

```bash
kiro-cli chat --agent unit-test-writer "scope=src/services coverage-target=80"
```

Agent `unit-test-writer` nạp sẵn skill qua `resources` và chỉ tự động cho phép các tool đọc (`fs_read`, `grep`, `glob`); ghi file và chạy lệnh vẫn cần người dùng duyệt.

Chạy không tương tác (ví dụ trong script). Lưu ý: `--trust-all-tools` cho phép agent ghi file và chạy lệnh mà không hỏi, chỉ dùng trên bản copy hoặc nhánh riêng:

```bash
kiro-cli chat --agent unit-test-writer --no-interactive --trust-all-tools "scope=src mode=auto"
```

Với `mode=confirm` khi chạy không tương tác, agent in kế hoạch rồi dừng; tiếp tục bằng `kiro-cli chat --resume --no-interactive ... "đồng ý kế hoạch, làm tiếp"`.

## 4. Tham số

| Tham số | Mặc định | Giá trị |
|---|---|---|
| `scope` | bắt buộc | file, thư mục, module, `Class#method`, `changed:<git-ref>` |
| `coverage-target` | không đặt | 0–100 |
| `mode` | `confirm` | `confirm` / `auto` |
| `max-fix-attempts` | `3` | 1–10, tính cho từng file test |
| `failed-test-policy` | `remove` | `remove` / `disable` |
| `save-report` | không lưu | `true` hoặc đường dẫn file |

## 5. Gỡ cài đặt

```bash
node scripts/install.mjs --client kiro --target project --path <thư-mục-dự-án> --uninstall
node scripts/install.mjs --client kiro --target user --uninstall
```

Lệnh gỡ chỉ xóa các file agent đã cài, cùng các thư mục `.kiro/...` nếu chúng trở nên rỗng. Các skill, steering và agent khác trong `.kiro/` không bị ảnh hưởng.

## 6. Cập nhật

Build lại, rồi chạy lại lệnh cài. Lệnh cài ghi đè bản cũ.

Không sửa trực tiếp file đã cài. `npm run check` phát hiện bản build bị sửa tay; mọi thay đổi phải nằm trong `core/` hoặc `adapters/kiro/`.

## 7. Không dùng steering

Adapter cố ý không cài file steering: steering `inclusion: always` nạp vào mọi phiên (tốn context cả khi không viết test), và Kiro CLI hiện bỏ qua chế độ `manual`. Nếu muốn Kiro luôn nhắc tới agent, có thể tự thêm một file steering ngắn trỏ tới skill, ví dụ `.kiro/steering/unit-test.md`:

```markdown
---
inclusion: manual
---
Khi được yêu cầu viết unit test, dùng skill brownfield-unit-test.
```
