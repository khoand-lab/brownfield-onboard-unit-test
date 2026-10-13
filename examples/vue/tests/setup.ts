import { config } from '@vue/test-utils';

import AppButton from '@/components/AppButton.vue';

// Đăng ký component toàn cục giống main.ts.
config.global.components = { AppButton };
