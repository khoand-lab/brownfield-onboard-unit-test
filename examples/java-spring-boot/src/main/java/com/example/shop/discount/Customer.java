package com.example.shop.discount;

public record Customer(String id, Tier tier, int ordersLastYear) {

    public enum Tier { REGULAR, SILVER, GOLD, PLATINUM }
}
