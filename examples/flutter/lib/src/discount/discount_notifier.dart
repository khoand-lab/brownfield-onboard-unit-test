import 'package:flutter/foundation.dart';

import '../api/customer_api.dart';
import 'discount_calculator.dart';

enum DiscountStatus { idle, loading, ready, error }

/// Tải khách hàng và tính tỉ lệ giảm giá. Bỏ qua kết quả cũ khi load được gọi lại với id khác.
class DiscountNotifier extends ChangeNotifier {
  DiscountNotifier(this._api, {DiscountCalculator calculator = const DiscountCalculator()})
      : _calculator = calculator;

  final CustomerApi _api;
  final DiscountCalculator _calculator;

  DiscountStatus status = DiscountStatus.idle;
  double rate = 0;
  String? message;
  String? _currentId;

  Future<void> load(String? customerId) async {
    _currentId = customerId;
    if (customerId == null || customerId.trim().isEmpty) {
      _set(DiscountStatus.idle);
      return;
    }
    _set(DiscountStatus.loading);
    try {
      final customer = await _api.fetchCustomer(customerId);
      if (_currentId != customerId) return;
      if (customer == null) {
        _set(DiscountStatus.error, message: 'Không tìm thấy khách hàng');
      } else {
        _set(DiscountStatus.ready, rate: _calculator.rate(customer));
      }
    } catch (error) {
      if (_currentId != customerId) return;
      _set(DiscountStatus.error, message: error.toString());
    }
  }

  void _set(DiscountStatus status, {double rate = 0, String? message}) {
    this.status = status;
    this.rate = rate;
    this.message = message;
    notifyListeners();
  }
}
