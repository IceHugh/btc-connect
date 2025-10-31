/**
 * BTC Connect Plugin for Nuxt 3
 *
 * 这个插件确保BTC Connect只在客户端初始化，避免SSR问题
 */

import { BTCWalletPlugin, ConnectButton } from '@btc-connect/vue';
import { defineNuxtPlugin } from '#app';

export default defineNuxtPlugin((nuxtApp) => {
  // 只在客户端初始化BTC Connect
  if (process.client) {
    // 注册插件
    nuxtApp.vueApp.use(BTCWalletPlugin, {
      connectTimeout: 10000,
      theme: 'light',
      config: {
        onStateChange: (state) => {
          console.log('Wallet state changed:', state);
        }
      }
    });

    // 全局注册组件 (WalletModal 已集成到 ConnectButton 中)
    nuxtApp.vueApp.component('ConnectButton', ConnectButton);
  }
});
