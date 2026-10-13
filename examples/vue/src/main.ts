import { createPinia } from 'pinia';
import { createApp } from 'vue';

import App from './App.vue';
import AppButton from './components/AppButton.vue';

createApp(App).use(createPinia()).component('AppButton', AppButton).mount('#app');
