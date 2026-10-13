import 'dart:math' as math;

import 'customer.dart';

/// Tỉ lệ giảm giá: theo hạng, cộng thêm 5% nếu có từ 10 đơn trong năm trước, tối đa 30%.
class DiscountCalculator {
  const DiscountCalculator();

  static const maxDiscount = 0.30;

  static const _tierRates = {
    Tier.regular: 0.0,
    Tier.silver: 0.10,
    Tier.gold: 0.20,
    Tier.platinum: 0.28,
  };

  double rate(Customer customer) {
    var rate = _tierRates[customer.tier]!;
    if (customer.ordersLastYear >= 10) {
      rate += 0.05;
    }
    return math.min(rate, maxDiscount);
  }

  /// Số tiền sau giảm giá, làm tròn 2 chữ số thập phân.
  double apply(double amount, double rate) {
    if (amount.isNaN || amount < 0) {
      throw ArgumentError.value(amount, 'amount', 'must be >= 0');
    }
    return (amount * (1 - rate) * 100).roundToDouble() / 100;
  }
}
