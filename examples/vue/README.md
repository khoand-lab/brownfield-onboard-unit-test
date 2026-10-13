# Ví dụ brownfield: Vue

Dự án mẫu để thử agent `brownfield-unit-test`. Vue 3.5 (`<script setup>`), Vite, TypeScript, Pinia 4, Vitest + jsdom + `@vue/test-utils` v2. Các "bẫy" có chủ đích:

| Thành phần | Mục đích kiểm tra |
|---|---|
| `tests/unit/pricing/price-calculator.spec.ts` | Quy ước riêng: test nằm trong `tests/unit/` (mô phỏng cấu trúc thư mục `src/`), hậu tố `.spec.ts`, import qua alias `@/`, dùng `describe`/`it`/`expect` **toàn cục** (`globals: true`, không import từ `vitest`), `describe('<TênPascal>')` rồi `describe('<hàm>()')`, tên `it('should ... when ...')` bằng tiếng Anh, chú thích `// given/when/then`. Không được đặt test cạnh file nguồn hay đổi `include`. |
| `package.json` script `test:unit` | Không có script `test`, và `test:unit` là `vitest` (chế độ watch). Agent phải chạy `npx vitest run`. |
| `tests/setup.ts` | Đăng ký `AppButton` toàn cục qua `config.global.components`. Agent không được đăng ký lại hay stub `AppButton` trong test mới, và không được sửa file setup. |
| Không có `@pinia/testing` | Agent không được tự thêm. Test store và component dùng `setActivePinia(createPinia())` (hoặc `global.plugins: [createPinia()]`) và mock module `@/api/customer-api`. |
| `src/discount/discount.ts` | Hàm thuần, chưa có test (giống ví dụ React): tỉ lệ theo hạng, thưởng ở biên 9/10 đơn, giới hạn 30% (PLATINUM 28% + 5% bị cắt còn 30%), hạng lạ → `RangeError`, số tiền âm/NaN → `RangeError`, làm tròn 2 chữ số. Số thực cần `toBeCloseTo`. |
| `src/stores/discount.ts` | Store Pinia (Options API) gọi API. Có nhánh id rỗng → `idle`, không tìm thấy khách, lỗi, getter `percent`, và bỏ kết quả cũ khi `load` được gọi lại với id khác (cần Promise do test điều khiển). Store phải được tạo mới cho mỗi test. |
| `src/composables/useCouponCode.ts` | Composable chỉ dùng `ref`/`computed`: gọi trực tiếp, không cần mount. Biên: chuỗi rỗng, khoảng trắng, chữ thường, sai định dạng, `reset()`. |
| `src/components/DiscountBadge.vue` | Component: `mount` với `props`, `wrapper.emitted('apply')`, `await trigger('click')`, `await setProps(...)`. Ẩn khi rate ≤ 0. Dùng `AppButton` toàn cục, nên `shallowMount` sẽ stub mất nút. |
| `src/components/CustomerDiscount.vue` | Component dùng store và `onMounted`: phải `await flushPromises()` sau khi mount (chỉ `nextTick` là chưa đủ). Lỗi hiện trong `role="alert"`; sau khi bấm "Áp dụng" thì nút bị khóa và hiện "Đã áp dụng giảm X%"; đổi `customerId` thì gọi lại và bỏ trạng thái đã áp dụng. |
| `src/api/customer-api.ts` | Gọi `fetch` toàn cục: stub bằng `vi.stubGlobal('fetch', ...)` và khôi phục sau test. Nhánh 404 → `null`, lỗi khác → throw, id được `encodeURIComponent`. |
| `src/invoice/exportInvoice.ts` | Phụ thuộc cứng (`new Date()`, DOM tạo link tải file, `localStorage`, `fetch` toàn cục). Agent nên đưa vào "Đơn vị bỏ qua" kèm gợi ý refactor, không sửa code. |
| `src/App.vue`, `src/main.ts`, `src/components/AppButton.vue` | Điểm lắp ráp và component trình bày đơn giản, không cần test riêng (`AppButton` được phủ gián tiếp qua `DiscountBadge`). |
| `tests/unit/pricing/tax-rule.spec.ts` | Test cũ **cố ý fail**. Agent phải giữ nguyên và báo là lỗi có sẵn. |
| `vite.config.ts` | Coverage chỉ có reporter `text`. Mặc định Vitest chỉ tính file được test import (cả `AppButton.vue` do file setup import), nên số "trước" không đại diện cho toàn `src`; muốn tính đủ thì truyền `--coverage.include='src/**/*.{ts,vue}'` qua dòng lệnh, không sửa cấu hình. |

Chạy (Node 20.19+):

```
npm install
npx vitest run
```

Kết quả mong đợi trước khi dùng agent: 3 test, 1 fail (`TaxRule > withTax() > should add VAT when amount is given`). Vì có test fail, Vitest chỉ in coverage khi thêm `--coverage.reportOnFailure`. Kiểm tra kiểu: `npx vue-tsc --noEmit`.

Gợi ý gọi agent: `scope=src coverage-target=80`.
