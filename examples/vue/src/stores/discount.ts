import { defineStore } from 'pinia';

import { fetchCustomer } from '@/api/customer-api';
import { discountRate } from '@/discount/discount';

type Status = 'idle' | 'loading' | 'ready' | 'error';

/** Tải khách hàng và tính tỉ lệ giảm giá. Bỏ qua kết quả cũ khi load được gọi lại với id khác. */
export const useDiscountStore = defineStore('discount', {
  state: () => ({
    status: 'idle' as Status,
    customerId: undefined as string | undefined,
    rate: 0,
    message: '',
  }),
  getters: {
    percent: (state) => Math.round(state.rate * 100),
  },
  actions: {
    async load(customerId: string | undefined) {
      this.customerId = customerId;
      if (!customerId) {
        this.$patch({ status: 'idle', rate: 0, message: '' });
        return;
      }
      this.status = 'loading';
      try {
        const customer = await fetchCustomer(customerId);
        if (this.customerId !== customerId) return;
        if (!customer) {
          this.$patch({ status: 'error', message: 'Không tìm thấy khách hàng' });
          return;
        }
        this.$patch({ status: 'ready', rate: discountRate(customer), message: '' });
      } catch (error: unknown) {
        if (this.customerId !== customerId) return;
        this.$patch({ status: 'error', message: error instanceof Error ? error.message : String(error) });
      }
    },
  },
});
