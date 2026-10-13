import { withTax } from '@/pricing/tax-rule';

describe('TaxRule', () => {
  describe('withTax()', () => {
    it('should add VAT when amount is given', () => {
      // given
      const amount = 100;

      // when
      const total = withTax(amount);

      // then
      expect(total).toBe(108);
    });
  });
});
