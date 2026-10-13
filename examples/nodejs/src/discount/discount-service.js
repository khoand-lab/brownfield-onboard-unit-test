'use strict';

const { CustomerNotFoundError } = require('./customer-not-found-error');

const MAX_DISCOUNT = 0.3;

const TIER_RATES = {
  REGULAR: 0,
  SILVER: 0.1,
  GOLD: 0.2,
  PLATINUM: 0.28,
};

class DiscountService {
  /**
   * @param {{ findById(id: string): Promise<{ id: string, tier: string, ordersLastYear: number } | null> }} customerRepository
   */
  constructor(customerRepository) {
    this.customerRepository = customerRepository;
  }

  /**
   * Tính tỉ lệ giảm giá cho khách hàng: theo hạng, cộng thêm 5% nếu có từ 10 đơn trong năm trước,
   * tối đa 30%.
   */
  async discountRate(customerId) {
    if (typeof customerId !== 'string' || customerId.trim() === '') {
      throw new TypeError('customerId is required');
    }
    const customer = await this.customerRepository.findById(customerId);
    if (!customer) {
      throw new CustomerNotFoundError(customerId);
    }
    if (!(customer.tier in TIER_RATES)) {
      throw new RangeError(`unknown tier: ${customer.tier}`);
    }

    let rate = TIER_RATES[customer.tier];
    if (customer.ordersLastYear >= 10) {
      rate += 0.05;
    }
    return Math.min(rate, MAX_DISCOUNT);
  }

  /** Trả về số tiền sau giảm giá, làm tròn 2 chữ số thập phân. */
  async applyDiscount(customerId, amount) {
    if (typeof amount !== 'number' || Number.isNaN(amount) || amount < 0) {
      throw new RangeError('amount must be >= 0');
    }
    const rate = await this.discountRate(customerId);
    return Math.round(amount * (1 - rate) * 100) / 100;
  }
}

module.exports = { DiscountService, MAX_DISCOUNT };
