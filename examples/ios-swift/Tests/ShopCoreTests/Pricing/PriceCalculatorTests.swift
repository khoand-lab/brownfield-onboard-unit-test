import XCTest
@testable import ShopCore

final class PriceCalculatorTests: XCTestCase {
    private var sut: PriceCalculator!

    override func setUp() {
        super.setUp()
        sut = PriceCalculator()
    }

    override func tearDown() {
        sut = nil
        super.tearDown()
    }

    func test_lineTotal_whenQuantityIsPositive_multipliesUnitPrice() throws {
        // Given
        let unitPrice = 25.0

        // When
        let total = try sut.lineTotal(unitPrice: unitPrice, quantity: 4)

        // Then
        XCTAssertEqual(total, 100, accuracy: 0.0001)
    }

    func test_lineTotal_whenQuantityIsZero_throwsInvalidQuantity() {
        // When / Then
        XCTAssertThrowsError(try sut.lineTotal(unitPrice: 25, quantity: 0)) { error in
            XCTAssertEqual(error as? PriceError, .invalidQuantity)
        }
    }
}
