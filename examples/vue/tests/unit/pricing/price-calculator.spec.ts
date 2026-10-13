import { lineTotal } from '@/pricing/price-calculator';

describe('PriceCalculator', () => {
  describe('lineTotal()', () => {
    it('should multiply unit price by quantity when quantity is positive', () => {
      // given
      const unitPrice = 25;

      // when
      const total = lineTotal(unitPrice, 4);

      // then
      expect(total).toBe(100);
    });

    it('should throw RangeError when quantity is zero', () => {
      // when + then
      expect(() => lineTotal(25, 0)).toThrow(RangeError);
    });
  });
});
