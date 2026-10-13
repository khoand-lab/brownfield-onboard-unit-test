package com.example.shop.discount;

import java.math.BigDecimal;
import java.math.RoundingMode;

import org.springframework.stereotype.Service;

@Service
public class DiscountService {

    static final BigDecimal MAX_DISCOUNT = new BigDecimal("0.30");

    private final CustomerRepository customerRepository;

    public DiscountService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    /**
     * Tính tỉ lệ giảm giá cho khách hàng: theo hạng, cộng thêm 5% nếu có từ 10 đơn trong năm trước,
     * tối đa 30%.
     */
    public BigDecimal discountRate(String customerId) {
        if (customerId == null || customerId.isBlank()) {
            throw new IllegalArgumentException("customerId is required");
        }
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new CustomerNotFoundException(customerId));

        BigDecimal rate = switch (customer.tier()) {
            case REGULAR -> BigDecimal.ZERO;
            case SILVER -> new BigDecimal("0.10");
            case GOLD -> new BigDecimal("0.20");
            case PLATINUM -> new BigDecimal("0.28");
        };
        if (customer.ordersLastYear() >= 10) {
            rate = rate.add(new BigDecimal("0.05"));
        }
        return rate.min(MAX_DISCOUNT);
    }

    public BigDecimal applyDiscount(String customerId, BigDecimal amount) {
        if (amount == null || amount.signum() < 0) {
            throw new IllegalArgumentException("amount must be >= 0");
        }
        BigDecimal rate = discountRate(customerId);
        return amount.subtract(amount.multiply(rate)).setScale(2, RoundingMode.HALF_UP);
    }
}
