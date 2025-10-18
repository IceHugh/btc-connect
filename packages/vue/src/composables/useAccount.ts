import { computed } from 'vue';
import { useWalletContext } from '../walletContext';

/**
 * 使用账户信息的Composable
 */
export function useAccount() {
  const ctx = useWalletContext();

  return {
    accounts: computed(() => ctx.state.value.accounts),
    currentAccount: computed(() => ctx.state.value.currentAccount),
    hasAccounts: computed(() => ctx.state.value.accounts.length > 0),
    balance: computed(() => ctx.state.value.currentAccount?.balance || null),
    error: computed(() => ctx.state.value.error || null),
    // 添加address和publicKey的响应式访问
    address: computed(() => ctx.state.value.currentAccount?.address || null),
    publicKey: computed(
      () => ctx.state.value.currentAccount?.publicKey || null,
    ),
    hasAddress: computed(() => !!ctx.state.value.currentAccount?.address),
    hasPublicKey: computed(() => !!ctx.state.value.currentAccount?.publicKey),
  };
}
