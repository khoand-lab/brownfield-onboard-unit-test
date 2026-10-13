<script setup lang="ts">
defineProps<{ disabled?: boolean }>();
defineEmits<{ click: [] }>();
</script>

<template>
  <button type="button" class="app-button" :disabled="disabled" @click="$emit('click')">
    <slot />
  </button>
</template>
