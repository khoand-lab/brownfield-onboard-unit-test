import Combine
import Foundation

/// Tải khách hàng và tính tỉ lệ giảm giá. Kết quả của lần tải cũ bị bỏ qua khi load được gọi lại với id khác.
@MainActor
public final class DiscountViewModel: ObservableObject {
    public enum State: Equatable {
        case idle
        case loading
        case ready(rate: Double)
        case error(message: String)
    }

    @Published public private(set) var state: State = .idle

    private let api: CustomerAPI
    private let calculator: DiscountCalculator
    private var currentID: String?

    public init(api: CustomerAPI, calculator: DiscountCalculator = DiscountCalculator()) {
        self.api = api
        self.calculator = calculator
    }

    public func load(customerID: String?) async {
        currentID = customerID
        guard let id = customerID, !id.trimmingCharacters(in: .whitespaces).isEmpty else {
            state = .idle
            return
        }
        state = .loading
        do {
            let customer = try await api.fetchCustomer(id: id)
            guard currentID == id else { return }
            if let customer {
                state = .ready(rate: calculator.rate(for: customer))
            } else {
                state = .error(message: "Không tìm thấy khách hàng")
            }
        } catch {
            guard currentID == id else { return }
            state = .error(message: String(describing: error))
        }
    }
}
