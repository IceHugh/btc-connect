// 上下文与组合式 API
export * from './walletContext';
export * from './composables';

// 组件
export * from './components';

// 工具 & 类型复用（按需透出 shared 类型/工具）
export { formatAddress } from '@btc-connect/shared';

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



