'use strict';

const { withTax } = require('../../src/pricing/tax-rule');

describe('tax-rule', () => {
  describe('withTax', () => {
    // CỐ Ý FAIL: test cũ còn giữ mức VAT 8% cũ. Agent phải giữ nguyên test này và báo là lỗi có sẵn.
    it('khi có số tiền thì cộng VAT', () => {
      // act
      const result = withTax(100);

      // assert
      expect(result).toBe(108);
    });
  });
});
