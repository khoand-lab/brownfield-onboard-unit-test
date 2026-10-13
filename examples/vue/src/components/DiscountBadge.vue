<script setup lang="ts">
import { computed } from 'vue';

// AppButton được đăng ký toàn cục trong main.ts, không import ở đây.
const props = withDefaults(defineProps<{ rate: number; disabled?: boolean }>(), { disabled: false });
const emit = defineEmits<{ apply: [rate: number] }>();

const percent = computed(() => Math.round(props.rate * 100));
</script>

<template>
  <div v-if="rate > 0" class="discount-badge">
    <span class="badge">-{{ percent }}%</span>
    <AppButton :disabled="disabled" @click="emit('apply', rate)">Áp dụng</AppButton>
  </div>
</template>
