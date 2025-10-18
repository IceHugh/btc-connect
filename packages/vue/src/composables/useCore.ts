import { useWalletContext } from '../walletContext';

/**
 * 使用核心钱包功能的Composable - 提供对manager的访问
 */
export function useCore() {
  const ctx = useWalletContext();

  return {
    // 核心管理器
    manager: ctx.manager,

    // 状态
    state: ctx.state,
    isConnected: ctx.isConnected,
    isConnecting: ctx.isConnecting,
    currentWallet: ctx.currentWallet,
    availableWallets: ctx.availableWallets,

    // 主题
    theme: ctx.theme,

    // 操作方法
    connect: ctx.connect,
    disconnect: ctx.disconnect,
    switchWallet: ctx.switchWallet,
  };
}
