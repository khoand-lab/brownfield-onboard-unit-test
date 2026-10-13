<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

import { useDiscountStore } from '@/stores/discount';

import DiscountBadge from './DiscountBadge.vue';

/** Hiển thị giảm giá của khách hàng; sau khi áp dụng thì khóa nút. */
const props = defineProps<{ customerId: string }>();
const store = useDiscountStore();
const appliedRate = ref<number | null>(null);

onMounted(() => store.load(props.customerId));
watch(
  () => props.customerId,
  (id) => {
    appliedRate.value = null;
    store.load(id);
  },
);
</script>

<template>
  <p v-if="store.status === 'idle' || store.status === 'loading'">Đang tải...</p>
  <p v-else-if="store.status === 'error'" role="alert">{{ store.message }}</p>
  <section v-else>
    <DiscountBadge :rate="store.rate" :disabled="appliedRate !== null" @apply="appliedRate = $event" />
    <p v-if="appliedRate !== null" class="applied">Đã áp dụng giảm {{ Math.round(appliedRate * 100) }}%</p>
  </section>
</template>
