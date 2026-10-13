# Hợp đồng adapter

Tài liệu này mô tả những gì một AI client cần có và những gì một adapter phải cung cấp để chạy agent `brownfield-unit-test`. Thêm client mới **không được** sửa `core/`.

## 1. Khả năng tối thiểu của client

Client phải cho model làm được các thao tác mà lõi mô tả bằng động từ trung lập:

| Thao tác trong lõi | Ví dụ ở client |
|---|---|
| đọc file | công cụ đọc file của client |
| tìm file theo mẫu, tìm nội dung | glob/grep hoặc lệnh shell tương đương |
| ghi file, sửa file | công cụ ghi/sửa file |
| chạy lệnh shell | terminal/shell tool, có trả về output và exit code |
| hỏi người dùng | trả lời trong chat rồi dừng lượt, hoặc công cụ hỏi riêng |

Thiếu "chạy lệnh shell" thì agent vẫn sinh được test nhưng mọi test sẽ là "chưa kiểm chứng". Thiếu đọc hoặc ghi file thì client không dùng được.

Nên có (không bắt buộc): cách nạp tài nguyên theo nhu cầu (progressive disclosure), lệnh slash hoặc prompt có tham số, chế độ chạy không tương tác để đánh giá.

## 2. Cách nạp lõi

Đơn vị đóng gói chung là **Agent Skill**: thư mục `brownfield-unit-test/` gồm

- `SKILL.md`: sinh từ `core/AGENT.md`, có frontmatter `name`, `description`;
- `phases/`, `playbooks/`, `templates/`, `detection.md`: copy nguyên từ `core/`, được `SKILL.md` tham chiếu bằng đường dẫn tương đối.

Chọn theo thứ tự:

1. **Client hỗ trợ Agent Skills** (Claude Code, Kiro, Codex): cài thư mục skill vào vị trí skill của client. Model tự đọc `phases/` và `playbooks/` khi cần.
2. **Client không hỗ trợ skill nhưng có file hướng dẫn luôn nạp** (rules, steering, system prompt file): dùng phương án dự phòng ở mục 5.

Adapter không được chứa bản sao sửa tay của quy trình hay playbook. Muốn đổi nội dung thì sửa `core/`.

## 3. Cách truyền tham số

Lõi nhận tham số dạng văn bản `key=value` (hoặc ngôn ngữ tự nhiên) trong yêu cầu của người dùng và tự in bảng "Tham số đã hiểu" ở đầu kế hoạch. Adapter chỉ cần đảm bảo phần chữ người dùng gõ đến được model:

- client có placeholder (`$ARGUMENTS`): đặt placeholder trong file lệnh/prompt;
- client không có placeholder: lệnh/prompt chỉ nói "dùng skill, tham số lấy từ tin nhắn của người dùng".

Không định nghĩa tham số mới trong adapter. Giá trị mặc định và kiểm tra hợp lệ nằm trong lõi.

## 4. Cấu trúc một adapter

```
adapters/<client>/
├── adapter.json      # bắt buộc
├── files/            # tùy chọn: file bọc riêng của client, copy vào dist/<client>/
├── INSTALL.md        # bắt buộc: cài, gỡ, cách gọi, mức project và user
└── SOURCES.md        # bắt buộc: tài liệu tham chiếu, phiên bản client đã kiểm chứng
```

`adapter.json`:

| Trường | Bắt buộc | Ý nghĩa |
|---|---|---|
| `client` | có | tên client, trùng tên thư mục |
| `skillPath` | có | vị trí thư mục skill bên trong `dist/<client>/`, ví dụ `skills/brownfield-unit-test` |
| `skillFrontmatter` | không | trường frontmatter thêm vào `SKILL.md` (ví dụ `argument-hint`); không ghi đè `name` trừ khi client bắt buộc |
| `install.project`, `install.user` | không | danh sách `{ "from": <đường dẫn trong dist/<client>>, "to": <đường dẫn đích> }`; `to` tính từ `--path` (project) hoặc thư mục home (user). Bỏ một mức nếu client không hỗ trợ |

Trong file ở `files/`, build thay các placeholder: `{{SKILL_NAME}}`, `{{SKILL_PATH}}`, `{{SKILL_DESCRIPTION}}`, `{{VERSION}}`.

Thư mục adapter bắt đầu bằng `_` bị bỏ qua khi build tất cả client (dùng cho bản nháp); vẫn build được bằng `--client _tên`.

## 5. Phương án dự phòng khi client không hỗ trợ skill

1. Đặt `skillPath` tới một thư mục mà model đọc được trong dự án, ví dụ `.<client>/brownfield-unit-test`.
2. Thêm vào `files/` một file hướng dẫn luôn nạp của client (rules/steering) với nội dung ngắn:
   "Khi được yêu cầu viết unit test, đọc `<skillPath>/SKILL.md` và làm theo; các file khác trong thư mục đó được tham chiếu bằng đường dẫn tương đối."
3. Không gộp toàn bộ playbook vào file luôn nạp: chỉ trỏ tới `SKILL.md`, để playbook vẫn được đọc theo nhu cầu.

## 6. Các bước thêm client mới

1. Kiểm chứng định dạng thực tế của client (vị trí skill/lệnh/rules ở mức project và user, cách truyền tham số, chế độ không tương tác). Ghi vào `adapters/<client>/SOURCES.md` kèm URL và phiên bản.
2. Tạo `adapters/<client>/adapter.json` (mục 4), và `files/` nếu cần lệnh/prompt/agent riêng.
3. Viết `adapters/<client>/INSTALL.md`: build, cài/gỡ mức project và user, cách gọi, bảng tham số, cập nhật.
4. Chạy:
   ```bash
   npm run build -- --client <client>
   npm run check
   node scripts/install.mjs --client <client> --target project --path <dự-án-mẫu>
   ```
5. Chạy agent trên một dự án trong `examples/` với `mode=confirm` và `mode=auto`, chấm theo `examples/EVALUATION.md`, ghi kết quả vào `examples/results/<client>-<stack>.md`.
6. Nếu `npm run check` báo lỗi "client-specific term" trong `core/`, nghĩa là đã sửa nhầm lõi: chuyển phần đó vào adapter.
