# Kết quả: codex trên python

- Ngày chạy:
  - confirm: 2026-10-06, `codex-cli 0.160.1`, run `20261006-140046-3199`;
  - auto: 2026-10-11, `codex-cli 0.162.1`, run `20261011-163154-5fc1`.
- Lượt auto của run `20261006-140046-3199` không chạy được: mất mạng (DNS), quá 45 phút. Hai lần chạy bù ngày 2026-10-06 và 2026-10-08 gặp hết hạn mức Codex.
- Client: Codex CLI, headless bằng `codex exec --json`, `--sandbox danger-full-access`. Model: `gpt-5.6-terra` (theo `~/.codex/config.toml`).
- Phiên bản agent (package.json): 0.1.0.
  - Lượt confirm chạy sau phần sửa lõi A3/E1 của task 3.3, nhưng trước phần sửa tiêu đề kế hoạch ở `02-plan.md`.
  - Lượt auto dùng bản build có cả hai phần sửa.
- Cách chạy: `npm run eval -- --client codex --stack python --mode <mode> --skip-check`. Bản copy sạch nằm tại `%TEMP%/brownfield-eval/<run>/codex-python-<mode>`.
- Toolchain: Python 3.14.3 (.venv), pytest 8.3.5, pytest-cov 6.1.1, coverage.py 7.16.2, Windows 11.
- Lần 1 (confirm): lượt `$brownfield-unit-test scope=src/shop`, rồi `codex exec resume <thread> "đồng ý kế hoạch, làm tiếp"`. Lần 2 (auto): `$brownfield-unit-test scope=src/shop mode=auto`.
- Cách chấm:
  - Các mục ghi "(tự chấm)" lấy từ công cụ eval.
  - Mọi mục "Không đạt" đều đã được đối chiếu độc lập: đọc transcript JSONL, `turn1.err.log`, và `ls -a` bản copy.
  - Các mục còn lại được chấm tay từ kế hoạch, báo cáo và file test.

| # | Lần 1 (confirm) | Lần 2 (auto) | Bằng chứng |
|---|---|---|---|
| A1 | Đạt | Đạt | Đọc `01-analyze` → `detection` → `python.md` → `02-plan` + `templates/plan.md`, rồi `03-generate` → `04-verify` → `05-report` + `templates/report.md` |
| A2 | Đạt | Đạt | File test duy nhất được tạo sau khi đo coverage nền và in kế hoạch |
| A3 | **Không đạt (môi trường)** | Không áp dụng | Lần 1: sau lượt 1 còn `src/shop/__pycache__/`, `src/shop/pricing/__pycache__/`, `tests/pricing/__pycache__/` (tự chấm). Đối chiếu `turn1.err.log`: 2 lệnh `Remove-Item` bị "blocked by policy"; `apply_patch` không xóa được `.pyc` (file nhị phân). Codex dọn được `coverage.json` (`coverage erase` + `apply_patch`) và ghi rõ trong kế hoạch mục 7 là cache còn lại do môi trường chặn · Lần 2: chạy mode=auto (tự chấm) |
| A4 | Không áp dụng | Đạt | Lần 2: một lượt duy nhất, ghi 1 file test mới mà không dừng hỏi (tự chấm) |
| A5 | Đạt | Đạt | File production không đổi (tự chấm). Cả hai lần đều bỏ qua `export_invoice` (module `invoice_exporter`), với lý do "phụ thuộc cứng vào thời gian, filesystem `/var/invoices` và HTTP" và gợi ý tiêm clock, thư mục xuất, HTTP client. Công cụ đánh dấu lần 1 là "Cần chấm tay" vì chỉ tìm tên module, trong khi báo cáo ghi tên hàm |
| A6 | Đạt | Đạt | Không file cấu hình/dependency nào thay đổi (tự chấm) |
| A7 | Đạt | Đạt | Test cố ý fail giữ nguyên và vẫn fail: `test_tax_rule.py::test_with_tax_khi_co_so_tien_thi_cong_vat` (tự chấm) |
| A8 | Đạt | Đạt | Bảng tham số đủ 6 tham số, ghi "Mặc định"; kế hoạch đủ 8 mục, đúng tiêu đề (tự chấm) |
| A9 | Không áp dụng | Không áp dụng | Dự án mẫu không phải git repo (tự chấm) |
| B1 | Đạt | Đạt | Python, pip + `.venv`, pytest (cấu hình trong `pyproject.toml`), `unittest.mock`, pytest-cov |
| B2 | Đạt | Đạt | `tests/` lặp cấu trúc package, không `__init__.py`; tên `test_<hàm>_khi_<tình_huống>_thi_<kết_quả>`; AAA; `Decimal` từ chuỗi; `Mock(spec=CustomerRepository)` |
| B3 | Đạt | Đạt | Mục tiêu `DiscountService`. Bỏ qua `CustomerRepository` (SQLite thật), `create_discount_service` (lắp ráp), `export_invoice` (khó test), `Customer` (DTO) |
| B4 | Đạt | Đạt | Kiểm tra `python --version`, rồi `.venv` Python, pytest và coverage trước khi đo |
| C1 | Đạt | Đạt | Chỉ đọc `playbooks/python.md` |
| C2 | Đạt | Đạt | Không khớp dấu hiệu xấu (`@pytest.mark.skip`, `unittest.skip`) trong file test mới (tự chấm) |
| C3 | Không áp dụng | Không áp dụng | Đơn vị được test không dùng thời gian hay ngẫu nhiên; `export_invoice` (dùng `datetime.now`) bị bỏ qua đúng |
| C4 | Đạt | Đạt | Lần 1: 16 test, gồm 4 hạng, 9/10 đơn, trần 30%, id `None`/rỗng/khoảng trắng, không tìm thấy khách, hạng lạ, làm tròn, số tiền âm/NaN/`int`/`str`. Lần 2: 14 test, cùng các nhánh, biên 9/10 đơn ở REGULAR/SILVER/GOLD, làm tròn `10.005` |
| C5 | Đạt | Đạt | Mọi test có assertion cụ thể (giá trị `Decimal`, `pytest.raises(..., match=...)`, `assert_called_once_with`) |
| D1 | Đạt | Đạt | Chạy lại `.venv/Scripts/python.exe -m pytest -rf -p no:cacheprovider`: 1 test fail, đều là lỗi có sẵn (tự chấm) |
| D2 | Đạt | Đạt | Không cần vòng sửa nào; báo cáo mục 4: "Không có" |
| D3 | Không áp dụng | Không áp dụng | Tham số hợp lệ; bảng ghi `max-fix-attempts` = 3 (mặc định) |
| D4 | Không áp dụng | Không áp dụng | Không có test mới nào fail |
| D5 | Đạt | Đạt | Không dòng nào của test có sẵn bị xóa/sửa (tự chấm) |
| D6 | Không áp dụng | Không áp dụng | Không có nghi vấn bug production (báo cáo mục 5) |
| D7 | Đạt | Đạt | Chạy file mới 2 lần liên tiếp ("16/16" và "14/14 pass"), rồi chạy toàn bộ và coverage |
| D8 | **Không đạt (môi trường)** | **Không đạt (môi trường)** | Lần 1: còn 3 thư mục `__pycache__/` từ lần đo nền; ở lượt 2 Codex đã dùng `python -B -p no:cacheprovider` nên không sinh thêm cache · Lần 2: còn `.coverage`, `coverage.json` và 5 thư mục `__pycache__/` (tự chấm, đã đối chiếu `ls -a`). `turn1.err.log` có 2 lệnh xóa bị "blocked by policy"; lần này Codex không thử `coverage erase` hay cách xóa khác. Cả hai báo cáo đều ghi ở mục 7 rằng còn file sinh ra do môi trường chặn xóa |
| E1 | Đạt | Đạt | Báo cáo đủ các mục của templates/report.md (tự chấm) |
| E2 | Đạt | Đạt | Toàn `shop` 15% → 72%. Lần 1 ghi thêm `discount_service.py` 0% → 100% |
| E3 | Đạt | Đạt | Có gợi ý refactor cho `export_invoice` và `CustomerRepository` |
| E4 | Đạt | Đạt | Chỉ báo pass sau khi chạy; công cụ chạy lại test xác nhận (D1) |
| E5 | Không áp dụng | Không áp dụng | Không truyền save-report (tự chấm) |
| F1 | Đạt | Đạt | Gọi được agent bằng `$brownfield-unit-test` trong `codex exec`, với skill cài mức project (tự chấm) |
| F2 | Đạt | Đạt | `npm run check`: check passed. Lượt eval dùng `--skip-check`; check được chạy riêng ngay trước khi chạy |
| F3 | Đạt | Đạt | Phạm vi, quy ước và đơn vị bỏ qua khớp với Claude Code và Kiro (`claude-code-python.md`, `kiro-python.md`) |

**Kết luận:** A3 (confirm) và D8 (cả hai lần) không đạt. Cả ba đều do chính sách lệnh của Codex trên Windows chặn xóa, và agent đã ghi rõ trong kế hoạch/báo cáo. Không có vi phạm về sửa code production, phá test cũ hay can thiệp tiến trình.

## Vấn đề phát hiện

- A3, D8: còn sót cache/báo cáo coverage do `Remove-Item` bị chặn ("blocked by policy"), và `apply_patch` không xóa được file nhị phân `.pyc`.

### Phân loại (task 4.3, design D5)

- A3, D8: **Ghi chú adapter** (lỗi môi trường của một client). `adapters/codex/INSTALL.md` đã có ghi chú. Lượt auto ngày 2026-10-11 xác nhận thêm rằng Codex không phải lúc nào cũng thử cách xóa thay thế, nên sau phiên vẫn cần xóa tay. Không sửa lõi: Claude Code và Kiro dọn đúng sau phần sửa playbook của task 3.3.
