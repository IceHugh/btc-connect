import type {
  BTCWalletAdapter,
  UseWalletManagerReturn,
  WalletState,
} from '@btc-connect/core';
import { computed, ref } from 'vue';
import { useWalletContext } from '../walletContext';

/**
 * 钱包管理器 Composable
 *
 * 提供对底层钱包管理器的直接访问，包括适配器管理、状态监控等高级功能
 *
 * @example
 * ```vue
 * <script setup>
 * import { useWalletManager } from '@btc-connect/vue';
 *
 * const {
 *   currentAdapter,
 *   availableAdapters,
 *   adapterStates,
 *   getAdapter,
 *   addAdapter,
 *   removeAdapter,
 *   manager
 * } = useWalletManager();
 *
 * // 获取 UniSat 适配器
 * const unisatAdapter = getAdapter('unisat');
 *
 * // 添加自定义适配器
 * const addCustomAdapter = () => {
 *   const customAdapter = createMyCustomAdapter();
 *   addAdapter(customAdapter);
 * };
 *
 * // 监听管理器状态变化
 * watch(manager, (newManager) => {
 *   if (newManager) {
 *     console.log('管理器已初始化:', newManager);
 *   }
 * });
 * </script>
 * ```
 */
export function useWalletManager(): UseWalletManagerReturn {
  const ctx = useWalletContext();
  const customAdapters = ref<BTCWalletAdapter[]>([]);

  // 当前激活的适配器
  const currentAdapter = computed(() => {
    if (!ctx.manager.value || !ctx.currentWallet.value) {
      return null;
    }
    return ctx.manager.value.getAdapter(ctx.currentWallet.value.id);
  });

  // 所有可用适配器（内置 + 自定义）
  const availableAdapters = computed(() => {
    if (!ctx.manager.value) {
      return [];
    }

    // 由于 getAdapters 方法不存在，我们使用已知的钱包列表
    const builtInAdapters: BTCWalletAdapter[] = [];
    const walletIds = ['unisat', 'okx', 'xverse'];

    walletIds.forEach((walletId) => {
      const adapter = ctx.manager.value?.getAdapter(walletId);
      if (adapter) {
        builtInAdapters.push(adapter);
      }
    });

    return [...builtInAdapters, ...customAdapters.value];
  });

  // 适配器状态映射
  const adapterStates = computed(() => {
    const states: Record<string, WalletState> = {};

    if (!ctx.manager.value) {
      return states;
    }

    // 获取所有已知适配器的状态
    const walletIds = ['unisat', 'okx', 'xverse'];
    walletIds.forEach((walletId) => {
      const adapter = ctx.manager.value?.getAdapter(walletId);
      if (adapter) {
        try {
          if (adapter.isReady()) {
            states[adapter.id] = adapter.getState();
          }
        } catch (error) {
          console.warn(`Failed to get state for adapter ${adapter.id}:`, error);
          states[adapter.id] = {
            status: 'disconnected',
            accounts: [],
            network: 'livenet',
            error: null,
          };
        }
      }
    });

    // 包含自定义适配器的状态
    customAdapters.value.forEach((adapter) => {
      try {
        if (adapter.isReady()) {
          states[adapter.id] = adapter.getState();
        }
      } catch (error) {
        console.warn(
          `Failed to get state for custom adapter ${adapter.id}:`,
          error,
        );
        states[adapter.id] = {
          status: 'disconnected',
          accounts: [],
          network: 'livenet',
          error: null,
        };
      }
    });

    return states;
  });

  // 获取特定适配器
  const getAdapter = (walletId: string): BTCWalletAdapter | null => {
    if (!ctx.manager.value) {
      return null;
    }

    // 查找内置适配器
    const adapter = ctx.manager.value.getAdapter(walletId);
    if (adapter) {
      return adapter;
    }

    // 查找自定义适配器
    return customAdapters.value.find((a) => a.id === walletId) || null;
  };

  // 添加自定义适配器
  const addAdapter = (adapter: BTCWalletAdapter): void => {
    // 检查是否已存在
    const existingIndex = customAdapters.value.findIndex(
      (a) => a.id === adapter.id,
    );
    if (existingIndex >= 0) {
      // 替换现有适配器
      customAdapters.value[existingIndex] = adapter;
    } else {
      // 添加新适配器
      customAdapters.value.push(adapter);
    }

    // 同时添加到管理器（如果管理器支持）
    if (ctx.manager.value && 'addAdapter' in ctx.manager.value) {
      try {
        (ctx.manager.value as any).addAdapter(adapter);
      } catch (error) {
        console.warn(`Failed to add adapter ${adapter.id} to manager:`, error);
      }
    }
  };

  // 移除自定义适配器
  const removeAdapter = (walletId: string): boolean => {
    const index = customAdapters.value.findIndex((a) => a.id === walletId);
    if (index < 0) {
      return false;
    }

    customAdapters.value.splice(index, 1);

    // 同时从管理器中移除（如果管理器支持）
    if (ctx.manager.value && 'removeAdapter' in ctx.manager.value) {
      try {
        (ctx.manager.value as any).removeAdapter(walletId);
      } catch (error) {
        console.warn(
          `Failed to remove adapter ${walletId} from manager:`,
          error,
        );
      }
    }

    return true;
  };

  // 获取管理器统计信息
  const _getStats = () => {
    const adapters = availableAdapters.value;
    const states = adapterStates.value;

    const stats = {
      totalAdapters: adapters.length,
      readyAdapters: adapters.filter((a) => a.isReady()).length,
      connectedAdapters: Object.values(states).filter(
        (s) => s.status === 'connected',
      ).length,
      adaptersByStatus: {
        connected: adapters
          .filter((a) => states[a.id]?.status === 'connected')
          .map((a) => a.id),
        disconnected: adapters
          .filter((a) => states[a.id]?.status === 'disconnected')
          .map((a) => a.id),
        connecting: adapters
          .filter((a) => states[a.id]?.status === 'connecting')
          .map((a) => a.id),
        error: adapters
          .filter((a) => states[a.id]?.status === 'error')
          .map((a) => a.id),
      },
    };

    return stats;
  };

  // 检查适配器是否可用
  const _isAdapterAvailable = (walletId: string): boolean => {
    const adapter = getAdapter(walletId);
    return adapter ? adapter.isReady() : false;
  };

  // 获取适配器信息
  const _getAdapterInfo = (walletId: string) => {
    const adapter = getAdapter(walletId);
    if (!adapter) {
      return null;
    }

    const state = adapterStates.value[walletId];
    const isCurrent = currentAdapter.value?.id === walletId;
    const isAvailable = adapter.isReady();

    return {
      id: adapter.id,
      name: adapter.name,
      icon: adapter.icon,
      state,
      isCurrent,
      isAvailable,
      features: {
        connect: typeof adapter.connect === 'function',
        disconnect: typeof adapter.disconnect === 'function',
        getAccounts: typeof adapter.getAccounts === 'function',
        getNetwork: typeof adapter.getNetwork === 'function',
        switchNetwork: typeof adapter.switchNetwork === 'function',
        signMessage: typeof adapter.signMessage === 'function',
        signPsbt: typeof adapter.signPsbt === 'function',
        sendBitcoin: typeof adapter.sendBitcoin === 'function',
      },
    };
  };

  return {
    currentAdapter: currentAdapter.value,
    availableAdapters: availableAdapters.value,
    adapterStates: adapterStates.value,
    getAdapter,
    addAdapter,
    removeAdapter,
    manager: ctx.manager.value,
  };
}

/**
 * 高级钱包管理器 Composable
 *
 * 提供更高级的钱包管理功能，包括批量操作、状态监控等
 *
 * @example
 * ```vue
 * <script setup>
 * import { useWalletManagerAdvanced } from '@btc-connect/vue';
 *
 * const {
 *   connectMultiple,
 *   disconnectAll,
 *   switchAllToNetwork,
 *   healthCheck,
 *   adapterMonitor
 * } = useWalletManagerAdvanced();
 *
 * // 批量连接多个钱包
 * const connectWallets = async () => {
 *   const results = await connectMultiple(['unisat', 'okx']);
 *   console.log('连接结果:', results);
 * };
 *
 * // 断开所有连接
 * const disconnectAllWallets = () => {
 *   disconnectAll();
 * };
 *
 * // 切换所有钱包到测试网
 * const switchToTestnet = async () => {
 *   await switchAllToNetwork('testnet');
 * };
 * </script>
 * ```
 */
export function useWalletManagerAdvanced() {
  const {
    currentAdapter,
    availableAdapters,
    adapterStates,
    getAdapter,
    manager,
  } = useWalletManager();

  // 批量连接多个钱包
  const connectMultiple = async (walletIds: string[]) => {
    if (!manager) {
      throw new Error('Manager not available');
    }

    const results: Array<{
      walletId: string;
      success: boolean;
      error?: string;
    }> = [];

    for (const walletId of walletIds) {
      try {
        const adapter = getAdapter(walletId);
        if (!adapter) {
          results.push({
            walletId,
            success: false,
            error: 'Adapter not found',
          });
          continue;
        }

        if (!adapter.isReady()) {
          results.push({
            walletId,
            success: false,
            error: 'Adapter not ready',
          });
          continue;
        }

        await adapter.connect();
        results.push({ walletId, success: true });
      } catch (error) {
        results.push({
          walletId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  };

  // 断开所有连接
  const disconnectAll = async () => {
    if (!manager) {
      return;
    }

    const adapters = availableAdapters;
    const results: Array<{
      walletId: string;
      success: boolean;
      error?: string;
    }> = [];

    for (const adapter of adapters) {
      try {
        if (adapter.getState().status === 'connected') {
          await adapter.disconnect();
          results.push({ walletId: adapter.id, success: true });
        }
      } catch (error) {
        results.push({
          walletId: adapter.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  };

  // 切换所有钱包到指定网络
  const switchAllToNetwork = async (network: string) => {
    if (!manager) {
      throw new Error('Manager not available');
    }

    const adapters = availableAdapters;
    const results: Array<{
      walletId: string;
      success: boolean;
      error?: string;
    }> = [];

    for (const adapter of adapters) {
      try {
        if (
          adapter.getState().status === 'connected' &&
          typeof adapter.switchNetwork === 'function'
        ) {
          await adapter.switchNetwork(network as any);
          results.push({ walletId: adapter.id, success: true });
        } else {
          results.push({
            walletId: adapter.id,
            success: false,
            error: 'Not connected or not supported',
          });
        }
      } catch (error) {
        results.push({
          walletId: adapter.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  };

  // 健康检查
  const healthCheck = async () => {
    if (!manager) {
      return { status: 'error', message: 'Manager not available' };
    }

    const adapters = availableAdapters;
    const health = {
      status: 'healthy' as 'healthy' | 'warning' | 'error',
      message: '',
      details: [] as Array<{
        walletId: string;
        status: string;
        issues: string[];
      }>,
    };

    for (const adapter of adapters) {
      const issues: string[] = [];

      try {
        if (!adapter.isReady()) {
          issues.push('Adapter not ready');
        }

        const state = adapter.getState();
        if (state.error) {
          issues.push(`State error: ${state.error.message}`);
        }

        if (issues.length > 0) {
          health.details.push({
            walletId: adapter.id,
            status: 'warning',
            issues,
          });
          if (health.status === 'healthy') {
            health.status = 'warning';
          }
        } else {
          health.details.push({
            walletId: adapter.id,
            status: 'healthy',
            issues,
          });
        }
      } catch (error) {
        health.details.push({
          walletId: adapter.id,
          status: 'error',
          issues: [error instanceof Error ? error.message : 'Unknown error'],
        });
        health.status = 'error';
      }
    }

    if (health.status === 'healthy') {
      health.message = 'All adapters are healthy';
    } else if (health.status === 'warning') {
      health.message = 'Some adapters have warnings';
    } else {
      health.message = 'Some adapters have errors';
    }

    return health;
  };

  // 适配器监控
  const adapterMonitor = () => {
    const stats = {
      totalAdapters: availableAdapters.length,
      readyAdapters: availableAdapters.filter((a) => a.isReady()).length,
      connectedAdapters: Object.values(adapterStates).filter(
        (s) => s.status === 'connected',
      ).length,
      adaptersWithErrors: Object.values(adapterStates).filter(
        (s) => s.status === 'error',
      ).length,
      currentAdapter: currentAdapter?.id || null,
      timestamp: new Date().toISOString(),
    };

    return stats;
  };

  return {
    connectMultiple,
    disconnectAll,
    switchAllToNetwork,
    healthCheck,
    adapterMonitor,
    currentAdapter,
    availableAdapters,
    adapterStates,
    manager,
  };
}
