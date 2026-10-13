import 'dart:convert';

import 'package:http/http.dart' as http;

import '../discount/customer.dart';

class CustomerApiException implements Exception {
  CustomerApiException(this.statusCode);

  final int statusCode;

  @override
  String toString() => 'customer api failed: $statusCode';
}

/// Gọi API khách hàng. Client được tiêm qua constructor. Trả về null khi API trả 404.
class CustomerApi {
  CustomerApi(this._client, {required this.baseUrl});

  final http.Client _client;
  final String baseUrl;

  Future<Customer?> fetchCustomer(String id) async {
    final response = await _client.get(Uri.parse('$baseUrl/customers/${Uri.encodeComponent(id)}'));
    if (response.statusCode == 404) {
      return null;
    }
    if (response.statusCode != 200) {
      throw CustomerApiException(response.statusCode);
    }
    return Customer.fromJson(jsonDecode(response.body) as Map<String, dynamic>);
  }
}
