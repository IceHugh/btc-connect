// 类型定义

// 适配器
export {
  BaseWalletAdapter,
  createAdapter,
  getAllAdapters,
  getAvailableAdapters,
  OKXAdapter,
  UniSatAdapter,
  XverseAdapter,
} from './adapters';

// 事件系统
export { EventEmitter, WalletEventManager } from './events';
// 管理器
export { BTCWalletManager } from './managers';
export type * from './types';
export { createWalletManager, defaultWalletManager } from './utils';
