import Foundation

public protocol CustomerAPI {
    /// Trả về nil khi không tìm thấy khách hàng.
    func fetchCustomer(id: String) async throws -> Customer?
}

public enum CustomerAPIError: Error, Equatable {
    case badStatus(Int)
}

/// Triển khai thật bằng URLSession; session được tiêm qua init.
public final class HTTPCustomerAPI: CustomerAPI {
    private let baseURL: URL
    private let session: URLSession

    public init(baseURL: URL, session: URLSession = .shared) {
        self.baseURL = baseURL
        self.session = session
    }

    public func fetchCustomer(id: String) async throws -> Customer? {
        let url = baseURL.appendingPathComponent("customers").appendingPathComponent(id)
        let (data, response) = try await session.data(from: url)
        let status = (response as? HTTPURLResponse)?.statusCode ?? 0
        if status == 404 {
            return nil
        }
        guard status == 200 else {
            throw CustomerAPIError.badStatus(status)
        }
        return try JSONDecoder().decode(Customer.self, from: data)
    }
}
