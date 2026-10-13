package com.example.shop.pricing;

/** Số tiền đã cộng VAT. */
public class TaxRule {
    public static final double VAT_RATE = 0.10;

    public double withTax(double amount) {
        return Math.round(amount * (1 + VAT_RATE) * 100) / 100.0;
    }
}
