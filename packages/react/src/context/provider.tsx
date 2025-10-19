import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useReducer,
} from 'react';
import type { BalanceDetail, ConnectionPolicy } from '../types';
import type {
  AccountInfo,
  WalletInfo,
  WalletManagerConfig,
  WalletState,
} from '../types/core';
import { BTCWalletManager } from '../types/core';
import { storage } from '../utils';
import {
  initialState,
  walletActionCreators,
  walletReducer,
  walletSelectors,
} from './reducer';

// 钱包上下文类型
export interface WalletContextType {
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
  refreshAccountInfo: () => Promise<void>;

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
  // modal配置
  modalConfig?: import('../types').ModalConfig;
}

/**
 * 钱包提供者组件 - 使用 useReducer 优化
 */
export function BTCWalletProvider({
  children,
  config,
  autoConnect = false,
  connectTimeout = 5000,
  connectionPolicy,
  theme = 'light',
  modalConfig,
}: WalletProviderProps) {
  // 使用 useReducer 管理状态
  const [state, dispatch] = useReducer(walletReducer, {
    ...initialState,
    theme,
  });

  // SSR 保护：只在客户端初始化 manager
  const initManager = useCallback(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    // 合并modal配置到config中
    const finalConfig = {
      ...config,
      modalConfig: modalConfig || config?.modalConfig,
    };

    return new BTCWalletManager(finalConfig);
  }, [config, modalConfig]);

  // 响应主题 prop 变化
  useEffect(() => {
    dispatch(walletActionCreators.setTheme(theme));
  }, [theme]);

  // 延迟初始化 manager
  useLayoutEffect(() => {
    const manager = initManager();
    dispatch(walletActionCreators.setManager(manager));

    if (manager) {
      // 初始化状态
      dispatch(walletActionCreators.setState(manager.getState()));
      dispatch(
        walletActionCreators.setCurrentWallet(manager.getCurrentWallet()),
      );
      dispatch(
        walletActionCreators.setAvailableWallets(manager.getAvailableWallets()),
      );
    }
  }, [initManager]);

  const { manager } = state;

  // 在客户端安全地初始化适配器
  useEffect(() => {
    if (typeof window !== 'undefined' && manager) {
      manager.initializeAdapters();
      // 初始化后更新可用钱包列表
      dispatch(
        walletActionCreators.setAvailableWallets(manager.getAvailableWallets()),
      );
    }
  }, [manager]);

  // 更新状态的函数
  const updateState = useCallback(() => {
    if (manager) {
      const newState = manager.getState();
      dispatch(walletActionCreators.setState(newState));
      dispatch(
        walletActionCreators.setCurrentWallet(manager.getCurrentWallet()),
      );
      dispatch(
        walletActionCreators.setAvailableWallets(manager.getAvailableWallets()),
      );
    }
  }, [manager]);

  // 获取账户详细信息（公钥和余额）
  const fetchAccountDetails = useCallback(async () => {
    if (!manager) return;

    try {
      const adapter = manager.getCurrentAdapter() as any;
      if (!adapter) return;

      const updatePayload: {
        publicKey?: string;
        balance?: BalanceDetail;
      } = {};

      // 获取公钥
      try {
        const pk = await adapter.getPublicKey?.();
        if (pk) {
          updatePayload.publicKey = pk;
        }
      } catch (error) {
        console.warn('Failed to get public key:', error);
      }

      // 获取余额
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
      } catch (error) {
        console.warn('Failed to get balance:', error);
      }

      if (Object.keys(updatePayload).length > 0) {
        dispatch(walletActionCreators.updateAccountInfo(updatePayload));
      }
    } catch (error) {
      console.warn('Failed to fetch account details:', error);
    }
  }, [manager]);

  // 监听状态变化和账户变化
  useEffect(() => {
    if (manager) {
      if (config?.onStateChange) {
        const originalHandler = config.onStateChange;
        config.onStateChange = (newState: WalletState) => {
          updateState();
          // 当连接状态变化且已连接时，获取账户详情
          if (newState.status === 'connected' && newState.currentAccount) {
            fetchAccountDetails();
          }
          originalHandler(newState);
        };
      } else {
        manager.config.onStateChange = (newState: WalletState) => {
          updateState();
          // 当连接状态变化且已连接时，获取账户详情
          if (newState.status === 'connected' && newState.currentAccount) {
            fetchAccountDetails();
          }
        };
      }

      // 监听账户变化事件
      const handleAccountChange = () => {
        fetchAccountDetails();
      };

      manager.on('accountChange', handleAccountChange);

      return () => {
        manager.off('accountChange', handleAccountChange);
      };
    }
  }, [manager, config, updateState, fetchAccountDetails]);

  // 连接钱包
  const connect = useCallback(
    async (walletId: string): Promise<AccountInfo[]> => {
      if (!manager) {
        throw new Error('Wallet manager not initialized');
      }

      dispatch(walletActionCreators.setConnecting(true));
      try {
        // 先建立底层连接，但在策略完成前不暴露给外部
        const connectedAccounts = await manager.connect(walletId);

        // 如有策略：所有任务成功后才算真正连接成功（才返回账户并记录 storage）
        if (connectionPolicy?.tasks?.length) {
          dispatch(walletActionCreators.setPolicyRunning(true));
          let hasFatalError = false;
          try {
            for (const task of connectionPolicy.tasks) {
              try {
                const result = await task.run({ manager });
                const failed = !result.success;
                if (failed && task.required !== false) {
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
            dispatch(walletActionCreators.setPolicyRunning(false));
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
        await fetchAccountDetails();

        // 同步最新状态到 React
        updateState();

        // 策略通过后再记录 last wallet，并返回账户
        storage.set('btc-connect:last-wallet-id', walletId);
        return connectedAccounts;
      } catch (error) {
        dispatch(
          walletActionCreators.setError(
            error instanceof Error ? error : new Error(String(error)),
          ),
        );
        throw error;
      } finally {
        dispatch(walletActionCreators.setConnecting(false));
      }
    },
    [manager, connectionPolicy, updateState, fetchAccountDetails],
  );

  // 自动静默连接：仅针对上次成功连接的钱包
  useEffect(() => {
    if (!autoConnect || walletSelectors.isConnected(state)) return;

    const lastWalletId = storage.get<string>('btc-connect:last-wallet-id');
    if (!lastWalletId) return;

    let cancelled = false;
    const withTimeout = <T,>(p: Promise<T>, ms: number) =>
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

    const run = async () => {
      try {
        const result = await withTimeout(
          (manager as any).assumeConnected(lastWalletId),
          connectTimeout,
        );

        if (cancelled) return;
        // 成功会通过 onStateChange 更新状态
        if (!result) {
          // 授权不存在，忽略
        } else {
          // 保险：主动拉一次状态
          updateState();

          // 自动连接成功后获取账户详情
          if (walletSelectors.isConnected(state)) {
            await fetchAccountDetails();
          }

          // 自动静默连接后任务（仅当允许）。所有任务成功后才保留连接并记录 storage
          if (
            connectionPolicy?.emitEventsOnAutoConnect &&
            connectionPolicy.tasks?.length
          ) {
            dispatch(walletActionCreators.setPolicyRunning(true));
            let hasFatalError = false;
            try {
              for (const task of connectionPolicy.tasks) {
                if (task.autoBehavior !== 'run') continue;
                try {
                  const result = await task.run({ manager });
                  const failed = !result.success;
                  if (failed && task.required !== false) {
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
              dispatch(walletActionCreators.setPolicyRunning(false));
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
              storage.set('btc-connect:last-wallet-id', lastWalletId);
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
  }, [
    autoConnect,
    connectTimeout,
    manager,
    state,
    updateState,
    connectionPolicy,
    fetchAccountDetails,
  ]);

  // 断开连接
  const disconnect = useCallback(async (): Promise<void> => {
    if (!manager) {
      return;
    }

    dispatch(walletActionCreators.setConnecting(true));
    try {
      await manager.disconnect();
      storage.remove('btc-connect:last-wallet-id');
      dispatch(walletActionCreators.resetState());
    } catch (error) {
      dispatch(
        walletActionCreators.setError(
          error instanceof Error ? error : new Error(String(error)),
        ),
      );
    } finally {
      dispatch(walletActionCreators.setConnecting(false));
    }
  }, [manager]);

  // 切换钱包
  const switchWallet = useCallback(
    async (walletId: string): Promise<AccountInfo[]> => {
      if (!manager) {
        throw new Error('Wallet manager not initialized');
      }

      dispatch(walletActionCreators.setConnecting(true));
      try {
        const accounts = await manager.switchWallet(walletId);
        storage.set('btc-connect:last-wallet-id', walletId);
        return accounts;
      } catch (error) {
        dispatch(
          walletActionCreators.setError(
            error instanceof Error ? error : new Error(String(error)),
          ),
        );
        throw error;
      } finally {
        dispatch(walletActionCreators.setConnecting(false));
      }
    },
    [manager],
  );

  // 模态框操作
  const openModal = useCallback(() => {
    dispatch(walletActionCreators.setModalOpen(true));
  }, []);

  const closeModal = useCallback(() => {
    dispatch(walletActionCreators.setModalOpen(false));
  }, []);

  const toggleModal = useCallback(() => {
    dispatch(walletActionCreators.setModalOpen(!state.isModalOpen));
  }, [state.isModalOpen]);

  // 计算属性（使用选择器）
  const exposedState = walletSelectors.exposedState(state);
  const isConnected = walletSelectors.isConnected(state);
  const isConnectingState = walletSelectors.isConnecting(state);

  const value: WalletContextType = {
    state: exposedState,
    currentWallet: state.currentWallet,
    availableWallets: state.availableWallets,
    isConnected,
    isConnecting: isConnectingState,
    isModalOpen: state.isModalOpen,
    theme: state.theme,
    connect,
    disconnect,
    switchWallet,
    openModal,
    closeModal,
    toggleModal,
    refreshAccountInfo: fetchAccountDetails,
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
