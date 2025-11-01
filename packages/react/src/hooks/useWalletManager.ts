import type {
  BTCWalletAdapter,
  UseWalletManagerReturn,
  WalletState,
} from '@btc-connect/core';
import { useCallback, useMemo } from 'react';
import { useWalletContext } from '../context/provider';

/**
 * 访问和管理钱包适配器的 Hook
 *
 * 提供对底层钱包管理器的直接访问，用于高级用例
 *
 * @example
 * ```tsx
 * function WalletManagerExample() {
 *   const {
 *     currentAdapter,
 *     availableAdapters,
 *     adapterStates,
 *     getAdapter,
 *     addAdapter,
 *     removeAdapter,
 *     manager
 *   } = useWalletManager();
 *
 *   // 获取特定适配器
 *   const unisatAdapter = getAdapter('unisat');
 *
 *   // 检查适配器状态
 *   const adapterState = adapterStates['unisat'];
 *
 *   // 直接使用管理器
 *   const handleDirectConnect = async () => {
 *     if (manager) {
 *       const accounts = await manager.connect('unisat');
 *       console.log('Connected:', accounts);
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <p>Current Adapter: {currentAdapter?.name}</p>
 *       <p>Available Adapters: {availableAdapters.length}</p>
 *       <button onClick={handleDirectConnect}>
 *         Direct Connect
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useWalletManager(): UseWalletManagerReturn {
  const { manager, currentWallet } = useWalletContext();

  // 获取当前适配器
  const currentAdapter = useMemo(() => {
    if (!manager || !currentWallet) return null;
    return manager.getCurrentAdapter() || null;
  }, [manager, currentWallet]);

  // 获取所有可用适配器
  const availableAdapters = useMemo(() => {
    if (!manager) return [];
    return manager.getAllAdapters();
  }, [manager]);

  // 获取所有适配器状态
  const adapterStates = useMemo<Record<string, WalletState>>(() => {
    if (!manager) return {};

    const states: Record<string, WalletState> = {};
    const adapters = manager.getAllAdapters();

    adapters.forEach((adapter) => {
      states[adapter.id] = adapter.getState();
    });

    return states;
  }, [manager]);

  // 获取特定适配器
  const getAdapter = useCallback(
    (walletId: string): BTCWalletAdapter | null => {
      if (!manager) return null;
      return manager.getAdapter(walletId);
    },
    [manager],
  );

  // 添加适配器
  const addAdapter = useCallback(
    (adapter: BTCWalletAdapter): void => {
      if (!manager) {
        console.warn('useWalletManager: manager not available');
        return;
      }
      manager.register(adapter);
    },
    [manager],
  );

  // 移除适配器
  const removeAdapter = useCallback(
    (walletId: string): void => {
      if (!manager) {
        console.warn('useWalletManager: manager not available');
        return;
      }
      manager.unregister(walletId);
    },
    [manager],
  );

  return {
    currentAdapter,
    availableAdapters,
    adapterStates,
    getAdapter,
    addAdapter,
    removeAdapter,
    manager: manager || ({} as any), // 提供默认值避免 undefined
  };
}
