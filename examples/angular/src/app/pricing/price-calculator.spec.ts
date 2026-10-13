import { lineTotal } from './price-calculator';

// Quy ước riêng của dự án: spec đặt cạnh file nguồn, describe theo file rồi theo hàm,
// tên it bằng tiếng Việt dạng "khi ... thì ...", AAA có chú thích.
describe('price-calculator', () => {
  describe('lineTotal', () => {
    it('khi có đơn giá và số lượng thì nhân và làm tròn 2 chữ số', () => {
      // arrange
      const unitPrice = 1.25;

      // act
      const total = lineTotal(unitPrice, 3);

      // assert
      expect(total).toBe(3.75);
    });

    it('khi số lượng bằng 0 thì ném RangeError', () => {
      // act + assert
      expect(() => lineTotal(1, 0)).toThrowError(RangeError, /quantity/);
    });
  });
});
