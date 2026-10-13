import 'package:flutter_test/flutter_test.dart';
import 'package:shop_flutter/src/pricing/tax_rule.dart';

void main() {
  group('tax_rule', () {
    group('withTax', () {
      test('cộng VAT khi có số tiền', () {
        // arrange
        const amount = 100.0;

        // act
        final total = withTax(amount);

        // assert
        expect(total, 108);
      });
    });
  });
}
