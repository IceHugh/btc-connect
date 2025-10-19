import { BTCWalletManager } from '../managers';
import type { WalletManagerConfig } from '../types';
export { ZIndexManager } from './z-index-manager';

/**
 * 创建钱包管理器的工厂函数
 */
export function createWalletManager(
  config?: WalletManagerConfig,
): BTCWalletManager {
  return new BTCWalletManager(config);
}

/**
 * 默认的钱包管理器实例
 */
export const defaultWalletManager = createWalletManager();

/**
 * 获取默认钱包管理器
 */
export function getDefaultWalletManager(): BTCWalletManager {
  return defaultWalletManager;
}
