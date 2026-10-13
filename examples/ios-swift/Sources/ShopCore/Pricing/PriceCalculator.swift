import Foundation

public enum PriceError: Error, Equatable {
    case invalidQuantity
}

/// Thành tiền một dòng hàng.
public struct PriceCalculator {
    public init() {}

    public func lineTotal(unitPrice: Double, quantity: Int) throws -> Double {
        guard quantity > 0 else {
            throw PriceError.invalidQuantity
        }
        return unitPrice * Double(quantity)
    }
}
