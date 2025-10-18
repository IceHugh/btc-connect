// 重新导出核心类型
export type {
  WalletState,
  WalletInfo,
  AccountInfo,
  Network,
  BalanceDetail,
  ConnectionStatus,
  WalletEvent,
  WalletManagerConfig
} from '@btc-connect/core';

export { BTCWalletManager } from '@btc-connect/core';

// Vue 特定类型
export type ThemeMode = 'light' | 'dark' | 'auto';