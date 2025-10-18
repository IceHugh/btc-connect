import { computed } from 'vue';
import { useWalletContext } from '../walletContext';

/**
 * 使用钱包状态的Composable - 对应React包的useWallet hook
 */
export function useWallet() {
  const ctx = useWalletContext();

  // 使用选择器避免不必要的重渲染
  const status = computed(() => ctx.state.value.status);
  const accounts = computed(() => ctx.state.value.accounts);
  const currentAccount = computed(() => ctx.state.value.currentAccount);
  const network = computed(() => ctx.state.value.network);
  const error = computed(() => ctx.state.value.error);

  // 计算属性
  const address = computed(() => currentAccount.value?.address || null);
  const balance = computed(() => {
    const accBalance = currentAccount.value?.balance;
    const result = accBalance && typeof accBalance === 'object' ? accBalance : null;

    
    return result;
  });
  const publicKey = computed(() => currentAccount.value?.publicKey || null);

  return {
    // 状态
    status,
    accounts,
    currentAccount,
    network,
    error,
    currentWallet: ctx.currentWallet,
    isConnected: ctx.isConnected,
    isConnecting: ctx.isConnecting,
    theme: ctx.theme,

    // 账户信息
    address,
    balance,
    publicKey,

    // 操作
    disconnect: ctx.disconnect,
  };
}