/**
 * BTC Connect Plugin for Nuxt 3
 *
 * 这个插件确保BTC Connect只在客户端初始化，避免SSR问题
 */

import { BTCWalletPlugin, ConnectButton, WalletModal } from '@btc-connect/vue';
import { defineNuxtPlugin } from '#app';

export default defineNuxtPlugin((nuxtApp) => {
  // 只在客户端初始化BTC Connect
  if (process.client) {
    // 注册插件
    nuxtApp.vueApp.use(BTCWalletPlugin, {
      autoConnect: true,
      theme: 'light',
    });

    // 全局注册组件
    nuxtApp.vueApp.component('ConnectButton', ConnectButton);
    nuxtApp.vueApp.component('WalletModal', WalletModal);
  }
});
