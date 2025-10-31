import { computed, watch, onMounted } from 'vue';
import { useWalletContext } from '../walletContext';

/**
 * 使用连接功能的Composable
 */
export function useConnectWallet() {
  const ctx = useWalletContext();

  // 直接返回响应式引用，不要用 computed 包装
  const availableWallets = ctx.availableWallets;

  // 监听钱包列表变化
  watch(availableWallets, (newWallets, oldWallets) => {
    // 强制触发响应式更新
    if (newWallets?.length !== oldWallets?.length) {
      ctx._stateUpdateTrigger.value++;
    }
  }, { immediate: true, deep: true });

  return {
    connect: ctx.connect,
    disconnect: ctx.disconnect,
    switchWallet: ctx.switchWallet,
    availableWallets,
  };
}
