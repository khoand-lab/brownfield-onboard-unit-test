/** Thành tiền một dòng hàng. */
export function lineTotal(unitPrice: number, quantity: number): number {
  if (quantity <= 0) {
    throw new RangeError('quantity must be > 0');
  }
  return unitPrice * quantity;
}
