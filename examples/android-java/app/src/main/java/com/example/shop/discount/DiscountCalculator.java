package com.example.shop.discount;

/**
 * Tỉ lệ giảm giá: theo hạng, cộng thêm 5% nếu có từ 10 đơn trong năm trước, tối đa 30%.
 * Lớp Java thuần, không phụ thuộc Android.
 */
public class DiscountCalculator {

    public static final double MAX_DISCOUNT = 0.30;

    public double rate(Customer customer) {
        if (customer == null || customer.getTier() == null) {
            throw new IllegalArgumentException("customer tier is required");
        }
        double rate;
        switch (customer.getTier()) {
            case SILVER:
                rate = 0.10;
                break;
            case GOLD:
                rate = 0.20;
                break;
            case PLATINUM:
                rate = 0.28;
                break;
            default:
                rate = 0;
        }
        if (customer.getOrdersLastYear() >= 10) {
            rate += 0.05;
        }
        return Math.min(rate, MAX_DISCOUNT);
    }

    /** Số tiền sau giảm giá, làm tròn 2 chữ số thập phân. */
    public double apply(double amount, double rate) {
        if (Double.isNaN(amount) || amount < 0) {
            throw new IllegalArgumentException("amount must be >= 0");
        }
        return Math.round(amount * (1 - rate) * 100) / 100.0;
    }
}
