package com.example.shop.pricing;

import static org.junit.Assert.assertEquals;

import org.junit.Test;

public class TaxRuleUnitTest {

    @Test
    public void withTax_amountGiven_addsVat() {
        // Given
        double amount = 100;

        // When
        double total = new TaxRule().withTax(amount);

        // Then
        assertEquals(108.0, total, 0.0001);
    }
}
