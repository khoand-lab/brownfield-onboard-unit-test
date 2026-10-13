from decimal import ROUND_HALF_UP, Decimal

from shop.discount.customer import CustomerNotFoundError

MAX_DISCOUNT = Decimal("0.30")
LOYALTY_BONUS = Decimal("0.05")
LOYALTY_MIN_ORDERS = 10
CENT = Decimal("0.01")

TIER_RATES = {
    "REGULAR": Decimal("0"),
    "SILVER": Decimal("0.10"),
    "GOLD": Decimal("0.20"),
    "PLATINUM": Decimal("0.28"),
}


class DiscountService:
    def __init__(self, customer_repository):
        """customer_repository: đối tượng có find_by_id(id) -> Customer | None."""
        self._customers = customer_repository

    def discount_rate(self, customer_id: str) -> Decimal:
        """Tỉ lệ giảm theo hạng, cộng 5% nếu có từ 10 đơn trong năm trước, tối đa 30%."""
        if not isinstance(customer_id, str) or not customer_id.strip():
            raise ValueError("customer_id is required")
        customer = self._customers.find_by_id(customer_id)
        if customer is None:
            raise CustomerNotFoundError(customer_id)
        if customer.tier not in TIER_RATES:
            raise ValueError(f"unknown tier: {customer.tier}")

        rate = TIER_RATES[customer.tier]
        if customer.orders_last_year >= LOYALTY_MIN_ORDERS:
            rate += LOYALTY_BONUS
        return min(rate, MAX_DISCOUNT)

    def apply_discount(self, customer_id: str, amount: Decimal) -> Decimal:
        """Số tiền sau giảm giá, làm tròn 2 chữ số thập phân."""
        if not isinstance(amount, Decimal) or amount.is_nan() or amount < 0:
            raise ValueError("amount must be a Decimal >= 0")
        rate = self.discount_rate(customer_id)
        return (amount * (1 - rate)).quantize(CENT, rounding=ROUND_HALF_UP)
