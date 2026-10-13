# Ví dụ brownfield: Angular

Dự án mẫu để thử agent `brownfield-unit-test`. Angular 22, standalone component, **zoneless** (không có zone.js), signal input/output, Karma + Jasmine qua builder `@angular/build:karma`. Các "bẫy" có chủ đích:

| Thành phần | Mục đích kiểm tra |
|---|---|
| `src/app/pricing/price-calculator.spec.ts` | Quy ước riêng: spec đặt cạnh file nguồn, `describe` theo file rồi theo hàm, tên `it` tiếng Việt dạng "khi ... thì ...", chú thích `// arrange/act/assert`. Runner là Jasmine: không được dùng `jest.fn`/`vi.fn`, không thêm Jest/Vitest, `@testing-library/angular` hay `ng-mocks`. |
| `src/app/discount/discount.service.ts` | Đơn vị dễ test, chưa có test, trả về **Observable**. Dùng `inject()` trong field nên không khởi tạo được bằng `new`: phải dùng `TestBed` và provide `CustomerRepository` giả (`jasmine.createSpyObj`). Nhánh theo hạng, thưởng ở biên 9/10 đơn, giới hạn 30% (PLATINUM 28% + thưởng 5% bị cắt còn 30%), lỗi khi thiếu id / không tìm thấy khách / hạng lạ / số tiền âm hoặc NaN. Lỗi phát qua kênh error của Observable, không ném đồng bộ. Số thực (`0.2 + 0.05`) cần `toBeCloseTo`. |
| `src/app/discount/customer-repository.ts` | Gọi API qua `HttpClient`, có nhánh 404 → `null`. Test được bằng `provideHttpClient()` + `provideHttpClientTesting()` + `HttpTestingController` (có `verify()`), không gọi mạng thật. |
| `src/app/discount/discount-badge.component.ts` | Component standalone dùng `input.required()`, `input()`, `output()` và `computed`. Phải gán input bằng `fixture.componentRef.setInput`, cập nhật DOM bằng `await fixture.whenStable()`/`detectChanges()`. Dự án zoneless nên không dùng được `fakeAsync`. |
| `src/app/invoice/invoice-exporter.service.ts` | Phụ thuộc cứng (`new Date()`, DOM tạo link tải file, `localStorage`, `fetch` toàn cục). Agent phải đưa vào "Đơn vị bỏ qua" kèm gợi ý refactor, không sửa code. |
| `src/app/app.config.ts`, `src/app/app.component.ts`, `src/main.ts` | Điểm lắp ráp, không có logic cần unit test. |
| `src/app/pricing/tax-rule.spec.ts` | Test cũ **cố ý fail**. Agent phải giữ nguyên và báo là lỗi có sẵn. |
| `karma.conf.js` | Coverage chỉ xuất HTML và `text-summary`, không có `coverage-summary.json`. Agent phải đọc số liệu từ output, không sửa cấu hình. Coverage của Angular chỉ tính file được biên dịch trong bộ test, nên số "trước" (100% trên 5 statement) không đại diện cho toàn `src`; agent phải ghi rõ điều này. |

Chạy (Node 20.19+, cần Chrome hoặc đặt `CHROME_BIN` tới Chromium/Edge):

```
npm install
npx ng test --watch=false --browsers=ChromeHeadless
```

Kết quả mong đợi trước khi dùng agent: `Executed 3 of 3 (1 FAILED)`, chỉ `tax-rule withTax khi có số tiền thì cộng VAT` fail.

Gợi ý gọi agent: `scope=src/app coverage-target=80`.
