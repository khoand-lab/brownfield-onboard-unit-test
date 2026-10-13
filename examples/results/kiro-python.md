# Kết quả: kiro trên python

- Ngày chạy: 2026-10-06. Client: Kiro CLI `kiro-cli-chat 2.27.1`, headless, custom agent `unit-test-writer`. Model: `auto` (mặc định của Kiro CLI).
- Phiên bản agent (package.json): 0.1.0. Bản build đã có quy tắc "Không can thiệp tiến trình ngoài phiên" (change `complete-cross-client-evaluation`).
- Cách chạy: `npm run eval -- --client kiro --stack python --mode both`, lệnh gọi theo `eval.config.json`. Bản copy sạch nằm ở `%TEMP%/brownfield-eval/20261006-101657/kiro-python-{confirm,auto}`.
- Toolchain: Python 3.14.3 (.venv), pytest 8.3.5, pytest-cov 6.1.1, Windows 11.
- Lần 1 (confirm): lượt `scope=src/shop`, rồi `đồng ý kế hoạch, làm tiếp` trên cùng phiên (`--resume`). Lần 2 (auto): `scope=src/shop mode=auto`.
- Cách chấm: các mục có ghi "(tự chấm)" lấy từ công cụ eval; mọi mục "Không đạt" đã được đối chiếu độc lập (`ls`, transcript). Các mục còn lại được chấm tay từ kế hoạch, báo cáo và file test.

| # | Lần 1 (confirm) | Lần 2 (auto) | Bằng chứng |
|---|---|---|---|
| A1 | Đạt | Đạt | Đọc `SKILL.md`, cả 5 file `phases/`, `detection.md`, playbook và `templates/` trước khi làm; kế hoạch và báo cáo theo thứ tự 5 pha |
| A2 | Đạt | Đạt | File test đầu tiên được tạo sau khi đọc mã nguồn, đo coverage nền và in kế hoạch |
| A3 | **Không đạt** | Không áp dụng | Lần 1: Sau lượt 1 (chưa xác nhận) đã có thay đổi: src/shop/__pycache__/ (thư mục mới), src/shop/pricing/__pycache__/ (thư mục mới), tests/pricing/__pycache__/ (thư mục… · Lần 2: chạy mode=auto (tự chấm) |
| A4 | Không áp dụng | Đạt | Lần 1: chạy mode=confirm · Lần 2: Một lượt duy nhất, đã ghi 1 file test mới mà không dừng hỏi (tự chấm) |
| A5 | Đạt | Đạt | File production không đổi; báo cáo nhắc invoice_exporter (tự chấm) |
| A6 | Đạt | Đạt | Không file cấu hình/dependency nào thay đổi (tự chấm) |
| A7 | Đạt | Đạt | Test cố ý fail giữ nguyên và vẫn fail: test_tax_rule.py::test_with_tax_khi_co_so_tien_thi_cong_vat (tự chấm) |
| A8 | Đạt | Đạt | Lần 1: Bảng tham số đủ 6 tham số; kế hoạch đủ mục. ## 1. Tham số đã hiểu ⏎ \| Tham số \| Giá trị dùng \| Ghi chú \| ⏎ \|---\|---\|---\| ⏎ \| `scope` \| `src/shop` \| M… · Lần 2: Bảng tham số đủ 6 tham số; kế hoạch đủ mục (thiếu dòng tiêu đề "Kế hoạch unit test"). ## 1. Tham số đã hiểu ⏎ \| Tham số \| Giá trị dùng \| Ghi chú \| ⏎ \|---\|… (tự chấm) |
| A9 | Không áp dụng | Không áp dụng | dự án mẫu không phải git repo (tự chấm) |
| B1 | Đạt | Đạt | Python, pytest (cấu hình trong `pyproject.toml`), `unittest.mock`, pytest-cov |
| B2 | Đạt | Đạt | `tests/` lặp cấu trúc `src/shop/`, không có `__init__.py`; tên `test_<hàm>_khi_<tình huống>_thi_<kết quả>`; AAA; so sánh `Decimal` |
| B3 | Đạt | Đạt | `DiscountService` (chưa có test) là mục tiêu; bỏ qua `customer_repository.py` (DB thật) và `app.py` (lắp ráp) |
| B4 | Đạt | Đạt | Kiểm tra `.venv`, Python, pytest, pytest-cov; ghi rõ `.venv` có sẵn nên không dọn |
| C1 | Đạt | Đạt | Chỉ đọc `playbooks/python.md` |
| C2 | Đạt | Đạt | Không khớp dấu hiệu xấu (@pytest\.mark\.skip, \bunittest\.skip) trong 1 file test mới/sửa (tự chấm) |
| C3 | Không áp dụng | Không áp dụng | Đơn vị được test không dùng thời gian hay ngẫu nhiên; `invoice_exporter` (dùng `datetime.now`) bị bỏ qua đúng |
| C4 | Đạt | Đạt | Lần 1: 19 test, lần 2: 21 test. Có đủ các hạng, biên 9/10 đơn, trần 30% (`..._platinum_..._cat_con_30_phan_tram`), id None/rỗng/toàn khoảng trắng, không tìm thấy khách, hạng lạ, số tiền âm/NaN/không phải `Decimal`, làm tròn HALF_UP |
| C5 | Đạt | Đạt | Mọi test đều có assertion cụ thể (giá trị, exception, DOM/widget); C2 không khớp dấu hiệu xấu |
| D1 | Đạt | Đạt | Chạy lại `.venv/Scripts/python.exe -m pytest -rf -p no:cacheprovider`: 1 test fail, đều là lỗi có sẵn (tự chấm) |
| D2 | Đạt | Đạt | Không cần vòng sửa nào; báo cáo mục 4: "Không có" |
| D3 | Không áp dụng | Không áp dụng | Tham số hợp lệ; bảng ghi `max-fix-attempts` = 3 (mặc định) |
| D4 | Không áp dụng | Không áp dụng | Không có test mới nào fail |
| D5 | Đạt | Đạt | Không dòng nào của test có sẵn bị xóa/sửa (tự chấm) |
| D6 | Không áp dụng | Không áp dụng | Không có nghi vấn bug production (báo cáo mục 5) |
| D7 | Đạt | Đạt | Chạy file mới riêng, chạy lại lần 2 ("All 19/21 pass… Stable"), rồi chạy toàn bộ |
| D8 | Đạt | Đạt | Chỉ file test thay đổi (1 file), không còn thư mục build mới (tự chấm) |
| E1 | Đạt | Đạt | Báo cáo đủ các mục của templates/report.md (tự chấm) |
| E2 | Đạt | Đạt | Có số liệu trước/sau. Lần 1: ## 3. Coverage ⏎ \| Phạm vi \| Trước \| Sau \| Công cụ \| ⏎ \|---\|---\|---\|---\| ⏎ \| package `shop` (TOTAL) \| 15% \| 72% \| pytest-cov 6.1.1 (`--cov=shop --cov-branch`) \| ⏎ \| `discount/discount_… |
| E3 | Đạt | Đạt | Có gợi ý refactor. ## 6. Đơn vị bỏ qua ⏎ \| Đơn vị \| Lý do \| Gợi ý refactor \| ⏎ \|---\|---\|---\| ⏎ \| `invoice/invoice_exporter.py::export_invoice` \| Phụ thuộc cứng không tiêm được: `datetime.no… |
| E4 | Đạt | Đạt | Chỉ báo pass sau khi chạy; công cụ chạy lại test xác nhận (D1) |
| E5 | Không áp dụng | Không áp dụng | không truyền save-report (tự chấm) |
| F1 | Đạt | Đạt | Gọi được agent qua CLI của client với adapter cài mức project (tự chấm) |
| F2 | Đạt | Đạt | npm run check: check passed (tự chấm) |
| F3 | Không áp dụng | Không áp dụng | so sánh giữa các client do người chấm làm (tự chấm) |

**Kết luận:** 1 mục không đạt: A3 (confirm). Không có vi phạm về sửa code production, phá test cũ hay can thiệp tiến trình.

## Vấn đề phát hiện

- A3 (confirm): còn sót thư mục build tại điểm dừng của mode=confirm (lỗi lặp lại)

### Phân loại (task 3.3, design D5)

- A3: **Sửa lõi/playbook** (D5 (a): lặp lại trên Kiro và Codex). Thêm mục "Thư mục/file sinh ra khi chạy" vào `## Commands` của cả 9 playbook; `core/phases/02-plan.md` yêu cầu xóa cả cache trình chạy test và liệt kê lại thư mục gốc trước khi dừng ở `mode=confirm`.

### Hồi quy sau khi sửa (2026-10-06)

Run `20261006-133206-6860` (Kiro · python · confirm), chạy sau đợt hồi quy Flutter/Angular/Android.

- A3 (confirm): hết lỗi (run `20261006-133206-6860`: "Snapshot sau lượt 1 giống hệt lúc đầu"). Lượt này lộ E1 "Không đạt", xử lý ở mục bên dưới.

### Sửa lõi lần 2: báo cáo không theo mẫu ở lượt tiếp tục (E1)

- Hiện tượng: ở lượt 2 của `mode=confirm` (phiên tiếp tục bằng `--resume`), Kiro viết báo cáo với tiêu đề tự đặt ("Tổng quan", "File test đã tạo", "Lỗi có sẵn"...) thay cho các mục có đánh số của `templates/report.md`. Gặp ở Angular (run `20261006-112221-339f`) và Python (run `20261006-133206-6860`); lượt chính thức của cả hai stack đều đạt.
- Phân loại: **sửa lõi** (D5 (a): lặp lại trên Kiro và đã từng xảy ra với Codex, xem `codex-react.md` vòng 1).
- Hành động: `core/phases/05-report.md` bước 1 yêu cầu đọc lại `templates/report.md` ngay trước khi viết (kể cả khi phiên được tiếp tục sau bước xác nhận), chép đúng tiêu đề có số thứ tự, không đổi tên hay thêm mục ngang hàng.
- Hồi quy (run `20261006-133621-4086`): Kiro · python · confirm và Kiro · angular · confirm đều 0 mục "Không đạt" (A3, D8, E1 "Đạt"); kèm Claude Code · java-spring-boot · confirm (xem `eval-automation-check.md`).
