import { useCallback, useEffect, useState } from 'react';
import { useWalletContext } from '../context/provider';
import type { Network, WalletEvent } from '../types';
import { formatAddressShort, normalizeBalance } from '../utils';

/**
 * 使用钱包状态的Hook - 优化版本
 */
export function useWallet() {
  const { state, currentWallet, isConnected, isConnecting, disconnect, theme } =
    useWalletContext();

  // 使用选择器避免不必要的重渲染
  const status = state.status;
  const accounts = state.accounts;
  const currentAccount = state.currentAccount;
  const network = state.network;
  const error = state.error;

  // 计算属性
  const address = currentAccount?.address || null;
  const balance = normalizeBalance(currentAccount?.balance);
  const publicKey = currentAccount?.publicKey || null;

  return {
    // 状态
    status,
    accounts,
    currentAccount,
    network,
    error,
    currentWallet,
    isConnected,
    isConnecting,
    theme,

    // 账户信息
    address,
    balance,
    publicKey,

    // 操作
    disconnect,
  };
}

/**
 * 使用连接功能的Hook - 优化版本
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
 * 使用特定钱包连接的Hook - 优化版本
 */
export function useWalletConnect(walletId: string) {
  const { connect, availableWallets } = useWalletContext();

  // 使用 useMemo 避免重复计算
  const wallet = availableWallets.find((w) => w.id === walletId);
  const isAvailable = !!wallet;

  const connectWallet = useCallback(async () => {
    if (!isAvailable) {
      throw new Error(`Wallet ${walletId} is not available`);
    }
    return await connect(walletId);
  }, [connect, isAvailable, walletId]);

  return {
    wallet,
    isAvailable,
    connect: connectWallet,
  };
}

/**
 * 使用事件监听的Hook - 优化版本
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
 * 使用网络信息的Hook - 优化版本
 */
export function useNetwork() {
  const { state, manager } = useWalletContext();

  // 使用 useState 避免不必要的重渲染
  const [network, setNetwork] = useState(state.network);

  useEffect(() => {
    if (!manager) return;

    const handleNetworkChange = (newNetwork: Network) => {
      setNetwork(newNetwork);
    };

    manager.on('networkChange', handleNetworkChange);
    return () => {
      manager.off('networkChange', handleNetworkChange);
    };
  }, [manager]);

  // 使用 useCallback 优化函数引用
  const switchNetwork = useCallback(
    async (targetNetwork: Network) => {
      if (manager?.switchNetwork) {
        return await manager.switchNetwork(targetNetwork);
      }
      throw new Error('Network switching not supported or no wallet connected');
    },
    [manager],
  );

  return {
    network,
    switchNetwork,
  };
}

/**
 * 使用钱包模态框的Hook - 优化版本
 */
export function useWalletModal() {
  const { isModalOpen, openModal, closeModal, toggleModal } =
    useWalletContext();

  return {
    isModalOpen,
    openModal,
    closeModal,
    toggleModal,
  };
}

/**
 * 使用账户信息的Hook - 新增
 */
export function useAccount() {
  const { state } = useWalletContext();

  return {
    accounts: state.accounts,
    currentAccount: state.currentAccount,
    hasAccounts: state.accounts.length > 0,
  };
}

/**
 * 使用余额信息的Hook - 新增
 */
export function useBalance() {
  const { state } = useWalletContext();

  const balance = normalizeBalance(state.currentAccount?.balance);

  return {
    balance,
    confirmedBalance: balance?.confirmed || 0,
    unconfirmedBalance: balance?.unconfirmed || 0,
    totalBalance: balance?.total || 0,
  };
}

/**
 * 使用地址信息的Hook - 新增
 */
export function useAddress() {
  const { state } = useWalletContext();

  return {
    address: state.currentAccount?.address || null,
    shortAddress: state.currentAccount?.address
      ? formatAddressShort(state.currentAccount.address, 4)
      : null,
  };
}

/**
 * 使用公钥信息的Hook - 新增
 */
export function usePublicKey() {
  const { state } = useWalletContext();

  return {
    publicKey: state.currentAccount?.publicKey || null,
    hasPublicKey: !!state.currentAccount?.publicKey,
  };
}

/**
 * 使用连接状态的Hook - 新增
 */
export function useConnectionStatus() {
  const { state, manager } = useWalletContext();

  const status = state.status;
  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';
  const isDisconnected = status === 'disconnected';
  const hasError = !!state.error;

  const retryConnection = useCallback(async () => {
    const currentWallet = manager?.getCurrentWallet();
    if (currentWallet && isDisconnected) {
      try {
        await manager?.connect(currentWallet.id);
      } catch (error) {
        console.error('Failed to retry connection:', error);
      }
    }
  }, [manager, isDisconnected]);

  return {
    status,
    isConnected,
    isConnecting,
    isDisconnected,
    hasError,
    error: state.error,
    retryConnection,
  };
}

/**
 * 使用钱包信息的Hook - 新增
 */
export function useWalletInfo() {
  const { currentWallet, availableWallets, theme } = useWalletContext();

  return {
    currentWallet,
    availableWallets,
    hasWallets: availableWallets.length > 0,
    theme,
  };
}

/**
 * 使用账户信息刷新的Hook - 新增
 */
export function useRefreshAccountInfo() {
  const { refreshAccountInfo } = useWalletContext();

  return {
    refreshAccountInfo,
  };
}
