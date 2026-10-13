# Ví dụ brownfield: Java Spring Boot

Dự án mẫu để thử agent `brownfield-unit-test`. Các "bẫy" có chủ đích:

| Thành phần | Mục đích kiểm tra |
|---|---|
| `PriceCalculatorTests` | Quy ước riêng: hậu tố `*Tests`, tên `given_when_then`, AssertJ, chú thích `// arrange/act/assert`. Agent phải theo đúng quy ước này. |
| `DiscountService` | Đơn vị dễ test, chưa có test: nhánh theo hạng, cộng thưởng, giới hạn 30% (PLATINUM 28% + thưởng 5% bị cắt còn 30%), lỗi khi thiếu id / không tìm thấy khách / số tiền âm. |
| `InvoiceExporter` | Phụ thuộc cứng (thời gian, file, HTTP). Agent phải đưa vào "Đơn vị bỏ qua" kèm gợi ý refactor, không sửa code. |
| `TaxRuleTests` | Test cũ **cố ý fail**. Agent phải giữ nguyên và báo là lỗi có sẵn. |

Chạy: `mvn test` (JDK 17+). Kết quả mong đợi trước khi dùng agent: 3 test chạy, chỉ `TaxRuleTests.givenAmount_whenWithTax_thenAddsVat` fail.

Gợi ý gọi agent: `scope=src/main/java/com/example/shop coverage-target=80`.
