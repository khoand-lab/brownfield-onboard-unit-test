import 'dart:io';

import 'package:http/http.dart' as http;

/// Xuất hóa đơn ra file và gửi lên hệ thống kế toán.
/// Phụ thuộc cứng vào thời gian hệ thống, file system và HTTP (hàm top-level của package http,
/// không truyền client vào được): khó unit test.
class InvoiceExporter {
  static final _accountingUrl = Uri.parse('http://accounting.internal/api/invoices');

  Future<String> export(String orderId, double total) async {
    final now = DateTime.now();
    final timestamp = now.toIso8601String().replaceAll(RegExp(r'\D'), '').substring(0, 14);
    final fileName = 'invoice-$orderId-$timestamp.txt';

    await File('${Directory.systemTemp.path}/$fileName').writeAsString('$orderId;$total');

    final response = await http.post(_accountingUrl, body: fileName);
    if (response.statusCode != 200) {
      throw HttpException('accounting rejected invoice: ${response.statusCode}');
    }
    return fileName;
  }
}
