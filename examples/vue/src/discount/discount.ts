import type { Customer, Tier } from './customer';

export const MAX_DISCOUNT = 0.3;

const TIER_RATES: Record<Tier, number> = {
  REGULAR: 0,
  SILVER: 0.1,
  GOLD: 0.2,
  PLATINUM: 0.28,
};

/**
 * Tỉ lệ giảm giá cho khách hàng: theo hạng, cộng thêm 5% nếu có từ 10 đơn trong năm trước,
 * tối đa 30%.
 */
export function discountRate(customer: Customer): number {
  if (!Object.hasOwn(TIER_RATES, customer.tier)) {
    throw new RangeError(`unknown tier: ${customer.tier}`);
  }
  let rate = TIER_RATES[customer.tier];
  if (customer.ordersLastYear >= 10) {
    rate += 0.05;
  }
  return Math.min(rate, MAX_DISCOUNT);
}

/** Số tiền sau giảm giá, làm tròn 2 chữ số thập phân. */
export function applyDiscount(amount: number, rate: number): number {
  if (typeof amount !== 'number' || Number.isNaN(amount) || amount < 0) {
    throw new RangeError('amount must be >= 0');
  }
  return Math.round(amount * (1 - rate) * 100) / 100;
}
