from decimal import ROUND_HALF_UP, Decimal

CENT = Decimal("0.01")


def line_total(unit_price: Decimal, quantity: int) -> Decimal:
    """Thành tiền một dòng hàng, làm tròn 2 chữ số thập phân."""
    if not isinstance(quantity, int) or isinstance(quantity, bool) or quantity <= 0:
        raise ValueError("quantity must be a positive integer")
    return (unit_price * quantity).quantize(CENT, rounding=ROUND_HALF_UP)
