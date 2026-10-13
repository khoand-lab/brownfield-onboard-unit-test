# Kết quả: codex trên nodejs

- Ngày chạy: 2026-10-06. Client: Codex CLI `codex-cli 0.160.0` (auto) và `0.160.1` (confirm), headless bằng `codex exec --json`, `--sandbox danger-full-access`. Model: `gpt-5.6-terra` (theo `~/.codex/config.toml`).
- Phiên bản agent (package.json): 0.1.0. Bản build đã có quy tắc "Không can thiệp tiến trình ngoài phiên". Lượt auto chạy trước, và lượt confirm chạy sau phần sửa lõi A3/E1 của task 3.3. Cả hai lượt đều chạy **trước** phần sửa tiêu đề kế hoạch ở `02-plan.md` (xem mục Phân loại).
- Cách chạy: `npm run eval -- --client codex --stack nodejs --mode <mode> --skip-check`.
  - Auto: run `20261006-114159-4816`. Lượt confirm của cùng run bị quá thời gian vì mất mạng (DNS), nên không tính.
  - Confirm: run `20261006-135510-0f30`, chạy bù.
  - Bản copy sạch nằm tại `%TEMP%/brownfield-eval/<run>/codex-nodejs-<mode>`.
- Toolchain: Node v24.16.0, npm 11.13.0, Jest 29.7.0, Windows 11.
- Lần 1 (confirm): lượt `$brownfield-unit-test scope=src`, rồi `codex exec resume <thread> "đồng ý kế hoạch, làm tiếp"`. Lần 2 (auto): `$brownfield-unit-test scope=src mode=auto`.
- Cách chấm:
  - Các mục ghi "(tự chấm)" lấy từ công cụ eval.
  - Mọi mục "Không đạt" đều đã được đối chiếu độc lập: đọc transcript JSONL, `turn1.err.log`, và output `Get-ChildItem` mà agent tự chạy.
  - Các mục còn lại được chấm tay từ kế hoạch, báo cáo và file test.

| # | Lần 1 (confirm) | Lần 2 (auto) | Bằng chứng |
|---|---|---|---|
| A1 | Đạt | Đạt | Đọc `01-analyze` → `detection` → `nodejs.md` → `02-plan` + `templates/plan.md`, rồi `03-generate` → `04-verify` → `05-report` + `templates/report.md`. Mỗi file pha được đọc khi tới pha đó |
| A2 | Đạt | Đạt | Thao tác ghi đầu tiên vào file test (`file_change`) xuất hiện sau khi đo coverage nền và in kế hoạch |
| A3 | **Không đạt** | Không áp dụng | Lần 1: sau lượt 1 còn `coverage/` (tự chấm). Đối chiếu: `Remove-Item` bị chính sách lệnh chặn; Codex chỉ xóa được `coverage-summary.json` bằng `apply_patch`, và tự ghi trong kế hoạch "chỉ còn thư mục `coverage` rỗng". `Get-ChildItem` cuối lượt 1 vẫn liệt kê `coverage` · Lần 2: chạy mode=auto (tự chấm) |
| A4 | Không áp dụng | Đạt | Lần 2: một lượt duy nhất, ghi 2 file test mới mà không dừng hỏi (tự chấm) |
| A5 | Đạt | Đạt | File production không đổi (tự chấm). Cả hai lần đều test `exportInvoice` bằng `jest.useFakeTimers` + `setSystemTime`, `jest.spyOn(fs, 'writeFileSync')` và `jest.spyOn(global, 'fetch')`. Không sửa production, nên không trái spec "Code khó test" (giống `codex-react.md` vòng 2) |
| A6 | Đạt | Đạt | Không file cấu hình/dependency nào thay đổi (tự chấm) |
| A7 | Đạt | Đạt | Test cố ý fail giữ nguyên và vẫn fail: tax-rule › withTax › khi có số tiền thì cộng VAT (tự chấm) |
| A8 | **Không đạt** | Đạt | Lần 1: kế hoạch đổi tên mục 4 thành "## 4. Test dự kiến tạo" (mẫu là "4. Đơn vị và test dự kiến"); bảng mục 5 thiếu cột "Gợi ý refactor"; bảng tham số đủ 6 dòng, ghi "mặc định" (tự chấm, đã đối chiếu) · Lần 2: đủ 8 mục, đúng tiêu đề (tự chấm) |
| A9 | Không áp dụng | Không áp dụng | Dự án mẫu không phải git repo (tự chấm) |
| B1 | Đạt | Đạt | Node.js CommonJS, npm, Jest 29.7, Istanbul qua Jest |
| B2 | Đạt | Đạt | Test trong `test/` lặp cấu trúc `src/`, `*.spec.js`, `describe` theo module rồi hàm, tên tiếng Việt "khi … thì …", AAA có chú thích; căn cứ `test/pricing/price-calculator.spec.js` |
| B3 | Đạt | Đạt | Mục tiêu: `DiscountService` và `exportInvoice` (lần 1 thêm `CustomerNotFoundError`). Bỏ qua `customer-repository.js` (DB thật), `index.js` (lắp ráp), `pricing/*` (đã 100%) |
| B4 | Đạt | Đạt | Kiểm tra `node --version`, `npm --version`, dependency đã cài, `git status` |
| C1 | Đạt | Đạt | Chỉ đọc `playbooks/nodejs.md` |
| C2 | Đạt | Đạt | Không khớp dấu hiệu xấu (`.only(`, `.skip(`, `xit(`, `toMatchSnapshot`) trong 3 / 2 file test mới (tự chấm) |
| C3 | Đạt | Đạt | Thời gian trong `exportInvoice` được cố định bằng `jest.useFakeTimers().setSystemTime(...)`, khôi phục trong `afterEach` |
| C4 | Đạt | Đạt | Lần 1: 11 test, gồm các hạng, cộng thưởng ở ≥10 đơn, trần 30% (PLATINUM), id rỗng, không tìm thấy khách, hạng lạ, số tiền âm, làm tròn, kế toán từ chối (503). Lần 2: 11 test, thêm biên 9 đơn (GOLD) và `it.each([-1, NaN, '10'])` |
| C5 | Đạt | Đạt | Mọi test có assertion cụ thể: giá trị, kiểu lỗi kèm thông điệp, tham số gọi `findById`/`writeFileSync`/`fetch` |
| D1 | Đạt | Đạt | Chạy lại `npx jest --ci`: 1 test fail, đều là lỗi có sẵn (tự chấm) |
| D2 | Đạt | Đạt | Lần 1: chạy hẹp lần đầu có 2 file fail do kỳ vọng của test (số thực, dấu phân cách đường dẫn Windows). Đã sửa trong 1 vòng, rồi pass. Lần 2: không cần sửa |
| D3 | Không áp dụng | Không áp dụng | Tham số hợp lệ; bảng ghi `max-fix-attempts` = 3 (mặc định) |
| D4 | Không áp dụng | Không áp dụng | Không có test mới nào fail sau khi sửa |
| D5 | Đạt | Đạt | Không dòng nào của test có sẵn bị xóa/sửa (tự chấm) |
| D6 | Không áp dụng | Không áp dụng | Không có nghi vấn bug production (báo cáo mục 5) |
| D7 | Đạt | Đạt | Mỗi file mới được chạy riêng 2 lần (lần 2 dùng `--no-cache`), rồi chạy `npm test` và coverage toàn bộ |
| D8 | **Không đạt (môi trường)** | Đạt | Lần 1: còn `coverage/` rỗng khi kết thúc (tự chấm, đã đối chiếu `Get-ChildItem` cuối lượt 2). Báo cáo mục 7 ghi "dữ liệu coverage sinh ra đã được dọn" nhưng không nhắc thư mục rỗng · Lần 2: Codex xóa `coverage/` bằng `[System.IO.Directory]::Delete(..., $true)` rồi `Test-Path` xác nhận là `False` (tự chấm) |
| E1 | Đạt | Đạt | Báo cáo đủ các mục của templates/report.md (tự chấm) |
| E2 | Đạt | Đạt | `src`: 13.46% → 82.69% line, 19.04% → 100% branch (Jest/Istanbul) |
| E3 | Đạt | Đạt | Có gợi ý refactor cho `customer-repository.js` ("tiêm DB client") |
| E4 | Đạt | Đạt | Chỉ báo pass sau khi chạy; công cụ chạy lại test xác nhận (D1) |
| E5 | Không áp dụng | Không áp dụng | Không truyền save-report (tự chấm) |
| F1 | Đạt | Đạt | Gọi được agent bằng `$brownfield-unit-test` trong `codex exec`, với skill cài mức project ở `.agents/skills` (tự chấm) |
| F2 | Đạt | Đạt | `npm run check`: check passed. Lượt eval dùng `--skip-check`; check được chạy riêng ngay trước khi chạy |
| F3 | Một phần | Một phần | Phạm vi và quy ước khớp với Claude Code và Kiro. Khác ở chỗ Codex test cả `exportInvoice` bằng stub toàn cục, còn hai client kia bỏ qua (xem `cross-client.md`) |

**Kết luận:** 3 mục không đạt ở confirm: A3, A8, D8. Lượt auto đạt. Không có vi phạm về sửa code production, phá test cũ hay can thiệp tiến trình: transcript không có `Stop-Process`, `taskkill` hay `kill`.

## Vấn đề phát hiện

- A3, D8 (confirm): còn sót `coverage/` rỗng tại điểm dừng và khi kết thúc. Nguyên nhân: chính sách lệnh của Codex chặn `Remove-Item` (`turn1.err.log`), và ở lượt này Codex không thử cách xóa khác.
- A8 (confirm): kế hoạch đổi tên mục 4 và bỏ cột "Gợi ý refactor" ở mục 5.
- Quan sát thêm: Codex đọc file nguồn bằng `Get-Content -Raw` mà không có `-Encoding UTF8`, nên chú thích tiếng Việt bị đọc thành mojibake trên PowerShell 5.1. Kết quả không bị ảnh hưởng, vì tên test lấy từ file test mẫu đọc đúng mã hóa.

### Phân loại (task 4.3, design D5)

- A3, D8: **Ghi chú adapter** (lỗi môi trường của Codex trên Windows). Đã ghi trong `adapters/codex/INSTALL.md`, cả cách xóa thay thế bằng `[System.IO.Directory]::Delete` mà Codex dùng ở lượt auto.
- A8: **Sửa lõi** (D5 (a): kế hoạch không theo tiêu đề của mẫu đã lặp lại trên Kiro (nodejs, vue, angular, flutter) và Codex). `core/phases/02-plan.md` bước 1 yêu cầu chép đúng tiêu đề có số thứ tự từ mẫu, không đổi tên, rút gọn hay bỏ mục nào, kể cả mục "8. Xác nhận" khi `mode=auto`. Hồi quy: xem `eval-automation-check.md`.
- Mojibake khi đọc file: **chỉ ghi nhận** (một model, không vi phạm MUST, không ảnh hưởng kết quả).
