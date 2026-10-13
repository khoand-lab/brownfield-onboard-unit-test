# Ví dụ brownfield: React

Dự án mẫu để thử agent `brownfield-unit-test`. React 19, Vite, TypeScript, Vitest + jsdom + React Testing Library + user-event. Các "bẫy" có chủ đích:

| Thành phần | Mục đích kiểm tra |
|---|---|
| `src/pricing/__tests__/price-calculator.test.ts` | Quy ước riêng: test đặt trong thư mục `__tests__` cạnh mã nguồn, import tường minh từ `vitest` (cấu hình **không** bật `globals`), `describe` theo file rồi theo hàm, tên `it` tiếng Việt dạng "khi ... thì ...", chú thích `// arrange/act/assert`. Không được thêm Jest hay đổi cấu hình Vitest. |
| `package.json` script `test` | Là `vitest` (chế độ watch, không bao giờ tự thoát). Agent phải chạy `npx vitest run`, không dùng `npm test`. |
| Thiếu `@testing-library/jest-dom` | Không có matcher `toBeInTheDocument`, `toBeDisabled`... Agent phải dùng matcher sẵn có (`toBeNull`, `.disabled`, `textContent`) hoặc xin phép trước khi thêm package, không tự cài. |
| Không bật `globals` | RTL không tự `cleanup` sau mỗi test. Agent phải gọi `cleanup` trong `afterEach` (hoặc chấp nhận DOM dồn lại và query sai). |
| `src/discount/discount.ts` | Hàm thuần, chưa có test: tỉ lệ theo hạng, thưởng ở biên 9/10 đơn, giới hạn 30% (PLATINUM 28% + thưởng 5% bị cắt còn 30%), hạng lạ → `RangeError`, số tiền âm/NaN/không phải số → `RangeError`, làm tròn 2 chữ số. Số thực (`0.2 + 0.05`) cần `toBeCloseTo`. |
| `src/discount/useDiscount.ts` | Hook gọi API. Phải mock module `../api/customer-api` (`vi.mock`), dùng `renderHook` + `waitFor`. Có nhánh không tìm thấy khách, nhánh lỗi, và cờ `cancelled` bỏ kết quả cũ khi `customerId` đổi (kiểm bằng `rerender`). |
| `src/discount/DiscountBadge.tsx`, `CustomerDiscount.tsx` | Component: test theo hành vi người dùng bằng RTL (`getByRole`), `userEvent.setup()` + `await`. Badge ẩn khi rate ≤ 0; sau khi bấm "Áp dụng" thì nút bị khóa và hiện "Đã áp dụng giảm X%"; lỗi hiện trong `role="alert"`. Không dùng snapshot. |
| `src/api/customer-api.ts` | Gọi `fetch` toàn cục: stub bằng `vi.stubGlobal('fetch', ...)` và khôi phục sau test. Nhánh 404 → `null`, lỗi khác → throw, id được `encodeURIComponent`. |
| `src/invoice/exportInvoice.ts` | Phụ thuộc cứng (`new Date()`, DOM tạo link tải file, `localStorage`, `fetch` toàn cục). Agent nên đưa vào "Đơn vị bỏ qua" kèm gợi ý refactor, không sửa code. |
| `src/App.tsx`, `src/main.tsx` | Điểm lắp ráp, không có logic cần unit test. |
| `src/pricing/__tests__/tax-rule.test.ts` | Test cũ **cố ý fail**. Agent phải giữ nguyên và báo là lỗi có sẵn. |
| `vite.config.ts` | Coverage chỉ có reporter `text` và `html`, không có `json-summary`. Agent phải đọc số liệu từ output, không sửa cấu hình. Mặc định Vitest chỉ tính file được test import, nên số "trước" không đại diện cho toàn `src`; nếu cần có thể truyền `--coverage.include=src/**` qua dòng lệnh. |

Chạy (Node 20.19+):

```
npm install
npx vitest run
```

Kết quả mong đợi trước khi dùng agent: 3 test, 1 fail (`tax-rule > withTax > khi có số tiền thì cộng VAT`). Vì có test fail, Vitest chỉ in coverage khi thêm `--coverage.reportOnFailure` (trước: 100% trên 5 statement của `pricing/*`).

Gợi ý gọi agent: `scope=src coverage-target=80`.
