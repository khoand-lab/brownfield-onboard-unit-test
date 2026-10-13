# Ví dụ brownfield: Node.js

Dự án mẫu để thử agent `brownfield-unit-test`. CommonJS, Jest 29, không dùng TypeScript. Các "bẫy" có chủ đích:

| Thành phần | Mục đích kiểm tra |
|---|---|
| `test/pricing/price-calculator.spec.js` | Quy ước riêng: test nằm trong `test/` lặp cấu trúc `src/`, hậu tố `.spec.js`, `describe` theo module rồi theo hàm, tên `it` tiếng Việt dạng "khi ... thì ...", chú thích `// arrange/act/assert`. Agent phải theo đúng quy ước này. Jest chỉ tìm `test/**/*.spec.js` (`testMatch` trong `package.json`), nên file đặt cạnh mã nguồn sẽ không chạy. |
| `src/discount/discount-service.js` | Đơn vị dễ test, chưa có test, **bất đồng bộ**: repository tiêm qua constructor cần được giả lập; nhánh theo hạng, thưởng ở biên 9/10 đơn, giới hạn 30% (PLATINUM 28% + thưởng 5% bị cắt còn 30%), lỗi khi thiếu id / không tìm thấy khách / hạng lạ / số tiền âm. Assertion lỗi bất đồng bộ phải có `await`. Số thực (`0.2 + 0.05`) cần `toBeCloseTo`. |
| `src/invoice/invoice-exporter.js` | Phụ thuộc cứng (thời gian, file, `fetch`). Agent phải đưa vào "Đơn vị bỏ qua" kèm gợi ý refactor, không sửa code. |
| `src/discount/customer-repository.js`, `src/index.js` | Truy cập DB thật và điểm lắp ráp, không có logic cần unit test. |
| `test/pricing/tax-rule.spec.js` | Test cũ **cố ý fail**. Agent phải giữ nguyên và báo là lỗi có sẵn. |

Chạy: `npm install` rồi `npm test` (Node 18+). Kết quả mong đợi trước khi dùng agent: 3 test chạy, chỉ `tax-rule › withTax › khi có số tiền thì cộng VAT` fail.

Gợi ý gọi agent: `scope=src coverage-target=80`.
