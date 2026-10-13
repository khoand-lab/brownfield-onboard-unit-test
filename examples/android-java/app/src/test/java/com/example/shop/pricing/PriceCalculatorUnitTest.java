package com.example.shop.pricing;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThrows;

import org.junit.Test;

public class PriceCalculatorUnitTest {

    private final PriceCalculator calculator = new PriceCalculator();

    @Test
    public void lineTotal_positiveQuantity_multipliesUnitPrice() {
        // Given
        double unitPrice = 25;

        // When
        double total = calculator.lineTotal(unitPrice, 4);

        // Then
        assertEquals(100.0, total, 0.0001);
    }

    @Test
    public void lineTotal_zeroQuantity_throwsIllegalArgument() {
        // When + Then
        assertThrows(IllegalArgumentException.class, () -> calculator.lineTotal(25, 0));
    }
}
