'use strict';

const VAT_RATE = 0.1;

/** Cộng VAT hiện hành (10%). */
function withTax(amount) {
  return Math.round(amount * (1 + VAT_RATE) * 100) / 100;
}

module.exports = { withTax, VAT_RATE };
