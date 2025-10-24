// 类型定义

// 适配器
export {
  BaseWalletAdapter,
  createAdapter,
  detectAvailableWallets,
  getAllAdapters,
  getAvailableAdapters,
  getAvailableWalletsWithRetry,
  OKXAdapter,
  UniSatAdapter,
  type WalletDetectionConfig,
  type WalletDetectionResult,
  XverseAdapter,
} from './adapters';
// 缓存系统
export {
  CacheKeyBuilder,
  CacheManager,
  CachePresets,
  cached,
  conditionalCached,
  createCache,
  getCacheManager,
  invalidateCache,
  MemoryCache,
  smartCached,
} from './cache';
// 事件系统
export { EventEmitter, WalletEventManager } from './events';

// 管理器
export { BTCWalletManager } from './managers';
export type * from './types';
export {
  createWalletManager,
  defaultWalletManager,
} from './utils';

// 错误处理
export {
  ErrorRecoveryStrategy,
  ErrorReporter,
  WalletErrorHandler,
} from './utils/error-handler';
