import { describe, expect, it } from 'vitest';

import { lineTotal } from '../price-calculator';

describe('price-calculator', () => {
  describe('lineTotal', () => {
    it('khi số lượng dương thì nhân đơn giá với số lượng', () => {
      // arrange
      const unitPrice = 25;

      // act
      const total = lineTotal(unitPrice, 4);

      // assert
      expect(total).toBe(100);
    });

    it('khi số lượng bằng 0 thì báo lỗi RangeError', () => {
      // act + assert
      expect(() => lineTotal(25, 0)).toThrow(RangeError);
    });
  });
});
