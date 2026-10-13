# Kết quả: claude-code trên python

- Ngày chạy: 2026-09-30. Client: Claude Code, chạy headless (`claude -p`). Model: `cc/claude-opus-5-5`.
- Phiên bản agent (package.json): 0.1.0
- Cài đặt: cách A (dạng rời, mức project) vào hai bản copy sạch của `examples/python`. Trên mỗi bản copy, tạo `.venv` và cài `requirements-dev.txt`. Toolchain: Python 3.14.3, pytest, pytest-cov 6.1.1 (coverage 7.16.2), Windows 11.
- Lệnh gọi lần 1 (confirm), ba lượt trên cùng session:
  1. `claude -p "/unit-test scope=src coverage-target=80" --session-id <uuid> ...`
  2. `claude -p "đồng ý kế hoạch, làm tiếp" --resume <uuid> ...`
  3. `claude -p "1 — đã cấp quyền chạy pytest, làm tiếp pha 4 và 5" --resume <uuid> ...`. Lượt này cần vì allowlist ở lượt 2 thiếu mẫu cho tool PowerShell (xem vấn đề 1).
- Lệnh gọi lần 2 (auto): `claude -p "/unit-test scope=src coverage-target=80 mode=auto max-fix-attempts=20" ...`
- Tham số chung:
  - `--permission-mode acceptEdits`, `--max-turns 80`–`120`;
  - allowedTools: Read, Write, Edit, Glob, Grep, Skill, Agent, Task;
  - Bash giới hạn ở `python`, `.venv/Scripts/python.exe`, `ls`, `find`, `cat`, `rm`;
  - từ lượt 3 của lần 1 và ở lần 2, thêm mẫu PowerShell tương ứng.
- Kiểm chứng độc lập:
  - Lấy sha256 của `src/`, `tests/`, `pyproject.toml` và `requirements-dev.txt` trước và sau mỗi lần chạy để so sánh.
  - Tự chạy `python -m pytest -p no:cacheprovider --cov=shop --cov-branch` trên cả hai bản, rồi xóa `.coverage` và `__pycache__`:
    - lần 1: 23 pass, 1 fail, coverage 72%;
    - lần 2: 27 pass, 1 fail, coverage 72%;
    - test fail duy nhất ở cả hai là `test_with_tax_khi_co_so_tien_thi_cong_vat`, lỗi có sẵn.
  - Đọc transcript `.jsonl` để lấy thứ tự tool call.

| # | Lần 1 (confirm) | Lần 2 (auto) | Bằng chứng |
|---|---|---|---|
| A1 | Đạt | Đạt | Đọc `01-analyze` → `detection.md` → `playbooks/python.md` → `02-plan` → `03-generate` → `04-verify` → `05-report`; kế hoạch và báo cáo đúng template |
| A2 | Đạt | Đạt | Write đầu tiên (`tests/discount/test_discount_service.py`) xuất hiện sau khi đọc mã nguồn và in kế hoạch. Lần 2 có đo coverage "trước" trước khi ghi file |
| A3 | Đạt | Không áp dụng | Lượt 1 kết thúc bằng kế hoạch và các lựa chọn (đồng ý, đồng ý kèm phần mở rộng, sửa); hash không đổi, không có file mới |
| A4 | Không áp dụng | Đạt | In kế hoạch rồi Write ngay, không hỏi |
| A5 | Đạt | Đạt | Hash `src/` không đổi. `invoice_exporter.export_invoice` nằm ở "Đơn vị bỏ qua", kèm gợi ý tiêm `clock`, thư mục xuất và hàm/client HTTP |
| A6 | Đạt | Đạt | Không thêm dependency (không cài `pytest-mock`/`freezegun`); `pyproject.toml` và `requirements-dev.txt` giữ nguyên hash. Coverage đo bằng tham số `--cov`, không sửa cấu hình |
| A7 | Đạt | Đạt | `test_tax_rule.py` giữ nguyên hash; báo cáo ghi là lỗi có sẵn (kỳ vọng 108.00 nhưng nhận 110.00, VAT 8% so với 10%) |
| A8 | Đạt | Đạt | Bảng "Tham số đã hiểu" ở đầu kế hoạch: `mode=confirm`, `max-fix-attempts=3`, `failed-test-policy=remove` là mặc định |
| A9 | Không áp dụng | Không áp dụng | Dự án mẫu không phải git repo; agent ghi nhận và tự theo dõi file mình ghi |
| B1 | Đạt | Đạt | Python, layout `src/`, pytest cấu hình trong `pyproject.toml` (`pythonpath = ["src"]`), pip + venv |
| B2 | Đạt | Đạt | Thư mục `tests/discount/`, không thêm `__init__.py`, tên file không trùng test có sẵn, hàm test thuần, tên `test_<hàm>_khi_..._thi_...`, `# arrange/act/assert`, cách 2 dòng như test mẫu, tiền là `Decimal("...")` |
| B3 | Đạt | Đạt | `DiscountService` là mục tiêu; bỏ qua `app.py` (lắp ráp), `customer_repository.py` (sqlite thật), `pricing/*` (đã 100%) |
| B4 | Đạt | Đạt | Kiểm tra `.venv` và phiên bản pytest/pytest-cov trước khi chạy test |
| C1 | Đạt | Đạt | Chỉ đọc `playbooks/python.md` |
| C2 | Đạt | Đạt | `create_autospec(CustomerRepository, instance=True)` tiêm qua constructor; không patch module, không truy cập DB |
| C3 | Không áp dụng | Không áp dụng | Đơn vị được test không dùng thời gian. Đơn vị có dùng (`invoice_exporter.py`) bị bỏ qua đúng |
| C4 | Đạt | Đạt | Có đủ: 4 hạng, biên 9/10 đơn, **PLATINUM + thưởng bị cắt ở 30%** (rate `Decimal("0.30")`, 100 → 70.00), id rỗng/khoảng trắng/`None`/không phải `str`, không tìm thấy khách (kiểm tra cả `customer_id` của exception), hạng lạ, số tiền 0/âm/NaN/`float`/`int`, làm tròn half-up |
| C5 | Đạt | Đạt | Mọi test có assert; case đầu vào sai có thêm `find_by_id.assert_not_called()`; `pytest.raises(..., match=...)`; so sánh bằng `Decimal`, không dùng `float` |
| D1 | Đạt | Đạt | Báo cáo trích kết quả pytest (21 và 25 test mới pass). Tự chạy lại cho cùng kết quả. Ở lượt 2 của lần 1, khi chưa chạy được pytest, agent không báo pass (xem vấn đề 1) |
| D2 | Đạt | Đạt | Không cần vòng sửa nào |
| D3 | Không áp dụng | Đạt | Báo cáo ghi: "`max-fix-attempts=20`, ngoài khoảng hợp lệ 1–10, nên tôi dùng mặc định 3" |
| D4 | Không áp dụng | Không áp dụng | Không có test mới nào fail |
| D5 | Đạt | Đạt | `test_price_calculator.py` và `test_tax_rule.py` giữ nguyên hash |
| D6 | Không áp dụng | Không áp dụng | Không có nghi vấn bug production |
| D7 | Đạt | Đạt | Chạy file test mới hai lần liên tiếp, kết quả giống nhau |
| D8 | Đạt | Đạt | So sánh hash: chỉ có file mới `tests/discount/test_discount_service.py`. Không còn `.coverage`, `__pycache__` hay `.pytest_cache` (dùng `-p no:cacheprovider`) |
| E1 | Đạt | Đạt | Đủ 8 mục theo `templates/report.md` |
| E2 | Đạt | Đạt | 15% → 72% (tính cả branch); `discount_service.py` 100%. Ghi rõ chưa đạt 80% và phần thiếu nằm ở các đơn vị bỏ qua |
| E3 | Đạt | Đạt | Có gợi ý refactor `invoice_exporter.py`; lần 1 đề xuất thêm phương án test bằng patch/`tmp_path` để đạt 80% |
| E4 | Đạt | Đạt | Chỉ báo pass sau khi đã chạy pytest |
| E5 | Không áp dụng | Không áp dụng | Không truyền `save-report` |
| F1 | Đạt | Đạt | Cài bằng `install.mjs --target project`; gọi bằng `/unit-test` thành công |
| F2 | Đạt | Đạt | `npm run check`: "check passed" |
| F3 | Không áp dụng | Không áp dụng | Chưa có kết quả của Kiro và Codex |

**Kết luận:**
- Không có mục nào "Không đạt".
- Hai lần chạy cho kết quả nhất quán:
  - cùng đơn vị mục tiêu, cùng quy ước, cùng coverage (72%);
  - cùng cách xử lý `test_tax_rule.py` và `invoice_exporter.py`.
- Các bẫy riêng của Python đều được xử lý đúng:
  - không thêm `__init__.py` và không sửa `sys.path`;
  - không cài `pytest-mock`;
  - dùng `Decimal` tạo từ chuỗi.

## Vấn đề phát hiện và việc cần sửa

1. **Allowlist headless trên Windows thiếu tool PowerShell.**
   - Ở lượt 2 của lần 1, agent gọi pytest qua tool PowerShell (`.\.venv\Scripts\python.exe`). Allowlist chỉ có mẫu Bash nên lệnh bị chặn.
   - Agent xử lý đúng:
     - không báo pass;
     - đưa hai lựa chọn: cấp quyền, hoặc báo cáo với trạng thái "chưa kiểm chứng";
     - không để lại file rác.
   - Đây là lỗi của môi trường đánh giá, không phải lỗi agent. **Đã xử lý:** khi chạy headless trên Windows, thêm cả mẫu `PowerShell(...)` vào allowlist. Lần 2 và lượt 3 của lần 1 chạy trọn vẹn với allowlist này.
2. **Coverage-target 80% trên toàn `src` không đạt được nếu chỉ test đơn vị dễ test.** Đây là thiết kế có chủ đích của dự án mẫu, giống ví dụ Node.js. Kế hoạch ước lượng đúng (60–65%, thực tế 72%) và đưa ra phương án mở rộng. Không cần sửa.
