from decimal import ROUND_HALF_UP, Decimal

VAT_RATE = Decimal("0.10")
CENT = Decimal("0.01")


def with_tax(amount: Decimal) -> Decimal:
    """Cộng VAT hiện hành (10%)."""
    return (amount * (1 + VAT_RATE)).quantize(CENT, rounding=ROUND_HALF_UP)
