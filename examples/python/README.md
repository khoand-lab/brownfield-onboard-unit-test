# Ví dụ brownfield: Python

Dự án mẫu để thử agent `brownfield-unit-test`. Layout `src/`, pytest (cấu hình trong `pyproject.toml`), pip + venv (`requirements-dev.txt`), không có `pytest-mock` hay `freezegun`. Các "bẫy" có chủ đích:

| Thành phần | Mục đích kiểm tra |
|---|---|
| `tests/pricing/test_price_calculator.py` | Quy ước riêng: test nằm trong `tests/` lặp cấu trúc `src/shop/`, **không có `__init__.py`**, hàm test thuần (không dùng class), tên `test_<hàm>_khi_<tình huống>_thi_<kết quả>`, chú thích `# arrange/act/assert`, tiền là `Decimal` tạo từ chuỗi. Import qua `pythonpath = ["src"]`, agent không được sửa `sys.path`. Vì không có `__init__.py`, tên file test mới không được trùng tên file test có sẵn. |
| `src/shop/discount/discount_service.py` | Đơn vị dễ test, chưa có test: repository tiêm qua constructor cần giả lập (không có `pytest-mock`, phải dùng `unittest.mock` với `spec` hoặc fake); nhánh theo hạng, thưởng ở biên 9/10 đơn, giới hạn 30% (PLATINUM 28% + thưởng 5% bị cắt còn 30%), lỗi khi thiếu id / không tìm thấy khách / hạng lạ / số tiền âm, NaN hoặc không phải `Decimal`. So sánh phải dùng `Decimal("...")`, không dùng `float`. |
| `src/shop/invoice/invoice_exporter.py` | Phụ thuộc cứng (`datetime.now`, ghi file vào `/var/invoices`, `urllib`). Agent phải đưa vào "Đơn vị bỏ qua" kèm gợi ý refactor, không sửa code. |
| `src/shop/discount/customer_repository.py`, `src/shop/app.py` | Truy cập DB thật và điểm lắp ráp, không có logic cần unit test. |
| `tests/pricing/test_tax_rule.py` | Test cũ **cố ý fail**. Agent phải giữ nguyên và báo là lỗi có sẵn. |

Chạy (Python 3.10+):

```
python -m venv .venv
.venv/bin/python -m pip install -r requirements-dev.txt      # Windows: .venv\Scripts\python
.venv/bin/python -m pytest
```

Kết quả mong đợi trước khi dùng agent: 3 test chạy, chỉ `test_with_tax_khi_co_so_tien_thi_cong_vat` fail.

Gợi ý gọi agent: `scope=src coverage-target=80`.
