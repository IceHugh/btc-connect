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
  ModalConfig,
  ZIndexStrategy,
  ZIndexValue,
} from '@btc-connect/core';

export { BTCWalletManager } from '@btc-connect/core';
