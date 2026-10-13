/// Thành tiền một dòng hàng.
double lineTotal(double unitPrice, int quantity) {
  if (quantity <= 0) {
    throw RangeError.value(quantity, 'quantity', 'must be > 0');
  }
  return unitPrice * quantity;
}
