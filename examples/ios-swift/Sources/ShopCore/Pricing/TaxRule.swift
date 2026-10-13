import Foundation

/// Số tiền đã cộng VAT.
public struct TaxRule {
    public static let vatRate = 0.10

    public init() {}

    public func withTax(_ amount: Double) -> Double {
        (amount * (1 + Self.vatRate) * 100).rounded() / 100
    }
}
