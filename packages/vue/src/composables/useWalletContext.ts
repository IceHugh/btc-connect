/**
 * 钱包上下文管理 Composable
 *
 * 这个模块提供了两种使用方式：
 * 1. useWalletContext() - 向后兼容，支持全局状态回退
 * 2. useProvidedWalletContext() - 推荐方式，严格使用 Vue provide/inject
 */

import { ref, computed } from 'vue';
import { useWalletContext as useWalletContextLegacy, useProvidedWalletContext } from '../walletContext';
import type { WalletContext } from '../walletContext';

/**
 * 推荐的钱包上下文 Hook - 严格使用 Vue provide/inject 系统
 *
 * 优点：
 * - 避免全局状态污染
 * - 支持多个 Vue 应用实例
 * - 更好的 SSR 兼容性
 * - 更容易测试
 *
 * 使用方法：
 * ```typescript
 * import { useWalletProvider } from '@btc-connect/vue';
 *
 * const { isConnected, connect } = useWalletProvider();
 * ```
 *
 * @throws {Error} 如果在 BTCWalletPlugin 外使用
 */
export function useWalletProvider(): WalletContext {
  return useProvidedWalletContext();
}

/**
 * 兼容模式的钱包上下文 Hook - 支持全局状态回退
 *
 * 这个方法会首先尝试从 Vue inject 系统获取上下文，
 * 如果获取不到，会回退到全局状态（向后兼容）。
 *
 * 使用方法：
 * ```typescript
 * import { useWalletContext } from '@btc-connect/vue';
 *
 * const context = useWalletContext();
 * ```
 *
 * @deprecated 推荐使用 useWallet() 来获得更好的类型安全和架构
 */
export function useWalletContext(): WalletContext {
  return useWalletContextLegacy();
}

/**
 * 安全模式的钱包上下文 Hook - 不会抛出错误
 *
 * 如果插件未安装，返回一个空的安全上下文而不是抛出错误。
 * 适用于可选钱包功能的场景。
 *
 * 使用方法：
 * ```typescript
 * import { useWalletSafe } from '@btc-connect/vue';
 *
 * const { isConnected, connect } = useWalletSafe();
 * if (isConnected.value) {
 *   // 钱包功能可用
 * } else {
 *   // 钱包功能不可用，显示提示信息
 * }
 * ```
 */
export function useWalletSafe(): WalletContext {
  try {
    return useProvidedWalletContext();
  } catch (error) {
    console.warn('BTCWalletPlugin not found, using safe fallback context:', error);

    // 返回一个安全的空上下文
    return createSafeFallbackContext();
  }
}

// 创建安全的回退上下文
function createSafeFallbackContext(): WalletContext {
  return {
    manager: ref(null),
    state: computed(() => ({
      status: 'disconnected' as const,
      accounts: [],
      currentAccount: undefined,
      network: 'livenet' as const,
      error: undefined,
    })),
    currentWallet: computed(() => null),
    availableWallets: ref([]),
    isConnected: computed(() => false),
    isConnecting: computed(() => false),
    isModalOpen: ref(false),
    theme: computed(() => 'light' as const),

    connect: async () => {
      throw new Error('Wallet plugin not installed');
    },
    disconnect: async () => {},
    switchWallet: async () => {
      throw new Error('Wallet plugin not installed');
    },
    openModal: () => {},
    closeModal: () => {},
    toggleModal: () => {},

    _stateUpdateTrigger: ref(0),
  };
}

// 类型导出
export type { WalletContext } from '../walletContext';