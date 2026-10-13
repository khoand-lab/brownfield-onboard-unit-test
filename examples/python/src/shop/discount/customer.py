from dataclasses import dataclass


@dataclass(frozen=True)
class Customer:
    id: str
    tier: str
    orders_last_year: int


class CustomerNotFoundError(Exception):
    def __init__(self, customer_id: str):
        super().__init__(f"customer not found: {customer_id}")
        self.customer_id = customer_id
