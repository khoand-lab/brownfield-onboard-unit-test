import { describe, expect, it } from 'vitest';

import { withTax } from '../tax-rule';

describe('tax-rule', () => {
  describe('withTax', () => {
    it('khi có số tiền thì cộng VAT', () => {
      // arrange
      const amount = 100;

      // act
      const total = withTax(amount);

      // assert
      expect(total).toBe(108);
    });
  });
});
