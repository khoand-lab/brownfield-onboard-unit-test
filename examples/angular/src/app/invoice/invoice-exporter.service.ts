import { Injectable } from '@angular/core';

const ACCOUNTING_URL = 'http://accounting.internal/api/invoices';

/**
 * Xuất hóa đơn: tải file về máy người dùng và gửi lên hệ thống kế toán.
 * Phụ thuộc cứng vào thời gian hệ thống, DOM (tạo link tải file), localStorage và fetch toàn cục
 * (không tiêm được): khó unit test.
 */
@Injectable({ providedIn: 'root' })
export class InvoiceExporterService {
  async exportInvoice(orderId: string, total: number): Promise<string> {
    const timestamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
    const fileName = `invoice-${orderId}-${timestamp}.txt`;

    const url = URL.createObjectURL(new Blob([`${orderId};${total}`], { type: 'text/plain' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);

    const response = await fetch(ACCOUNTING_URL, { method: 'POST', body: fileName });
    if (!response.ok) {
      throw new Error(`accounting rejected invoice: ${response.status}`);
    }
    localStorage.setItem('lastInvoice', fileName);
    return fileName;
  }
}
