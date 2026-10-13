export const VAT_RATE = 0.1;

/** Số tiền đã cộng VAT. */
export function withTax(amount: number): number {
  return Math.round(amount * (1 + VAT_RATE) * 100) / 100;
}
