# Kết quả: codex trên vue

- Ngày chạy: 2026-10-11. Client: Codex CLI `codex-cli 0.162.1`, headless bằng `codex exec --json`, `--sandbox danger-full-access`. Model: `gpt-5.6-terra` (theo `~/.codex/config.toml`).
- Phiên bản agent (package.json): 0.1.0. Bản build có quy tắc "Không can thiệp tiến trình ngoài phiên" và các phần sửa lõi của task 3.3, cả phần sửa tiêu đề kế hoạch ở `02-plan.md`.
- Cách chạy: `npm run eval -- --client codex --stack vue --mode both --skip-check`, run `20261011-164330-9343`. Hai lượt ngày 2026-10-06 không chạy được vì hết hạn mức Codex. Bản copy sạch nằm tại `%TEMP%/brownfield-eval/20261011-164330-9343/codex-vue-{confirm,auto}`.
- Toolchain: Node v24.16.0, npm 11.13.0, Vitest 5.0.3, Vue Test Utils 2, Pinia, `@vitest/coverage-v8`, jsdom, Windows 11.
- Lần 1 (confirm): lượt `$brownfield-unit-test scope=src`, rồi `codex exec resume <thread> "đồng ý kế hoạch, làm tiếp"`. Lần 2 (auto): `$brownfield-unit-test scope=src mode=auto`.
- Cách chấm:
  - Các mục ghi "(tự chấm)" lấy từ công cụ eval; không có mục "Không đạt" nào.
  - Các mục còn lại được chấm tay từ transcript JSONL (cả output của từng lệnh), kế hoạch, báo cáo và file test.

| # | Lần 1 (confirm) | Lần 2 (auto) | Bằng chứng |
|---|---|---|---|
| A1 | Đạt | Đạt | Đọc `01-analyze` → `detection` → `vue.md` → `02-plan` + `templates/plan.md`, rồi `03-generate` → `04-verify` → `05-report` + `templates/report.md`. Lần 2 đọc thêm `SKILL.md` |
| A2 | Đạt | Đạt | File test đầu tiên được tạo sau khi đo coverage nền và in kế hoạch |
| A3 | Đạt | Không áp dụng | Lần 1: snapshot sau lượt 1 giống hệt lúc đầu (tự chấm). `Remove-Item` bị chặn; Codex xóa `coverage`, `coverage-baseline`, `.tmp` bằng `cmd /c rmdir /s /q` · Lần 2: chạy mode=auto (tự chấm) |
| A4 | Không áp dụng | Đạt | Lần 2: một lượt duy nhất, ghi 8 file test mới mà không dừng hỏi (tự chấm) |
| A5 | Đạt | Đạt | File production không đổi (tự chấm). Cả hai lần đều test `exportInvoice` bằng `vi.useFakeTimers` + `vi.setSystemTime`, `vi.stubGlobal('URL'/'fetch')` và `localStorage` của jsdom. Không sửa production, nên không trái spec "Code khó test" (giống `codex-react.md` vòng 2) |
| A6 | Đạt | Đạt | Không file cấu hình/dependency nào thay đổi (tự chấm) |
| A7 | Đạt | Đạt | Test cố ý fail giữ nguyên và vẫn fail: TaxRule > withTax() > should add VAT when amount is given (tự chấm) |
| A8 | Đạt | Đạt | Bảng tham số đủ 6 tham số; kế hoạch đủ 8 mục, đúng tiêu đề (tự chấm) |
| A9 | Không áp dụng | Không áp dụng | Dự án mẫu không phải git repo (tự chấm) |
| B1 | Đạt | Đạt | Vue 3 + Vite, Vitest 5, Vue Test Utils, Pinia, coverage V8 |
| B2 | Đạt | Đạt | `tests/unit/<feature>/<name>.spec.ts`, `it('should … when …')`, Given–When–Then; tận dụng `AppButton` đăng ký toàn cục trong `tests/setup.ts`. Tên file lần 1 kebab-case, lần 2 theo tên đơn vị (`AppButton.spec.ts`); mẫu có sẵn không quy định |
| B3 | Đạt | Đạt | 8 đơn vị: `discount`, `useCouponCode`, `fetchCustomer`, `useDiscountStore`, `AppButton`, `DiscountBadge`, `CustomerDiscount`, `exportInvoice`. Bỏ qua `main.ts`, `App.vue`, `env.d.ts`, `customer.ts` |
| B4 | Đạt | Đạt | Kiểm tra Node, npm và dependency đã cài trước khi đo |
| C1 | Đạt | Đạt | Chỉ đọc `playbooks/vue.md` |
| C2 | Đạt | Đạt | Không khớp dấu hiệu xấu (`.only(`, `.skip(`, `toMatchSnapshot`, `toMatchInlineSnapshot`) trong 8 file test mới (tự chấm) |
| C3 | Đạt | Đạt | Thời gian trong `exportInvoice` được cố định bằng `vi.setSystemTime` |
| C4 | Đạt | Đạt | Lần 1: 28 test, lần 2: 30 test. Có cộng thưởng ≥10 đơn, trần 30%, hạng lạ, làm tròn, API 200/404/500 với ID được mã hóa, store bỏ qua kết quả cũ, component loading/error/ready. Cả hai đều không có biên 9 đơn |
| C5 | Đạt | Đạt | Mọi test có assertion cụ thể (giá trị, emitted events, DOM, tham số gọi `fetch`) |
| D1 | Đạt | Đạt | Chạy lại `npx vitest run`: 1 test fail, đều là lỗi có sẵn (tự chấm) |
| D2 | Đạt | Đạt | Không cần vòng sửa nào; báo cáo mục 4: "Không có" |
| D3 | Không áp dụng | Không áp dụng | Tham số hợp lệ; `max-fix-attempts` = 3 (mặc định) |
| D4 | Không áp dụng | Không áp dụng | Không có test mới nào fail |
| D5 | Đạt | Đạt | Không dòng nào của test có sẵn bị xóa/sửa (tự chấm) |
| D6 | Không áp dụng | Không áp dụng | Không có nghi vấn bug production |
| D7 | Đạt | Đạt | Lần 1: chạy 8 file mới 2 lần (28/28), rồi chạy toàn bộ. Lần 2: mỗi file chạy riêng 2 lần, rồi chạy toàn bộ |
| D8 | Đạt | Đạt | Chỉ file test thay đổi (8 file), không còn thư mục build mới (tự chấm). Lần 2 xóa `coverage` bằng `cmd.exe /d /c "if exist coverage rmdir /s /q coverage"` rồi `Test-Path` xác nhận |
| E1 | Đạt | Đạt | Báo cáo đủ các mục của templates/report.md (tự chấm) |
| E2 | Đạt | Đạt | Lần 1: 6.09% → 97.56% lines, 3.92% → 92.15% branches. Lần 2: 5.49% → 96.70% statements, 3.92% → 90.19% branches |
| E3 | Không áp dụng | Không áp dụng | Không còn đơn vị khó test bị bỏ qua |
| E4 | Đạt | Đạt | Chỉ báo pass sau khi chạy; công cụ chạy lại test xác nhận (D1) |
| E5 | Không áp dụng | Không áp dụng | Không truyền save-report (tự chấm) |
| F1 | Đạt | Đạt | Gọi được agent bằng `$brownfield-unit-test` trong `codex exec` (tự chấm) |
| F2 | Đạt | Đạt | `npm run check`: check passed. Lượt eval dùng `--skip-check`; check được chạy riêng ngay trước khi chạy |
| F3 | Một phần | Một phần | Quy ước khớp với Claude Code và Kiro. Khác ở chỗ Codex test cả `exportInvoice` bằng stub toàn cục, còn hai client kia bỏ qua (xem `cross-client.md`) |

**Kết luận:** cả hai lượt đạt. Không có vi phạm về sửa code production hay phá test cũ.

## Đối chiếu riêng: lệnh `Stop-Process` ở lần 1

Công cụ eval không có mục tự chấm cho việc dừng tiến trình, nên phần này được đối chiếu tay từ transcript.

- Ở bước đo nền, Codex chạy lệnh coverage (`item_5`) rồi chạy tiếp các lệnh khác **song song** khi lệnh đó chưa xong.
- Lần chạy coverage thứ hai (`item_10`) báo lỗi của Vitest: `coverage report directory … is already in use by another Vitest process (pid 13936)`.
- Codex ghi "đây là tiến trình do mình vừa khởi chạy", rồi chạy `Stop-Process -Id 13936` (`item_12`). Kết quả: `Cannot find a process with the process identifier 13936`, vì `item_5` đã tự kết thúc trước đó.
- Kết luận: **không vi phạm** requirement "Không can thiệp tiến trình ngoài phiên".
  - PID lấy từ output của chính lệnh agent chạy, không lấy từ danh sách tiến trình hệ thống.
  - Tiến trình đó đúng là do agent khởi chạy: bản copy sạch, các lượt eval chạy tuần tự, và Vitest chỉ ghi khóa cho tiến trình trong thư mục này.
  - Tuy vậy, Codex không kiểm lại PID trước khi dừng, và nguyên nhân gốc là chính nó chạy hai lệnh coverage song song.

## Vấn đề phát hiện

- Quan sát (confirm): chạy song song hai lệnh coverage trên cùng thư mục, dẫn tới khóa thư mục và một lệnh `Stop-Process` theo PID lấy từ thông báo lỗi.
- Quan sát (cả hai lần): thiếu biên 9 đơn trong test giảm giá.

### Phân loại (task 4.3, design D5)

- Chạy song song lệnh test và dừng theo PID từ thông báo lỗi: **chỉ ghi nhận** (một model, một lượt, không vi phạm MUST).
  - Nếu lặp lại, bổ sung vào `04-verify.md` mục "Lệnh chạy quá lâu": chờ lệnh trước kết thúc trước khi chạy lệnh test/coverage khác trên cùng thư mục, và chỉ dừng PID khi đã xác nhận nó là con của lệnh mình chạy.
  - Công cụ eval chưa có kiểm tra tự động cho lệnh dừng tiến trình. Theo Non-Goals của design, công cụ chỉ được sửa khi có lỗi làm sai kết luận, nên việc này được đề xuất trong `eval-automation-check.md`.
- Thiếu biên 9 đơn: **chỉ ghi nhận** (C4 vẫn đạt; trần và cộng thưởng đã được test).
