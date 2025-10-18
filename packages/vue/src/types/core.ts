// 重新导出 @btc-connect/core 的类型，避免外部依赖
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
