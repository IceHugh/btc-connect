import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import { BTCWalletPlugin } from '@btc-connect/vue'

const app = createApp(App)
app.use(BTCWalletPlugin, {
  autoConnect: true,
})
app.mount('#app')
