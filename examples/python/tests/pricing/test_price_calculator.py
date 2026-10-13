from decimal import Decimal

import pytest

from shop.pricing.price_calculator import line_total

# Quy ước riêng của dự án: test nằm trong tests/ (lặp cấu trúc src/shop/), không có __init__.py,
# hàm test thuần (không dùng class), tên test_<hàm>_khi_<tình huống>_thi_<kết quả>,
# AAA có chú thích, tiền dùng Decimal tạo từ chuỗi.


def test_line_total_khi_co_don_gia_va_so_luong_thi_nhan_va_lam_tron():
    # arrange
    unit_price = Decimal("1.255")

    # act
    total = line_total(unit_price, 3)

    # assert
    assert total == Decimal("3.77")


def test_line_total_khi_so_luong_bang_0_thi_nem_value_error():
    # act + assert
    with pytest.raises(ValueError, match="quantity"):
        line_total(Decimal("1"), 0)
