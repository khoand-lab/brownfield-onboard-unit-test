export function lineTotal(unitPrice, quantity) {
  if (quantity <= 0) throw new RangeError('quantity must be positive');
  return Math.round(unitPrice * quantity * 100) / 100;
}
