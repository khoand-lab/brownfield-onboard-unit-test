const vatRate = 0.10;

/// Số tiền đã cộng VAT.
double withTax(double amount) => (amount * (1 + vatRate) * 100).roundToDouble() / 100;
