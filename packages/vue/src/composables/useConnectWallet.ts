import { computed } from 'vue';
import { useWalletContext } from '../walletContext';

/**
 * 使用连接功能的Composable
 */
export function useConnectWallet() {
  const ctx = useWalletContext();

  return {
    connect: ctx.connect,
    disconnect: ctx.disconnect,
    switchWallet: ctx.switchWallet,
    availableWallets: computed(() => ctx.availableWallets.value),
  };
}
