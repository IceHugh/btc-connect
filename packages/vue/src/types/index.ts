// 重新导出核心类型
export type {
  AccountInfo,
  BalanceDetail,
  ConnectionStatus,
  Network,
  WalletEvent,
  WalletInfo,
  WalletManagerConfig,
  WalletState,
} from '@btc-connect/core';

export { BTCWalletManager } from '@btc-connect/core';

// Vue 特定类型
export type ThemeMode = 'light' | 'dark' | 'auto';
