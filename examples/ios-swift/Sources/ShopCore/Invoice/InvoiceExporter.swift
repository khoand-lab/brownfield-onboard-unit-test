import Foundation

/// Xuất hóa đơn ra file và gửi lên hệ thống kế toán.
/// Phụ thuộc cứng vào thời gian hệ thống, FileManager.default, UserDefaults.standard và URLSession.shared
/// (không truyền vào được): khó unit test.
public final class InvoiceExporter {
    private let accountingURL = URL(string: "http://accounting.internal/api/invoices")!

    public init() {}

    public func export(orderID: String, total: Double) async throws -> String {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.dateFormat = "yyyyMMddHHmmss"
        let fileName = "invoice-\(orderID)-\(formatter.string(from: Date())).txt"

        let directory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        try "\(orderID);\(total)".write(to: directory.appendingPathComponent(fileName), atomically: true, encoding: .utf8)

        var request = URLRequest(url: accountingURL)
        request.httpMethod = "POST"
        request.httpBody = Data(fileName.utf8)
        let (_, response) = try await URLSession.shared.data(for: request)
        let status = (response as? HTTPURLResponse)?.statusCode ?? 0
        guard status == 200 else {
            throw NSError(domain: "accounting", code: status)
        }

        UserDefaults.standard.set(fileName, forKey: "lastInvoice")
        return fileName
    }
}
