"""Điểm lắp ráp. Không có logic cần unit test."""
from shop.discount.customer_repository import CustomerRepository
from shop.discount.discount_service import DiscountService


def create_discount_service(db_path: str = "shop.db") -> DiscountService:
    return DiscountService(CustomerRepository(db_path))
