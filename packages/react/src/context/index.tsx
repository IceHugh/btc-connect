import type {
  AccountInfo,
  WalletEvent,
  WalletInfo,
  WalletManagerConfig,
  WalletState,
} from '../types/core';
import { BTCWalletManager } from '../types/core';
import { storage } from '../utils';
import type { ConnectionPolicy, BalanceDetail } from '../types';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

// 钱包上下文类型
interface WalletContextType {
  // 状态
  state: WalletState;
  currentWallet: WalletInfo | null;
  availableWallets: WalletInfo[];
  isConnected: boolean;
  isConnecting: boolean;

  // 模态框状态
  isModalOpen: boolean;

  // 主题
  theme: 'light' | 'dark';

  // 操作
  connect: (walletId: string) => Promise<AccountInfo[]>;
  disconnect: () => Promise<void>;
  switchWallet: (walletId: string) => Promise<AccountInfo[]>;
  openModal: () => void;
  closeModal: () => void;
  toggleModal: () => void;

  // 管理器（可能为 null，在 SSR 环境下）
  manager: BTCWalletManager | null;
}

// 创建钱包上下文
const WalletContext = createContext<WalletContextType | undefined>(undefined);

// 钱包提供者属性
interface WalletProviderProps {
  children: ReactNode;
  config?: WalletManagerConfig;
  autoConnect?: boolean;
  connectTimeout?: number;
  connectionPolicy?: ConnectionPolicy;
  theme?: 'light' | 'dark';
}

/**
 * 钱包提供者组件
 */
export function BTCWalletProvider({
  children,
  config,
  autoConnect = false,
  connectTimeout = 5000,
  connectionPolicy,
  theme = 'light',
}: WalletProviderProps) {
  // SSR 保护：只在客户端初始化 manager
  const [manager] = useState(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    return new BTCWalletManager(config);
  });
  
  // SSR 保护：提供默认状态
  const [state, setState] = useState<WalletState>(() => {
    if (typeof window === 'undefined' || !manager) {
      return { status: 'disconnected', accounts: [] };
    }
    return manager.getState();
  });
  
  const [currentWallet, setCurrentWallet] = useState<WalletInfo | null>(() => {
    if (typeof window === 'undefined' || !manager) {
      return null;
    }
    return manager.getCurrentWallet();
  });
  
  const [availableWallets, setAvailableWallets] = useState<WalletInfo[]>(() => {
    if (typeof window === 'undefined' || !manager) {
      return [];
    }
    return manager.getAvailableWallets();
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [isPolicyRunning, setIsPolicyRunning] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const STORAGE_KEY_LAST_WALLET = 'btc-connect:last-wallet-id';

  // 在客户端安全地初始化适配器
  useEffect(() => {
    if (typeof window !== 'undefined' && manager) {
      manager.initializeAdapters();
      // 初始化后更新可用钱包列表
      setAvailableWallets(manager.getAvailableWallets());
    }
  }, [manager]);

  // 更新状态
  const updateState = useCallback(() => {
    if (manager) {
      setState(manager.getState());
      setCurrentWallet(manager.getCurrentWallet());
      setAvailableWallets(manager.getAvailableWallets());
    }
  }, [manager]);

  // 监听状态变化
  useEffect(() => {
    if (manager) {
      if (config?.onStateChange) {
        config.onStateChange = (newState: WalletState) => {
          updateState();
          config.onStateChange?.(newState);
        };
      } else {
        manager.config.onStateChange = updateState;
      }
    }
  }, [manager, config, updateState]);

  // 连接钱包
  const connect = useCallback(
    async (walletId: string): Promise<AccountInfo[]> => {
      if (!manager) {
        throw new Error('Wallet manager not initialized');
      }
      setIsConnecting(true);
      try {
        // 先建立底层连接，但在策略完成前不暴露给外部
        const connectedAccounts = await manager.connect(walletId);

        // 如有策略：所有任务成功后才算真正连接成功（才返回账户并记录 storage）
        if (connectionPolicy?.tasks?.length) {
          setIsPolicyRunning(true);
          let hasFatalError = false;
          try {
            for (const task of connectionPolicy.tasks) {
              try {
                const result = await task.run({ manager });
                const failed = !result.success;
                if (failed && (task.required !== false)) {
                  hasFatalError = true;
                  break;
                }
              } catch {
                if (task.required !== false) {
                  hasFatalError = true;
                  break;
                }
              }
            }
          } finally {
            setIsPolicyRunning(false);
          }

          if (hasFatalError) {
            // 回滚连接状态并抛错
            try {
              await manager.disconnect();
            } catch {}
            throw new Error('Connection policy failed');
          }
        }

        // 策略通过后进行一次信息补全（网络/公钥/余额），以与 autoconnect 行为一致
        try {
          const adapter = manager.getCurrentAdapter() as any;
          if (adapter) {
            try {
              await adapter.getNetwork?.();
            } catch {}
            try {
              const pk = await adapter.getPublicKey?.();
              if (pk && adapter.state?.currentAccount) {
                adapter.state.currentAccount.publicKey = pk;
              }
            } catch {}
            try {
              const bal = await adapter.getBalance?.();
              const detail: BalanceDetail | null =
                bal && typeof bal === 'object' &&
                typeof bal.confirmed === 'number' &&
                typeof bal.unconfirmed === 'number' &&
                typeof bal.total === 'number'
                  ? { confirmed: bal.confirmed, unconfirmed: bal.unconfirmed, total: bal.total }
                  : null;
              if (detail) {
                const s = adapter.state;
                if (s?.currentAccount) {
                  s.currentAccount.balance = detail;
                }
                if (Array.isArray(s?.accounts) && s.accounts.length > 0) {
                  s.accounts[0].balance = detail;
                }
              }
            } catch {}
            // 同步最新状态到 React
            updateState();
          }
        } catch {}

        // 策略通过后再记录 last wallet，并返回账户
        storage.set(STORAGE_KEY_LAST_WALLET, walletId);
        return connectedAccounts;
      } finally {
        setIsConnecting(false);
      }
    },
    [manager, connectionPolicy, updateState],
  );

  // 已移除可用性变化轮询监听，避免不必要的重渲染

  // 自动静默连接：仅针对上次成功连接的钱包
  useEffect(() => {
    if (!autoConnect || state.status === 'connected') return;

    const lastWalletId = storage.get<string>(STORAGE_KEY_LAST_WALLET);
    if (!lastWalletId) return;

    let cancelled = false;
    const withTimeout = <T,>(p: Promise<T>, ms: number) =>
      new Promise<T>((resolve, reject) => {
        const t = setTimeout(() => reject(new Error('autoConnect timeout')), ms);
        p.then((v) => {
          clearTimeout(t);
          resolve(v);
        }).catch((e) => {
          clearTimeout(t);
          reject(e);
        });
      });

    const run = async () => {
      try {
        const result = await withTimeout(
          (manager as any).assumeConnected(lastWalletId),
          connectTimeout,
        );
        console.log('result', result);
        
        if (cancelled) return;
        // 成功会通过 onStateChange 更新状态
        if (!result) {
          // 授权不存在，忽略
        } else {
          // 保险：主动拉一次状态
          updateState();
          // 自动静默连接后任务（仅当允许）。所有任务成功后才保留连接并记录 storage
          if (connectionPolicy?.emitEventsOnAutoConnect && connectionPolicy.tasks?.length) {
            setIsPolicyRunning(true);
            let hasFatalError = false;
            try {
              for (const task of connectionPolicy.tasks) {
                if (task.autoBehavior !== 'run') continue;
                try {
                  const result = await task.run({ manager });
                  const failed = !result.success;
                  if (failed && (task.required !== false)) {
                    hasFatalError = true;
                    break;
                  }
                } catch {
                  if (task.required !== false) {
                    hasFatalError = true;
                    break;
                  }
                }
              }
            } finally {
              setIsPolicyRunning(false);
            }

            if (hasFatalError) {
              // 策略失败：回滚连接状态
              try {
                if (manager) {
                  await manager.disconnect();
                }
              } catch {}
            } else {
              // 成功：确保记录 last wallet（如果存在）
              storage.set(STORAGE_KEY_LAST_WALLET, lastWalletId);
            }
          }
        }
      } catch {
        // 超时或失败，忽略
      }
    };
    void run();

    return () => {
      cancelled = true;
    };
  }, [autoConnect, connectTimeout, manager, state.status, updateState, connectionPolicy]);

  // 断开连接
  const disconnect = async (): Promise<void> => {
    if (!manager) {
      return;
    }
    setIsConnecting(true);
    try {
      await manager.disconnect();
      storage.remove(STORAGE_KEY_LAST_WALLET);
    } finally {
      setIsConnecting(false);
    }
  };

  // 切换钱包
  const switchWallet = async (walletId: string): Promise<AccountInfo[]> => {
    if (!manager) {
      throw new Error('Wallet manager not initialized');
    }
    setIsConnecting(true);
    try {
      const accounts = await manager.switchWallet(walletId);
      storage.set(STORAGE_KEY_LAST_WALLET, walletId);
      return accounts;
    } finally {
      setIsConnecting(false);
    }
  };

  // 模态框操作
  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const toggleModal = useCallback(() => {
    setIsModalOpen(prev => !prev);
  }, []);

  // 对外暴露的状态（在策略执行期间隐藏账户和连接态）
  const exposedState: WalletState = isPolicyRunning
    ? {
        status: 'connecting',
        accounts: [],
      }
    : state;

  // 计算属性（基于暴露状态）
  const isConnected = exposedState.status === 'connected';
  const isConnectingState =
    exposedState.status === 'connecting' || isConnecting || isPolicyRunning;

  const value: WalletContextType = {
    state: exposedState,
    currentWallet,
    availableWallets,
    isConnected,
    isConnecting: isConnectingState,
    isModalOpen,
    theme,
    connect,
    disconnect,
    switchWallet,
    openModal,
    closeModal,
    toggleModal,
    manager,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

/**
 * 使用钱包上下文的Hook
 */
export function useWalletContext(): WalletContextType {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWalletContext must be used within a BTCWalletProvider');
  }
  return context;
}

/**
 * 使用钱包状态的Hook
 */
export function useWallet() {
  const { state, currentWallet, isConnected, isConnecting, disconnect, theme } =
    useWalletContext();

  return {
    // 状态
    status: state.status,
    accounts: state.accounts,
    currentAccount: state.currentAccount,
    network: state.network,
    error: state.error,
    currentWallet,
    isConnected,
    isConnecting,
    theme,

    // 账户信息
    address: state.currentAccount?.address || null,
    balance:
      state.currentAccount?.balance && typeof state.currentAccount.balance === 'object'
        ? (state.currentAccount.balance as BalanceDetail)
        : null,
    publicKey: state.currentAccount?.publicKey || null,

    // 操作
    disconnect,
  };
}

/**
 * 使用连接功能的Hook
 */
export function useConnectWallet() {
  const { connect, disconnect, switchWallet, availableWallets } =
    useWalletContext();

  return {
    connect,
    disconnect,
    switchWallet,
    availableWallets,
  };
}

/**
 * 使用特定钱包连接的Hook
 */
export function useWalletConnect(walletId: string) {
  const { connect, availableWallets } = useWalletContext();

  const wallet = availableWallets.find((w) => w.id === walletId);
  const isAvailable = !!wallet;

  const connectWallet = async () => {
    if (!isAvailable) {
      throw new Error(`Wallet ${walletId} is not available`);
    }
    return await connect(walletId);
  };

  return {
    wallet,
    isAvailable,
    connect: connectWallet,
  };
}

/**
 * 使用事件监听的Hook
 */
export function useWalletEvent(
  event: WalletEvent,
  handler: (...args: any[]) => void,
) {
  const { manager } = useWalletContext();

  useEffect(() => {
    if (!manager) return;
    
    manager.on(event, handler);
    return () => {
      manager.off(event, handler);
    };
  }, [manager, event, handler]);
}

/**
 * 使用网络信息的Hook
 */
export function useNetwork() {
  const { state, manager } = useWalletContext();
  const [network, setNetwork] = useState(state.network);

  useEffect(() => {
    if (!manager) return;

    const handleNetworkChange = (newNetwork: any) => {
      setNetwork(newNetwork);
    };

    manager.on('networkChange', handleNetworkChange);
    return () => {
      manager.off('networkChange', handleNetworkChange);
    };
  }, [manager]);

  return {
    network,
    switchNetwork: manager?.getCurrentAdapter()?.switchNetwork,
  };
}

/**
 * 使用钱包模态框的Hook
 */
export function useWalletModal() {
  const { isModalOpen, openModal, closeModal, toggleModal } = useWalletContext();

  return {
    isModalOpen,
    openModal,
    closeModal,
    toggleModal,
  };
}
