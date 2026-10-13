import { Injectable, inject } from '@angular/core';
import { Observable, map, throwError } from 'rxjs';

import { Tier } from './customer';
import { CustomerNotFoundError } from './customer-not-found-error';
import { CustomerRepository } from './customer-repository';

export const MAX_DISCOUNT = 0.3;

const TIER_RATES: Record<Tier, number> = {
  REGULAR: 0,
  SILVER: 0.1,
  GOLD: 0.2,
  PLATINUM: 0.28,
};

@Injectable({ providedIn: 'root' })
export class DiscountService {
  private readonly customerRepository = inject(CustomerRepository);

  /**
   * Tỉ lệ giảm giá cho khách hàng: theo hạng, cộng thêm 5% nếu có từ 10 đơn trong năm trước,
   * tối đa 30%.
   */
  discountRate(customerId: string): Observable<number> {
    if (typeof customerId !== 'string' || customerId.trim() === '') {
      return throwError(() => new TypeError('customerId is required'));
    }
    return this.customerRepository.findById(customerId).pipe(
      map((customer) => {
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
      }),
    );
  }

  /** Số tiền sau giảm giá, làm tròn 2 chữ số thập phân. */
  applyDiscount(customerId: string, amount: number): Observable<number> {
    if (typeof amount !== 'number' || Number.isNaN(amount) || amount < 0) {
      return throwError(() => new RangeError('amount must be >= 0'));
    }
    return this.discountRate(customerId).pipe(map((rate) => Math.round(amount * (1 - rate) * 100) / 100));
  }
}
