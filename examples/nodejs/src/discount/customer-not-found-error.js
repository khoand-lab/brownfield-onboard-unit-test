'use strict';

class CustomerNotFoundError extends Error {
  constructor(customerId) {
    super(`customer not found: ${customerId}`);
    this.name = 'CustomerNotFoundError';
    this.customerId = customerId;
  }
}

module.exports = { CustomerNotFoundError };
