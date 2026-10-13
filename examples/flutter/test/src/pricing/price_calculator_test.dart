import 'package:flutter_test/flutter_test.dart';
import 'package:shop_flutter/src/pricing/price_calculator.dart';

void main() {
  group('price_calculator', () {
    group('lineTotal', () {
      test('nhân đơn giá với số lượng khi số lượng dương', () {
        // arrange
        const unitPrice = 25.0;

        // act
        final total = lineTotal(unitPrice, 4);

        // assert
        expect(total, 100);
      });

      test('ném RangeError khi số lượng bằng 0', () {
        // act + assert
        expect(() => lineTotal(25, 0), throwsRangeError);
      });
    });
  });
}
