import Foundation

public enum DiscountError: Error, Equatable {
    case invalidAmount
}

/// Tỉ lệ giảm giá: theo hạng, cộng thêm 5% nếu có từ 10 đơn trong năm trước, tối đa 30%.
public struct DiscountCalculator {
    public static let maxDiscount = 0.30

    public init() {}

    public func rate(for customer: Customer) -> Double {
        var rate: Double
        switch customer.tier {
        case .regular: rate = 0
        case .silver: rate = 0.10
        case .gold: rate = 0.20
        case .platinum: rate = 0.28
        }
        if customer.ordersLastYear >= 10 {
            rate += 0.05
        }
        return min(rate, Self.maxDiscount)
    }

    /// Số tiền sau giảm giá, làm tròn 2 chữ số thập phân.
    public func apply(amount: Double, rate: Double) throws -> Double {
        guard !amount.isNaN, amount >= 0 else {
            throw DiscountError.invalidAmount
        }
        return (amount * (1 - rate) * 100).rounded() / 100
    }
}
