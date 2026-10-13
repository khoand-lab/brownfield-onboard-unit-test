enum Tier { regular, silver, gold, platinum }

class Customer {
  const Customer({required this.id, required this.name, required this.tier, required this.ordersLastYear});

  factory Customer.fromJson(Map<String, dynamic> json) => Customer(
        id: json['id'] as String,
        name: json['name'] as String,
        tier: Tier.values.byName((json['tier'] as String).toLowerCase()),
        ordersLastYear: json['ordersLastYear'] as int,
      );

  final String id;
  final String name;
  final Tier tier;
  final int ordersLastYear;
}
