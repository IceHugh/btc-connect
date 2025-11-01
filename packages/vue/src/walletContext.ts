import {
  type AccountInfo,
  type BalanceDetail,
  BTCWalletManager,
  type ConnectionStatus,
  type ModalConfig,
  type Network,
  type WalletInfo,
  type WalletState,
} from '@btc-connect/core';
import type { App } from 'vue';
import { type ComputedRef, computed, inject, type Ref, ref } from 'vue';
import { storage, WalletDetectionManager } from './utils';

// 定义 Context 类型
export interface WalletContext {
  manager: Ref<BTCWalletManager | null>;
  state: ComputedRef<WalletState>;
  currentWallet: ComputedRef<WalletInfo | null>;
  availableWallets: Ref<WalletInfo[]>;
  isConnected: ComputedRef<boolean>;
  isConnecting: ComputedRef<boolean>;
  isModalOpen: Ref<boolean>;
  theme: ComputedRef<'light' | 'dark' | 'auto'>;

  // 钱包检测管理器
  detectionManager: Ref<WalletDetectionManager | null>;
  isDetecting: ComputedRef<boolean>;

  // 操作方法
  connect: (walletId: string) => Promise<AccountInfo[]>;
  disconnect: () => Promise<void>;
  switchWallet: (walletId: string) => Promise<AccountInfo[]>;
  openModal: () => void;
  closeModal: () => void;
  toggleModal: () => void;

  // 钱包检测方法
  startWalletDetection: (options?: {
    autoConnect?: boolean;
    connectTimeout?: number;
  }) => Promise<void>;
  stopWalletDetection: () => void;

  // 内部状态更新trigger (仅供内部使用)
  _stateUpdateTrigger: Ref<number>;
}

// 注入键 - 使用 Symbol 确保唯一性
const BTC_WALLET_CONTEXT_KEY = Symbol('btc-wallet-context');

// 为了向后兼容，保留全局状态（但不再推荐使用）
let globalContext: WalletContext | null = null;

// 创建钱包上下文
// createWalletContext 不再对外导出，只保留一个 useWalletContext
// 移除此函数的导出以简化 API，仅保留内部实现供插件使用
function createWalletContext(
  initialTheme: 'light' | 'dark' | 'auto' = 'light',
): WalletContext {
  // SSR 保护：只在客户端初始化 manager
  const manager = ref<BTCWalletManager | null>(null);

  // 主题
  const theme = ref<'light' | 'dark' | 'auto'>(initialTheme);

  // 模态框状态
  const isModalOpen = ref(false);

  // 连接状态
  const isConnectingValue = ref(false);

  // 可用钱包列表
  const availableWallets = ref<WalletInfo[]>([]);

  // 钱包检测管理器
  const detectionManager = ref<WalletDetectionManager | null>(null);

  // 添加一个强制更新的trigger
  const stateUpdateTrigger = ref(0);

  // 计算属性 - 依赖trigger来强制更新
  const state = computed(() => {
    // 依赖trigger确保状态变化时能重新计算
    stateUpdateTrigger.value;

    const managerState = manager.value?.getState() || {
      status: 'disconnected' as ConnectionStatus,
      accounts: [],
      currentAccount: undefined,
      network: 'livenet' as Network,
      error: undefined,
    };

    return managerState;
  });

  const currentWallet = computed(
    () => manager.value?.getCurrentWallet() || null,
  );
  const isConnected = computed(() => state.value.status === 'connected');
  const isConnecting = computed(
    () => isConnectingValue.value || state.value.status === 'connecting',
  );
  const isDetecting = computed(
    () => detectionManager.value?.isActive() || false,
  );

  // 连接方法
  const connect = async (walletId: string): Promise<AccountInfo[]> => {
    if (!manager.value) {
      throw new Error('Wallet manager not initialized');
    }

    try {
      isConnectingValue.value = true;
      const accounts = await manager.value.connect(walletId);

      // 使用storage工具保存连接的钱包ID（与React包保持一致）
      if (accounts.length > 0) {
        storage.set('btc-connect:last-wallet-id', walletId);
        console.log(`💾 [walletContext] Saved wallet ID: ${walletId}`);
      }

      // 强制触发状态重新计算
      setTimeout(() => {
        // 延迟检查状态
      }, 100);

      return accounts;
    } catch (error) {
      console.error('❌ [walletContext] Failed to connect wallet:', error);
      throw error;
    } finally {
      isConnectingValue.value = false;
    }
  };

  const disconnect = async (): Promise<void> => {
    if (!manager.value) return;

    try {
      await manager.value.disconnect();

      // 使用storage工具清除本地存储的钱包ID（与React包保持一致）
      storage.remove('btc-connect:last-wallet-id');
      console.log('🗑️ [walletContext] Cleared saved wallet ID');
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      throw error;
    }
  };

  const switchWallet = async (walletId: string): Promise<AccountInfo[]> => {
    if (!manager.value) {
      throw new Error('Wallet manager not initialized');
    }

    try {
      isConnectingValue.value = true;
      // 在实际实现中，这里应该切换钱包
      const accounts = await manager.value.connect(walletId);
      return accounts;
    } catch (error) {
      console.error('Failed to switch wallet:', error);
      throw error;
    } finally {
      isConnectingValue.value = false;
    }
  };

  const openModal = () => {
    isModalOpen.value = true;
  };

  const closeModal = () => {
    isModalOpen.value = false;
  };

  const toggleModal = () => {
    isModalOpen.value = !isModalOpen.value;
  };

  // 钱包检测方法
  const startWalletDetection = async (options?: {
    autoConnect?: boolean;
    connectTimeout?: number;
  }): Promise<void> => {
    if (!manager.value) return;

    const {
      autoConnect: enableAutoConnect = false,
      connectTimeout: timeout = 5000,
    } = options || {};

    // 创建检测管理器
    detectionManager.value = new WalletDetectionManager({
      timeout: 20000, // 20秒超时
      interval: 10000, // 10秒间隔
      immediateInterval: 1000, // 1秒初始间隔
      maxImmediateChecks: 5, // 最多5次初始检测
    }) as WalletDetectionManager;

    // 监听新钱包检测事件
    detectionManager.value.on('walletDetected', (params) => {
      console.log(`🆕 [walletContext] 新钱包检测到: ${params.walletId}`);

      // 实时更新可用钱包列表
      const currentWallets = context.availableWallets.value;
      const walletExists = currentWallets.some((w) => w.id === params.walletId);

      if (!walletExists) {
        context.availableWallets.value = [...currentWallets, params.walletInfo];
      }

      // 如果启用了自动连接，检查是否是上次连接的钱包
      if (enableAutoConnect) {
        const lastWalletId = storage.get<string>('btc-connect:last-wallet-id');
        if (lastWalletId === params.walletId) {
          console.log(
            `🎯 [walletContext] 检测到上次连接的钱包 ${params.walletId}，立即尝试自动连接`,
          );
          // 延迟一小段时间确保钱包完全就绪
          setTimeout(() => {
            if (manager.value && manager.value instanceof BTCWalletManager) {
              attemptAutoConnect(manager.value, timeout);
            }
          }, 100);
        }
      }
    });

    // 监听可用钱包列表变化事件
    detectionManager.value.on('availableWallets', (params) => {
      console.log(
        `📱 [walletContext] 可用钱包列表更新: ${params.wallets.length}个钱包`,
      );
      context.availableWallets.value = params.wallets;

      // 强制触发响应式更新
      context._stateUpdateTrigger.value++;
    });

    // 监听检测完成事件
    detectionManager.value.on('walletDetectionComplete', (params) => {
      console.log(
        `🏁 [walletContext] 钱包检测完成: ${params.wallets.length}个钱包 (耗时: ${params.elapsedTime}ms)`,
      );

      // 最终更新可用钱包列表
      const walletInfos = params.adapters.map((adapter) => ({
        id: adapter.id,
        name: adapter.name,
        icon: adapter.icon,
      }));
      context.availableWallets.value = walletInfos;

      // 强制触发响应式更新
      context._stateUpdateTrigger.value++;
    });

    // 开始检测
    await detectionManager.value.startDetection();
  };

  const stopWalletDetection = (): void => {
    if (detectionManager.value) {
      detectionManager.value.stopDetection();
      detectionManager.value = null;
    }
  };

  const context: WalletContext = {
    manager: manager as Ref<BTCWalletManager | null>,
    state,
    currentWallet,
    availableWallets,
    isConnected,
    isConnecting,
    isModalOpen,
    theme: computed(() => theme.value),

    // 钱包检测管理器
    detectionManager: detectionManager as Ref<WalletDetectionManager | null>,
    isDetecting,

    // 操作方法
    connect,
    disconnect,
    switchWallet,
    openModal,
    closeModal,
    toggleModal,

    // 钱包检测方法
    startWalletDetection,
    stopWalletDetection,

    // 内部状态更新trigger
    _stateUpdateTrigger: stateUpdateTrigger,
  };

  return context;
}

// 获取钱包上下文 - 推荐使用 Vue provide/inject 系统
export function useWalletContext(): WalletContext {
  // 尝试从 Vue 的注入系统中获取上下文
  const injectedContext = inject<WalletContext | null>(
    BTC_WALLET_CONTEXT_KEY,
    null,
  );

  if (injectedContext) {
    return injectedContext;
  }

  // 回退到全局状态（向后兼容）
  // SSR 环境检查：如果在服务器端，返回一个空的上下文
  if (typeof window === 'undefined') {
    return createEmptyContext();
  }

  if (!globalContext) {
    globalContext = createWalletContext('light'); // 默认主题
  }

  // 确保上下文是响应式的
  const context = globalContext;

  // 添加全局状态监听器，定期检查状态变化
  if (typeof window !== 'undefined') {
    setInterval(() => {
      // 使用全局状态监听器，但要先确保它存在
      if (context?.manager?.value) {
        const currentState = context.manager.value.getState();
        if (currentState.status === 'connected') {
        }
      }
    }, 3000); // 每3秒检查一次
  }

  return context;
}

// 新增：直接从注入系统获取上下文（推荐使用）
export function useProvidedWalletContext(): WalletContext {
  const context = inject<WalletContext>(BTC_WALLET_CONTEXT_KEY);

  if (!context) {
    throw new Error(
      'useProvidedWalletContext must be used within a BTCWalletPlugin. ' +
        'Make sure you have installed BTCWalletPlugin in your app.',
    );
  }

  return context;
}

// 创建空上下文（用于 SSR）
function createEmptyContext(): WalletContext {
  const emptyRef = ref([]);
  const emptyComputed = computed(() => ({
    status: 'disconnected' as ConnectionStatus,
    accounts: [],
    currentAccount: undefined,
    network: 'livenet' as Network,
    error: undefined,
  }));

  return {
    manager: ref(null),
    state: emptyComputed,
    currentWallet: computed(() => null),
    availableWallets: emptyRef,
    isConnected: computed(() => false),
    isConnecting: computed(() => false),
    isModalOpen: ref(false),
    theme: computed(() => 'light' as 'light' | 'dark'),

    // 钱包检测管理器
    detectionManager: ref(null),
    isDetecting: computed(() => false),

    // 空操作方法
    connect: async () => {
      throw new Error('Wallet context not initialized in SSR');
    },
    disconnect: async () => {},
    switchWallet: async () => {
      throw new Error('Wallet context not initialized in SSR');
    },
    openModal: () => {},
    closeModal: () => {},
    toggleModal: () => {},

    // 钱包检测方法
    startWalletDetection: async () => {},
    stopWalletDetection: () => {},

    // 内部状态更新trigger
    _stateUpdateTrigger: ref(0),
  };
}

// Vue 插件选项类型
export interface BTCWalletPluginOptions {
  autoConnect?: boolean;
  connectTimeout?: number;
  theme?: 'light' | 'dark' | 'auto';
  // modal配置
  modalConfig?: ModalConfig;
  // 钱包管理器配置
  config?: Omit<
    import('@btc-connect/core').WalletManagerConfig,
    'modalConfig'
  > & {
    modalConfig?: ModalConfig;
  };
}

// Vue 插件
export const BTCWalletPlugin = {
  install(app: App, options: BTCWalletPluginOptions = {}) {
    const {
      autoConnect = true,
      connectTimeout = 5000,
      theme = 'light',
      modalConfig,
      config,
    } = options;

    // 创建钱包上下文时传入主题
    const context = createWalletContext(theme);

    // 立即 provide，不等待 window 对象
    app.provide(BTC_WALLET_CONTEXT_KEY, context);

    // 提供全局属性（向后兼容）
    app.config.globalProperties.$btc = context;
    app.provide('btc', context);

    // 在客户端初始化钱包管理器
    if (typeof window !== 'undefined') {
      // 合并配置
      const finalConfig = {
        ...config,
        modalConfig: modalConfig || config?.modalConfig,
        onStateChange: (state: WalletState) => {
          // 状态变化时强制更新Vue响应式系统
          console.log('🔄 [walletContext] State changed:', state);
          // 增加trigger值强制重新计算
          context._stateUpdateTrigger.value++;

          // 当连接成功时，通过事件获取账户详情
          if (state.status === 'connected' && state.currentAccount) {
            // 延迟执行，避免与连接事件冲突
            setTimeout(() => {
              fetchAccountDetails(walletManager);
            }, 100);
          }

          // 使用nextTick确保状态更新在下一个事件循环中处理
          setTimeout(() => {
            // 强制重新计算所有依赖的computed
            context.state;
            context.currentWallet;
            context.isConnected;
          }, 0);
        },
        onError: (error: Error) => {
          console.error('❌ [walletContext] Wallet error:', error);
        },
      };

      // 初始化钱包管理器
      const walletManager = new BTCWalletManager(
        finalConfig,
      ) as BTCWalletManager;

      context.manager.value = walletManager as BTCWalletManager;

      // 初始化适配器 - 这是关键步骤！
      walletManager.initializeAdapters();

      // 🚀 立即获取基础钱包列表，确保组件能立即显示钱包
      const initialWallets = walletManager.getAvailableWallets();
      context.availableWallets.value = initialWallets;
      console.log(
        `📱 [walletContext] 初始钱包列表 (${initialWallets.length}个):`,
        initialWallets.map((w) => w.name),
      );

      // 强制触发响应式更新，确保组件能立即看到初始钱包
      context._stateUpdateTrigger.value++;

      // 开始新的基于事件驱动的钱包检测
      context
        .startWalletDetection({
          autoConnect: autoConnect,
          connectTimeout: connectTimeout,
        })
        .catch((error) => {
          console.error('❌ [walletContext] 启动钱包检测失败:', error);
        });

      // 监听钱包连接事件，在连接成功后获取账户详情
      const handleConnect = () => {
        fetchAccountDetails(walletManager);
      };

      // 监听账户变化事件，用于UI更新和重新获取详情
      const handleAccountChange = () => {
        fetchAccountDetails(walletManager);
      };

      // 监听网络变化事件，用于UI更新和重新获取详情
      const handleNetworkChange = () => {
        fetchAccountDetails(walletManager);
      };

      // 监听页面可见性变化，当用户回到页面时重新检测
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          context.startWalletDetection({
            autoConnect: autoConnect,
            connectTimeout: connectTimeout,
          });
        }
      };

      // 注册钱包事件监听器
      walletManager.on('connect', handleConnect);
      walletManager.on('accountChange', handleAccountChange);
      walletManager.on('networkChange', handleNetworkChange);
      document.addEventListener('visibilitychange', handleVisibilityChange);

      // 返回清理函数
      return () => {
        walletManager.off('connect', handleConnect);
        walletManager.off('accountChange', handleAccountChange);
        walletManager.off('networkChange', handleNetworkChange);
        document.removeEventListener(
          'visibilitychange',
          handleVisibilityChange,
        );

        // 销毁检测管理器
        context.stopWalletDetection();
      };
    }

    // 重置全局上下文，确保使用最新的客户端实例（向后兼容）
    globalContext = context;
  },
};

// 获取账户详细信息的函数 - 与React包保持一致
async function fetchAccountDetails(manager: BTCWalletManager): Promise<void> {
  try {
    const adapter = manager.getCurrentAdapter() as any;
    if (!adapter) return;

    const updatePayload: {
      publicKey?: string;
      balance?: BalanceDetail;
    } = {};

    try {
      const pk = await adapter.getPublicKey?.();
      if (pk) {
        updatePayload.publicKey = pk;
      }
    } catch (_error) {
      // 静默处理
    }

    try {
      const bal = await adapter.getBalance?.();
      const detail: BalanceDetail | null =
        bal &&
        typeof bal === 'object' &&
        typeof bal.confirmed === 'number' &&
        typeof bal.unconfirmed === 'number' &&
        typeof bal.total === 'number'
          ? {
              confirmed: bal.confirmed,
              unconfirmed: bal.unconfirmed,
              total: bal.total,
            }
          : null;
      if (detail) {
        updatePayload.balance = detail;
      }
    } catch (_error) {
      // 静默处理
    }

    if ((adapter as any).state?.currentAccount) {
      if (updatePayload.publicKey) {
        (adapter as any).state.currentAccount.publicKey =
          updatePayload.publicKey;
      }
      if (updatePayload.balance) {
        (adapter as any).state.currentAccount.balance = updatePayload.balance;
      }
    }
  } catch (error) {
    console.warn('[BTC-Connect] Vue: 获取账户详情失败:', error);
  }
}

// 尝试自动连接的辅助函数 - 与React包保持一致的逻辑
async function attemptAutoConnect(
  manager: BTCWalletManager,
  connectTimeout: number = 5000,
) {
  try {
    // 使用storage工具获取上次连接的钱包ID（与React包保持一致）
    const lastWalletId = storage.get<string>('btc-connect:last-wallet-id');

    if (!lastWalletId) {
      console.log(
        '📝 [attemptAutoConnect] No previous wallet connection found',
      );
      return;
    }

    console.log(
      `🔄 [attemptAutoConnect] Attempting to restore connection to: ${lastWalletId}`,
    );

    // 检查钱包是否可用
    const availableWallets = manager.getAvailableWallets();
    const isWalletAvailable = availableWallets.some(
      (w) => w.id === lastWalletId,
    );

    if (!isWalletAvailable) {
      console.warn(
        `⚠️ [attemptAutoConnect] Wallet ${lastWalletId} is not available`,
      );
      storage.remove('btc-connect:last-wallet-id');
      return;
    }

    // 添加超时处理，与React包保持一致
    const withTimeout = <T>(p: Promise<T>, ms: number) =>
      new Promise<T>((resolve, reject) => {
        const t = setTimeout(
          () => reject(new Error('autoConnect timeout')),
          ms,
        );
        p.then((v) => {
          clearTimeout(t);
          resolve(v);
        }).catch((e) => {
          clearTimeout(t);
          reject(e);
        });
      });

    // 尝试静默恢复连接，使用assumeConnected方法
    const result = await withTimeout(
      manager.assumeConnected(lastWalletId),
      connectTimeout,
    );

    if (result && result.length > 0) {
      console.log(
        `✅ [attemptAutoConnect] Successfully restored connection to ${lastWalletId}:`,
        result,
      );
      // 确保记录last wallet（与React包保持一致）
      storage.set('btc-connect:last-wallet-id', lastWalletId);
    } else {
      console.log(
        `❌ [attemptAutoConnect] No active session found for ${lastWalletId}`,
      );
      // 如果没有活跃会话，不清除存储，等待下次手动连接
    }
  } catch (error) {
    console.error(
      '❌ [attemptAutoConnect] Failed to restore wallet connection:',
      error,
    );
    // 超时或失败，忽略，不清除存储
  }
}

// 导出类型
export type { WalletState, WalletInfo, AccountInfo, Network };
