# Brownfield Unit Test Agent

Agent chuyên viết unit test cho dự án **brownfield** (dự án đã có code, có thể đã có test cũ). Agent đọc codebase, học quy ước test đang có, lập kế hoạch, sinh test, tự chạy và sửa test, rồi báo cáo. Agent không bao giờ sửa code production và không làm hỏng test hiện có.

Stack hỗ trợ:

| Nhóm | Stack |
|---|---|
| Backend | Java Spring Boot, Node.js, Python |
| Frontend | Angular, React, Vue |
| Mobile | Android Java native, iOS Swift, Flutter |

Lõi agent **không phụ thuộc AI client**. Bản đầu tiên đóng gói sẵn cho Claude Code, Kiro và Codex.

## Cấu trúc repo

```
core/                 Lõi agent dùng chung (Markdown thuần, không nhắc tới client nào)
  AGENT.md            Chỉ dẫn chính: tham số, 5 pha, quy tắc an toàn
  detection.md        Cách nhận diện stack
  phases/             Chi tiết từng pha: analyze → plan → generate → verify → report
  playbooks/          Một playbook cho mỗi stack
  templates/          Mẫu kế hoạch và báo cáo
adapters/<client>/    Lớp vỏ mỏng cho từng client (adapter.json, files/, INSTALL.md)
  CONTRACT.md         Hợp đồng adapter: cách thêm client mới mà không sửa lõi
  claude-code/
  kiro/
  codex/
scripts/              Script build / check / install / eval (Node ≥ 18, không dependency)
  eval/               Các module của công cụ đánh giá tự động
  test/               Test cho các script
eval.config.json      Cấu hình đánh giá: lệnh gọi từng client, thông tin từng dự án mẫu
examples/             Dự án mẫu từng stack để đánh giá agent
openspec/             Tài liệu đặc tả (proposal, design, specs, tasks)
dist/<client>/        Kết quả build (sinh tự động, không commit)
```

## Luồng làm việc: core → build → dist → install

1. **Sửa lõi** trong `core/`. Không sửa trực tiếp trong `dist/`.
2. **Build**: ghép `core/AGENT.md` thành `SKILL.md` kèm frontmatter của adapter, chép tài nguyên lõi và file vỏ của adapter vào `dist/<client>/`, ghi `.build-manifest.json` (hash sha256).
3. **Check**: kiểm tra playbook đủ các mục bắt buộc, lõi không chứa từ riêng của client, và `dist/` khớp với lõi (phát hiện sửa tay hoặc quên build lại).
4. **Install**: chép bản build vào dự án đích (`--target project`) hoặc thư mục người dùng (`--target user`).

## Yêu cầu

- Node.js ≥ 18 (chỉ để chạy script build/check/install; bản thân agent không cần Node).
- Toolchain của dự án đích (Maven/Gradle, npm, pytest, Flutter, Xcode…) để agent chạy test.

## Dùng script

Các lệnh `npm` giống nhau trên Windows, macOS và Linux. Tham số sau `--` được chuyển cho script.

```bash
npm test                                   # chạy test của các script
npm run check                              # kiểm tra lõi, playbook và dist
npm run check -- --require-dist            # coi adapter chưa build là lỗi
npm run build                              # build tất cả adapter vào dist/
npm run build -- --client claude-code      # build một client
npm run install-agent -- --client claude-code --target project --path <thư-mục-dự-án>
npm run install-agent -- --client claude-code --target user
npm run install-agent -- --client claude-code --target project --path <thư-mục-dự-án> --uninstall
```

Gọi thẳng bằng Node cũng được, ví dụ `node scripts/build.mjs --client kiro`.

## Đánh giá agent

Có hai cách đánh giá agent trên các dự án mẫu trong `examples/`: chấm tay theo `examples/EVALUATION.md`, hoặc chạy công cụ đánh giá tự động:

```bash
npm run eval -- --client kiro --stack java-spring-boot --mode both --dry-run   # xem lệnh sẽ chạy, không gọi agent
npm run eval -- --client claude-code,kiro --stack java-spring-boot --mode both
```

Chi tiết cách dùng, cách đọc kết quả, chế độ chỉ kiểm chứng, cùng các lưu ý về quyền và chi phí: xem mục "Chạy tự động" trong `examples/EVALUATION.md`.

Ghi chú theo hệ điều hành:

- Windows (PowerShell): đường dẫn có dấu cách phải đặt trong ngoặc kép, ví dụ `--path "E:\My Projects\shop"`.
- macOS/Linux: dùng đường dẫn POSIX, ví dụ `--path ~/projects/shop`. Không cần lệnh nào khác.
- `--target user` cài vào thư mục home (`%USERPROFILE%` trên Windows, `$HOME` trên macOS/Linux).

Hướng dẫn cài và gọi agent cho từng client nằm trong `INSTALL.md` của adapter tương ứng (được chép vào `dist/<client>/INSTALL.md` khi build).
