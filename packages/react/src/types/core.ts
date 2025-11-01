// 重新导出 @btc-connect/core 的类型，避免外部依赖
export type {
  AccountInfo,
  AvailableWalletsEventParams,
  BalanceDetail,
  ConnectionStatus,
  ModalConfig,
  Network,
  WalletDetectedEventParams,
  WalletDetectionCompleteEventParams,
  WalletEvent,
  WalletInfo,
  WalletManagerConfig,
  WalletState,
  ZIndexStrategy,
  ZIndexValue,
} from '@btc-connect/core';

export { BTCWalletManager } from '@btc-connect/core';
