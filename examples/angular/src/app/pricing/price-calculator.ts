/** Thành tiền một dòng hàng, làm tròn 2 chữ số thập phân. */
export function lineTotal(unitPrice: number, quantity: number): number {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new RangeError('quantity must be a positive integer');
  }
  return Math.round(unitPrice * quantity * 100) / 100;
}
