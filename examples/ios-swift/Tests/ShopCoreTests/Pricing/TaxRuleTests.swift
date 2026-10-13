import XCTest
@testable import ShopCore

final class TaxRuleTests: XCTestCase {
    func test_withTax_whenAmountIsGiven_addsVat() {
        // Given
        let amount = 100.0

        // When
        let total = TaxRule().withTax(amount)

        // Then
        XCTAssertEqual(total, 108, accuracy: 0.0001)
    }
}
