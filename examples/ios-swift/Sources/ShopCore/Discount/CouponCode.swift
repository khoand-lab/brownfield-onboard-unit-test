import Foundation

/// Kiểm tra mã giảm giá định dạng AAAA-9999 (không phân biệt hoa thường, bỏ khoảng trắng hai đầu).
public enum CouponCode {
    public static func normalize(_ raw: String) -> String {
        raw.trimmingCharacters(in: .whitespacesAndNewlines).uppercased()
    }

    public static func isValid(_ raw: String) -> Bool {
        normalize(raw).range(of: "^[A-Z]{4}-[0-9]{4}$", options: .regularExpression) != nil
    }
}
