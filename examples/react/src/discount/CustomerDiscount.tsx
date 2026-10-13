import { useState } from 'react';

import { DiscountBadge } from './DiscountBadge';
import { useDiscount } from './useDiscount';

/** Hiển thị giảm giá của khách hàng; sau khi áp dụng thì khóa nút. */
export function CustomerDiscount({ customerId }: { customerId: string }) {
  const discount = useDiscount(customerId);
  const [appliedRate, setAppliedRate] = useState<number | null>(null);

  if (discount.status === 'loading' || discount.status === 'idle') {
    return <p>Đang tải...</p>;
  }
  if (discount.status === 'error') {
    return <p role="alert">{discount.message}</p>;
  }
  return (
    <section>
      <DiscountBadge rate={discount.rate} disabled={appliedRate !== null} onApply={setAppliedRate} />
      {appliedRate !== null && <p>Đã áp dụng giảm {Math.round(appliedRate * 100)}%</p>}
    </section>
  );
}
