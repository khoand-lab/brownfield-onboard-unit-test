import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:provider/provider.dart';

import 'src/api/customer_api.dart';
import 'src/discount/customer_discount_view.dart';
import 'src/discount/discount_notifier.dart';

void main() {
  runApp(
    ChangeNotifierProvider(
      create: (_) => DiscountNotifier(CustomerApi(http.Client(), baseUrl: 'https://shop.example.com/api')),
      child: const MaterialApp(
        home: Scaffold(body: CustomerDiscountView(customerId: 'c-1')),
      ),
    ),
  );
}
