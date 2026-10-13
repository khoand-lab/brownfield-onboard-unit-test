import 'package:flutter/material.dart';

/// Nhãn giảm giá: ẩn khi tỉ lệ bằng 0; nút "Áp dụng" gọi onApply kèm tỉ lệ.
class DiscountBadge extends StatelessWidget {
  const DiscountBadge({super.key, required this.rate, required this.onApply, this.disabled = false});

  final double rate;
  final bool disabled;
  final ValueChanged<double> onApply;

  @override
  Widget build(BuildContext context) {
    if (rate <= 0) {
      return const SizedBox.shrink();
    }
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text('-${(rate * 100).round()}%'),
        const SizedBox(width: 8),
        ElevatedButton(
          onPressed: disabled ? null : () => onApply(rate),
          child: const Text('Áp dụng'),
        ),
      ],
    );
  }
}
