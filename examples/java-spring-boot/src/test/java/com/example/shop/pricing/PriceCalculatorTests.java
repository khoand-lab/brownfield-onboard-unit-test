package com.example.shop.pricing;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;

import org.junit.jupiter.api.Test;

// Quy ước riêng của dự án: hậu tố *Tests, tên method given_when_then, AssertJ, AAA có chú thích.
class PriceCalculatorTests {

    private final PriceCalculator calculator = new PriceCalculator();

    @Test
    void givenPriceAndQuantity_whenLineTotal_thenMultipliesAndRounds() {
        // arrange
        BigDecimal unitPrice = new BigDecimal("1.005");

        // act
        BigDecimal total = calculator.lineTotal(unitPrice, 3);

        // assert
        assertThat(total).isEqualByComparingTo("3.02");
    }

    @Test
    void givenZeroQuantity_whenLineTotal_thenThrows() {
        // act + assert
        assertThatThrownBy(() -> calculator.lineTotal(BigDecimal.ONE, 0))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("quantity");
    }
}
