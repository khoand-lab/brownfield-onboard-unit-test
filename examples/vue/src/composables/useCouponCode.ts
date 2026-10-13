import { computed, ref } from 'vue';

const CODE_PATTERN = /^[A-Z]{4}-\d{4}$/;

/** Ô nhập mã giảm giá: chuẩn hóa chữ hoa, bỏ khoảng trắng và kiểm tra định dạng AAAA-9999. */
export function useCouponCode(initial = '') {
  const raw = ref(initial);
  const code = computed(() => raw.value.trim().toUpperCase());
  const isValid = computed(() => CODE_PATTERN.test(code.value));
  const error = computed(() => {
    if (code.value === '') return 'Vui lòng nhập mã';
    return isValid.value ? '' : 'Mã không đúng định dạng';
  });

  function reset() {
    raw.value = '';
  }

  return { raw, code, isValid, error, reset };
}
