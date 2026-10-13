'use strict';

const { DiscountService } = require('./discount/discount-service');
const { createCustomerRepository } = require('./discount/customer-repository');
const priceCalculator = require('./pricing/price-calculator');
const taxRule = require('./pricing/tax-rule');

// Điểm khởi động: chỉ lắp ráp dependency, không có logic cần test.
const discountService = new DiscountService(createCustomerRepository(process.env.DATABASE_URL));

module.exports = { discountService, priceCalculator, taxRule };
