'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ACCOUNTING_URL = 'http://accounting.internal/api/invoices';
const INVOICE_DIR = '/var/invoices';

/**
 * Xuất hóa đơn ra file và gửi lên hệ thống kế toán.
 * Phụ thuộc cứng vào thời gian hệ thống, file system và HTTP (không tiêm được): khó unit test.
 */
async function exportInvoice(orderId, total) {
  const timestamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
  const fileName = `invoice-${orderId}-${timestamp}.txt`;
  fs.writeFileSync(path.join(INVOICE_DIR, fileName), `${orderId};${total}`);

  const response = await fetch(ACCOUNTING_URL, { method: 'POST', body: fileName });
  if (!response.ok) {
    throw new Error(`accounting rejected invoice: ${response.status}`);
  }
  return fileName;
}

module.exports = { exportInvoice };
