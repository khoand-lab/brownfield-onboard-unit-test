package com.example.shop.discount;

public final class Customer {
    private final String id;
    private final String name;
    private final Tier tier;
    private final int ordersLastYear;

    public Customer(String id, String name, Tier tier, int ordersLastYear) {
        this.id = id;
        this.name = name;
        this.tier = tier;
        this.ordersLastYear = ordersLastYear;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public Tier getTier() {
        return tier;
    }

    public int getOrdersLastYear() {
        return ordersLastYear;
    }
}
