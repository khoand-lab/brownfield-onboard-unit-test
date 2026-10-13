package com.example.shop.pricing;

import java.math.BigDecimal;
import java.math.RoundingMode;

public class TaxRule {

    private static final BigDecimal VAT = new BigDecimal("0.10");

    public BigDecimal withTax(BigDecimal amount) {
        return amount.add(amount.multiply(VAT)).setScale(2, RoundingMode.HALF_UP);
    }
}
