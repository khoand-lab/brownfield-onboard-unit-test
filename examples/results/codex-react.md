# Kết quả: codex trên react

- Ngày chạy: 2026-10-04 (vòng 1) và 2026-10-05 (vòng 2, sau khi sửa lõi). Client: Codex CLI `codex-cli 0.154.0`, chạy headless bằng `codex exec`. Model: `gpt-5.6-terra`, reasoning `high` (theo `~/.codex/config.toml`).
- Phiên bản agent (package.json): 0.1.0
- Cài đặt: `install.mjs --client codex --target project`, skill được đặt tại `.agents/skills/brownfield-unit-test/`. Mỗi vòng chạy trên một bản copy sạch của `examples/react`, đã có `node_modules`. Toolchain: Node v24.16.0, Vitest 5.0.2, Windows 11.
- Lệnh gọi (auto): `codex exec --skip-git-repo-check --sandbox workspace-write --json '$brownfield-unit-test scope=src coverage-target=80 mode=auto'`
- Chỉ chạy `mode=auto`. Ở chế độ confirm, Codex đã dừng đúng sau kế hoạch trong lượt chạy Java (xem `codex-java-spring-boot.md`).
- Kiểm chứng độc lập:
  - So sha256 trước và sau (không tính `node_modules`, `.agents`, `coverage`).
  - Tự chạy `npx vitest run --coverage.enabled --coverage.reporter=text-summary --coverage.reportOnFailure --coverage.include='src/**'`.
  - Grep test mới: không có snapshot, `jest-dom`, `toBeInTheDocument`, `.only(`, `.skip(`.
  - Đọc event `--json` để lấy thứ tự lệnh.

## Kết quả chạy

| | Vòng 1 | Vòng 2 |
|---|---|---|
| Test mới | 22, cùng 3 case thêm vào `price-calculator.test.ts` | 25, trong 7 file mới |
| Tự chạy lại | `1 failed \| 24 passed (25)` | `1 failed \| 25 passed (26)` |
| Coverage `src/**` (statements / lines) | 75.71% / 76.47% | 94.28% / 97.05% |
| Test fail | Chỉ `tax-rule` có sẵn | Chỉ `tax-rule` có sẵn |

| # | Vòng 1 | Vòng 2 | Bằng chứng |
|---|---|---|---|
| A1 | Đạt | Đạt | Đọc lần lượt `01-analyze` → `detection` → `react.md` → `02-plan` → `03-generate` → `04-verify` → `05-report`. Codex chỉ đọc file pha khi tới pha đó |
| A2 | Đạt | Đạt | Thay đổi file đầu tiên xuất hiện sau khi đo coverage "trước" và in kế hoạch |
| A4 | Đạt | Đạt | In kế hoạch xong là làm tiếp ngay |
| A5 | Đạt | Đạt | Hash file production không đổi. Vòng 1 đưa `exportInvoice.ts` vào danh sách bỏ qua. Vòng 2 viết test cho nó bằng `vi.useFakeTimers`, `vi.stubGlobal('URL'/'fetch')` và `localStorage` của jsdom, tức là test được mà không cần refactor, nên không trái spec "Code khó test". Đây là điểm khác với Claude Code và Kiro (xem F3) |
| A6 | Đạt | Đạt | Không thêm dependency |
| A7 | Đạt | Đạt | `tax-rule.test.ts` giữ nguyên hash; được báo là lỗi có sẵn |
| A8 | Đạt | Đạt | Bảng tham số có ghi "(mặc định)" |
| B1 | Đạt | Đạt | React 19, Vite, Vitest 5, jsdom, RTL, user-event |
| B2 | Đạt | Đạt | Test đặt trong `__tests__`, import từ `vitest`, tên "khi … thì …", có `// arrange/act/assert` |
| B3 | Đạt | Đạt | Bỏ qua `main.tsx` và `customer.ts`. Vòng 2 có test cho `App.tsx` (1 case) |
| B4 | Đạt | Đạt | Kiểm tra Node và npm |
| C1 | Đạt | Đạt | Chỉ đọc `playbooks/react.md` |
| C2 | Đạt | Đạt | Mock module API, stub `fetch` |
| C3 | Không áp dụng | Đạt | Vòng 2 cố định thời gian bằng `vi.setSystemTime` khi test `exportInvoice` |
| C4 | Đạt | Đạt | Có các hạng, biên, trần 30%, các nhánh lỗi |
| C5 | Đạt | Đạt | Mọi test đều có assertion có ý nghĩa |
| D1 | Đạt | Đạt | Chạy từng file test, sau đó chạy toàn bộ |
| D2 | Đạt | Đạt | Vòng 1 tự sửa 2 lỗi kiểu do `tsc` phát hiện; vòng 2 sửa 2 file. Đều trong giới hạn |
| D5 | Đạt | Đạt | Vòng 1 thêm 3 case vào `price-calculator.test.ts`, không xóa dòng cũ nào. Vòng 2 không đụng test có sẵn |
| D7 | Đạt | Đạt | Chạy lại mỗi file mới |
| D8 | Đạt | **Không đạt (môi trường)** | Vòng 2 để lại `coverage/` vì chính sách lệnh của Codex trên Windows chặn `Remove-Item`. Agent ghi rõ trong báo cáo mục 7. Đã thêm ghi chú vào `adapters/codex/INSTALL.md` |
| E1 | **Không đạt** | **Đạt** | Vòng 1 kết thúc bằng một đoạn tóm tắt 5 dòng, không theo `templates/report.md`, và kế hoạch cũng không theo mẫu. Vòng 2, sau khi sửa lõi, kế hoạch và báo cáo có đủ 8 mục theo đúng tên |
| E2 | Đạt | Đạt | Có số liệu coverage trước và sau |
| E3 | Đạt | Không áp dụng | Vòng 2 không còn đơn vị khó test |
| E4 | Đạt | Đạt | Chỉ báo pass sau khi đã chạy |
| F1 | Đạt | Đạt | Gọi bằng `$brownfield-unit-test` trong `codex exec`; skill project được nạp từ `.agents/skills` |
| F2 | Đạt | Đạt | `npm run check` pass |
| F3 | Đạt | Một phần | Vòng 1 khớp với Claude Code và Kiro. Vòng 2 khác ở chỗ test cả `exportInvoice` và `App`. Xem `cross-client.md` |

Các mục A3, A9, D3, D4, D6, E5 không áp dụng.

## Vấn đề phát hiện và việc đã sửa

1. **Báo cáo bị rút gọn** (E1, vòng 1). Codex có xu hướng kết thúc bằng một câu trả lời ngắn. Đã sửa: `core/phases/05-report.md` và `02-plan.md` yêu cầu hiển thị toàn văn theo mẫu, kể cả khi client khuyến khích trả lời ngắn. Vòng 2 xác nhận đã có hiệu lực.
2. **Codex trên Windows:** chính sách lệnh chặn `Remove-Item` (kể cả `danger-full-access`); sandbox `workspace-write` chặn Maven đọc `~/.m2`. Đã ghi vào `adapters/codex/INSTALL.md`.
3. **Ranh giới "khó test" phụ thuộc vào model.** Với JS/jsdom, global có thể stub được, nên quyết định test hay bỏ qua `exportInvoice` đều hợp lệ theo spec. README của ví dụ đang ghi agent "nên" bỏ qua; đây là kỳ vọng mềm, không phải yêu cầu.
