import { computed } from 'vue';
import { useWalletContext } from '../walletContext';

export function useWalletInfo() {
  const ctx = useWalletContext();

  return {
    currentWallet: ctx.currentWallet,
    availableWallets: ctx.availableWallets,
    hasWallets: computed(() => ctx.availableWallets.value.length > 0),
    theme: ctx.theme,
  };
}