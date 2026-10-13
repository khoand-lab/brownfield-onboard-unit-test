import { useEffect, useState } from 'react';

import { fetchCustomer } from '../api/customer-api';
import { discountRate } from './discount';

export type DiscountState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; rate: number }
  | { status: 'error'; message: string };

/** Tải khách hàng và tính tỉ lệ giảm giá. Bỏ qua kết quả cũ khi customerId đổi. */
export function useDiscount(customerId: string | undefined): DiscountState {
  const [state, setState] = useState<DiscountState>({ status: 'idle' });

  useEffect(() => {
    if (!customerId) {
      setState({ status: 'idle' });
      return;
    }
    let cancelled = false;
    setState({ status: 'loading' });
    fetchCustomer(customerId)
      .then((customer) => {
        if (cancelled) return;
        if (!customer) {
          setState({ status: 'error', message: 'Không tìm thấy khách hàng' });
          return;
        }
        setState({ status: 'ready', rate: discountRate(customer) });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setState({ status: 'error', message: error instanceof Error ? error.message : String(error) });
      });
    return () => {
      cancelled = true;
    };
  }, [customerId]);

  return state;
}
