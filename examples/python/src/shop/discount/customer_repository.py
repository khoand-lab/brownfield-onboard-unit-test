import sqlite3

from shop.discount.customer import Customer


class CustomerRepository:
    """Truy cập DB thật. Không có logic cần unit test."""

    def __init__(self, db_path: str):
        self._db_path = db_path

    def find_by_id(self, customer_id: str) -> Customer | None:
        with sqlite3.connect(self._db_path) as conn:
            row = conn.execute(
                "SELECT id, tier, orders_last_year FROM customers WHERE id = ?",
                (customer_id,),
            ).fetchone()
        return Customer(*row) if row else None
