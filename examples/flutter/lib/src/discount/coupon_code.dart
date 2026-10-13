final _pattern = RegExp(r'^[A-Z]{4}-\d{4}$');

/// Chuẩn hóa mã giảm giá: bỏ khoảng trắng hai đầu, đổi sang chữ hoa.
String normalizeCoupon(String raw) => raw.trim().toUpperCase();

/// Mã hợp lệ có dạng AAAA-9999 (không phân biệt hoa thường).
bool isValidCoupon(String raw) => _pattern.hasMatch(normalizeCoupon(raw));
