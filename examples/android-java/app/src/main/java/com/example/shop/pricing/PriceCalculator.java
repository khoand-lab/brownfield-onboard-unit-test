package com.example.shop.pricing;

/** Thành tiền một dòng hàng. */
public class PriceCalculator {
    public double lineTotal(double unitPrice, int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("quantity must be > 0");
        }
        return unitPrice * quantity;
    }
}
