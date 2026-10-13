import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'discount_badge.dart';
import 'discount_notifier.dart';

/// Hiển thị giảm giá của khách hàng; sau khi áp dụng thì khóa nút.
class CustomerDiscountView extends StatefulWidget {
  const CustomerDiscountView({super.key, required this.customerId});

  final String customerId;

  @override
  State<CustomerDiscountView> createState() => _CustomerDiscountViewState();
}

class _CustomerDiscountViewState extends State<CustomerDiscountView> {
  double? _appliedRate;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<DiscountNotifier>().load(widget.customerId);
    });
  }

  @override
  Widget build(BuildContext context) {
    final notifier = context.watch<DiscountNotifier>();
    switch (notifier.status) {
      case DiscountStatus.idle:
      case DiscountStatus.loading:
        return const Center(child: CircularProgressIndicator());
      case DiscountStatus.error:
        return Text(notifier.message ?? '', style: const TextStyle(color: Colors.red));
      case DiscountStatus.ready:
        return Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            DiscountBadge(
              rate: notifier.rate,
              disabled: _appliedRate != null,
              onApply: (rate) => setState(() => _appliedRate = rate),
            ),
            if (_appliedRate != null) Text('Đã áp dụng giảm ${(_appliedRate! * 100).round()}%'),
          ],
        );
    }
  }
}
