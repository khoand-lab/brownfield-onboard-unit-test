# Cài agent `brownfield-unit-test` cho Codex

Yêu cầu:

- Node.js ≥ 18 để build và cài.
- Codex CLI hoặc Codex IDE extension (đã kiểm chứng với codex-cli 0.154.0, xem `SOURCES.md`).

Mọi lệnh dưới đây chạy tại thư mục gốc của repo agent.

## 1. Build

```bash
npm run build -- --client codex
```

Kết quả nằm ở `dist/codex/`:

```
dist/codex/
├── skills/brownfield-unit-test/   (SKILL.md, phases/, playbooks/, templates/, detection.md)
├── prompts/unit-test.md           (custom prompt, chỉ cài ở mức user)
└── AGENTS.snippet.md              (đoạn gợi ý để tự chèn vào AGENTS.md)
```

## 2. Cài đặt

### Cách A: mức project (khuyến nghị cho một dự án)

```bash
node scripts/install.mjs --client codex --target project --path <thư-mục-dự-án>
```

Lệnh này copy skill vào `<dự-án>/.agents/skills/brownfield-unit-test/`. Có thể commit thư mục này để cả nhóm dùng chung. Codex tìm skill ở `.agents/skills` của mọi thư mục từ thư mục đang làm việc lên tới gốc repo.

Codex không hỗ trợ custom prompt mức project, nên cách A không cài lệnh `/prompts:unit-test`; gọi agent bằng `$brownfield-unit-test` (xem mục 3).

### Cách B: mức user (dùng cho mọi dự án trên máy)

```bash
node scripts/install.mjs --client codex --target user
```

Lệnh này copy:

- skill vào `~/.agents/skills/brownfield-unit-test/`;
- custom prompt vào `~/.codex/prompts/unit-test.md`.

Custom prompt đã bị Codex đánh dấu deprecated nhưng vẫn hoạt động; nó chỉ là lối tắt để truyền tham số, mọi logic nằm trong skill.

### Tùy chọn: tự kích hoạt qua `AGENTS.md`

Skill đã tự kích hoạt khi yêu cầu khớp mô tả. Nếu muốn nhắc Codex rõ hơn, chèn nội dung `dist/codex/AGENTS.snippet.md` vào `AGENTS.md` của dự án (hoặc `~/.codex/AGENTS.md`). Lệnh cài **không** tự sửa `AGENTS.md`.

Sau khi cài, mở phiên Codex mới trong thư mục dự án.

## 3. Cách gọi

### Bằng tên skill

```
$brownfield-unit-test scope=src/main/java/com/example/shop coverage-target=80
$brownfield-unit-test scope=OrderService#placeOrder mode=auto
```

Có thể chọn skill qua `/skills`. Agent tự đọc các cặp `key=value` trong tin nhắn.

### Bằng custom prompt (chỉ khi cài mức user)

```
/prompts:unit-test scope=src/services mode=auto coverage-target=80
```

### Bằng ngôn ngữ tự nhiên

Ví dụ: "viết unit test cho thư mục src/services, chạy tự động, coverage 80%". Agent quy đổi sang tham số và in bảng tham số đã hiểu ở đầu kế hoạch.

### Không tương tác (`codex exec`)

```bash
codex exec -C <thư-mục-dự-án> --sandbox workspace-write "\$brownfield-unit-test scope=src mode=auto"
```

- Sandbox mặc định của `codex exec` là read-only: cần `--sandbox workspace-write` để agent ghi được file test. Chỉ dùng trên bản copy hoặc nhánh riêng.
- Thư mục không phải git repo cần thêm `--skip-git-repo-check`.
- Trên Windows (sandbox `elevated`), lệnh trong sandbox `workspace-write` không đọc được thư mục home của người dùng: Maven/Gradle không truy cập được `~/.m2`/`~/.gradle` (đã gặp `AccessDeniedException`, `user.home` bị hiểu là `C:\`). Agent sẽ báo thiếu môi trường và hỏi, đúng như thiết kế, nhưng không chạy được test. Dự án Node/Python có dependency nằm trong thư mục dự án (`node_modules`, `.venv`) chạy bình thường. Với dự án JVM, cần nới quyền sandbox trên bản copy hoặc nhánh riêng (ví dụ `--sandbox danger-full-access`), hoặc chạy Codex trong WSL/Linux.
- Cũng trên Windows, chính sách lệnh của Codex có thể chặn `Remove-Item` ("blocked by policy"), kể cả khi dùng `--sandbox danger-full-access`. Đã gặp ở 0.154.0. Ở 0.160.0, có lượt agent dọn được `target/`, nhưng cũng có lượt vẫn bị chặn và còn sót `coverage/`, `dist/`. Thư mục build hoặc coverage do agent sinh ra (`target/`, `coverage/`) có thể bị bỏ lại; agent sẽ ghi việc này trong báo cáo. Sau phiên, xóa tay các thư mục đó.
  - Đợt đánh giá 2026-10-06 (0.160.0): khi `Remove-Item` bị chặn, Codex có lượt xóa được bằng `[System.IO.Directory]::Delete(<đường dẫn>, $true)` (nodejs auto, angular confirm), nhưng cũng có lượt chỉ xóa được file bên trong và để lại thư mục rỗng (`coverage/` ở nodejs confirm, `__pycache__/` ở python confirm). Với Python, Codex tránh sinh cache bằng `python -B -m pytest -p no:cacheprovider` và `coverage erase`. Sau phiên vẫn nên liệt kê thư mục gốc và xóa tay phần còn sót.
  - Cùng đợt này, có lượt Codex gặp thư mục dự án bị tiến trình khác khóa khi chạy coverage (angular). Agent không dừng tiến trình nào, mà ghi coverage "sau" là "không đo được" kèm lý do, đúng nguyên tắc an toàn. Đóng các tiến trình đang giữ thư mục (trình soạn thảo, watcher) trước khi chạy để có đủ số liệu.
- Với dự án Gradle (Android), `codex exec` không thoát chừng nào Gradle daemon do agent khởi chạy còn sống, kể cả khi lượt đã xong (`turn.completed`). Daemon chỉ tự tắt sau khoảng 3 giờ rảnh. Đã gặp ở 0.162.1 (đợt đánh giá 2026-10-11/12): agent làm xong trong khoảng 20 phút, nhưng tiến trình chỉ kết thúc khi daemon dừng, khoảng 3,5 giờ sau. Khi chạy headless, đặt `GRADLE_OPTS=-Dorg.gradle.daemon=false` cho phiên Codex (Gradle dùng daemon một lần rồi tắt khi build xong). `eval.config.json` đã đặt biến này cho client Codex.
- Với `mode=confirm`, agent in kế hoạch rồi dừng; tiếp tục bằng `codex exec resume --last "đồng ý kế hoạch, làm tiếp"`.
- Trong shell, viết `\$brownfield-unit-test` (bash) hoặc `` `$brownfield-unit-test `` (PowerShell) để `$` không bị hiểu là biến.

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
node scripts/install.mjs --client codex --target project --path <thư-mục-dự-án> --uninstall
node scripts/install.mjs --client codex --target user --uninstall
```

Lệnh gỡ chỉ xóa các file agent đã cài, cùng các thư mục `.agents/...`, `.codex/prompts` nếu chúng trở nên rỗng. Nếu đã chèn đoạn gợi ý vào `AGENTS.md`, xóa đoạn đó bằng tay.

## 6. Cập nhật

Build lại, rồi chạy lại lệnh cài. Lệnh cài ghi đè bản cũ.

Không sửa trực tiếp file đã cài. `npm run check` phát hiện bản build bị sửa tay; mọi thay đổi phải nằm trong `core/` hoặc `adapters/codex/`.
