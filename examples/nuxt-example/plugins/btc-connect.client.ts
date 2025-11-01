/**
 * BTC Connect Plugin for Nuxt 3
 *
 * 这个插件确保BTC Connect只在客户端初始化，避免SSR问题
 */

import type { WalletState } from '@btc-connect/vue';
import { BTCWalletPlugin, ConnectButton } from '@btc-connect/vue';
import { defineNuxtPlugin } from '#app';

export default defineNuxtPlugin((nuxtApp) => {
  // 只在客户端初始化BTC Connect
  if (process.client) {
    // 注册插件
    nuxtApp.vueApp.use(BTCWalletPlugin, {
      connectTimeout: 15000, // 增加超时时间确保钱包检测完成
      theme: 'auto', // 自动主题切换
      autoConnect: true, // 启用自动连接
      config: {
        onStateChange: (state: WalletState) => {
          console.log('✅ [NuxtPlugin] State changed:', state.status);
        },
        onError: (error: Error) => {
          console.error('❌ [NuxtPlugin] Wallet error:', error);
        },
      },
    });

    // 全局注册组件 (WalletModal 已集成到 ConnectButton 中)
    nuxtApp.vueApp.component('ConnectButton', ConnectButton);
  }
});
