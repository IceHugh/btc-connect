import { createApp } from 'vue';
import './style.css';

import { BTCWalletPlugin } from '@btc-connect/vue';
import App from './App.vue';

const app = createApp(App);
app.use(BTCWalletPlugin, {
  autoConnect: true,
});
app.mount('#app');
