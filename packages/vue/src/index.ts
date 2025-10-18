// 上下文与组合式 API

// 组件
export * from './components';
export * from './composables';
// 类型导出
export * from './types';
// 工具函数导出
export * from './utils';
export * from './walletContext';

export const version = '0.1.0';

export const defaultConfig = {
  walletOrder: ['unisat', 'okx', 'xverse'],
  featuredWallets: ['unisat', 'okx'],
  theme: 'light' as const,
  animation: 'scale' as const,
  showTestnet: false,
  showRegtest: false,
  size: 'md' as const,
  variant: 'select' as const,
};

// 直接导出 SSR 友好的插件（命名导出）
export { BTCWalletPlugin } from './walletContext';
