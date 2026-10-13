'use strict';

// Truy cập cơ sở dữ liệu thật. Trong unit test phải được thay bằng bản giả.
function createCustomerRepository(databaseUrl) {
  return {
    async findById(id) {
      throw new Error(`not implemented: query ${databaseUrl} for customer ${id}`);
    },
  };
}

module.exports = { createCustomerRepository };
