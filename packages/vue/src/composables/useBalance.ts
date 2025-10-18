import type { BalanceDetail } from '@btc-connect/core';
import { computed, ref, watch } from 'vue';
import { useWalletContext } from '../walletContext';

/**
 * 使用余额信息的Composable
 */
export function useBalance() {
  const ctx = useWalletContext();
  const manager = ctx.manager;

  // 添加本地余额状态，避免每次连接都重新获取
  const localBalance = ref<BalanceDetail | null>(null);
  const isLoading = ref(false);

  // 监听连接状态变化，当连接成功时获取余额和public key
  watch(
    () => ctx.isConnected.value,
    async (isConnected) => {
      if (isConnected && manager.value) {
        // 连接成功，获取余额和public key
        try {
          isLoading.value = true;
          const adapter = manager.value.getCurrentAdapter();

          if (adapter) {
            // 获取余额
            if (typeof (adapter as any).getBalance === 'function') {
              try {
                const balance = await (adapter as any).getBalance();
                const validBalance =
                  balance && typeof balance === 'object' ? balance : null;
                localBalance.value = validBalance;

                // 更新适配器状态中的余额信息
                if (validBalance && (adapter as any).state?.currentAccount) {
                  (adapter as any).state.currentAccount.balance = validBalance;
                  if (
                    (adapter as any).state.accounts &&
                    (adapter as any).state.accounts.length > 0
                  ) {
                    (adapter as any).state.accounts[0].balance = validBalance;
                  }
                }
              } catch (balanceError) {
                // 静默处理余额错误
              }
            }

            // 获取publicKey
            if (typeof (adapter as any).getPublicKey === 'function') {
              try {
                const publicKey = await (adapter as any).getPublicKey();

                // 更新适配器状态中的publicKey
                if (publicKey && (adapter as any).state?.currentAccount) {
                  (adapter as any).state.currentAccount.publicKey = publicKey;

                  // 更新账户数组中的publicKey
                  if (
                    (adapter as any).state.accounts &&
                    (adapter as any).state.accounts.length > 0
                  ) {
                    (adapter as any).state.accounts[0].publicKey = publicKey;
                  }
                }
              } catch (pubKeyError) {
                // 静默处理public key错误
              }
            }
          }
        } catch (error) {
          // 静默处理错误
        } finally {
          isLoading.value = false;
        }
      } else {
        // 断开连接时清除状态
        localBalance.value = null;
      }
    },
  );

  // 使用本地余额作为主要来源
  const balance = computed(() => {
    // 优先使用本地余额，如果本地没有则使用状态中的余额
    const stateBalance = ctx.state.value.currentAccount?.balance;
    const finalBalance =
      localBalance.value ||
      (stateBalance && typeof stateBalance === 'object' ? stateBalance : null);

    return finalBalance;
  });

  return {
    balance,
    isLoading,
    refreshBalance: async () => {
      if (!manager.value) return;

      try {
        isLoading.value = true;
        const adapter = manager.value.getCurrentAdapter();

        if (adapter) {
          // 获取余额
          if (typeof (adapter as any).getBalance === 'function') {
            try {
              const balance = await (adapter as any).getBalance();
              const validBalance =
                balance && typeof balance === 'object' ? balance : null;
              localBalance.value = validBalance;

              if (validBalance && (adapter as any).state?.currentAccount) {
                (adapter as any).state.currentAccount.balance = validBalance;
                if (
                  (adapter as any).state.accounts &&
                  (adapter as any).state.accounts.length > 0
                ) {
                  (adapter as any).state.accounts[0].balance = validBalance;
                }
              }
            } catch (balanceError) {
              // 静默处理余额错误
            }
          }

          // 获取publicKey
          if (typeof (adapter as any).getPublicKey === 'function') {
            try {
              const publicKey = await (adapter as any).getPublicKey();

              // 更新适配器状态中的publicKey
              if (publicKey && (adapter as any).state?.currentAccount) {
                (adapter as any).state.currentAccount.publicKey = publicKey;

                // 更新账户数组中的publicKey
                if (
                  (adapter as any).state.accounts &&
                  (adapter as any).state.accounts.length > 0
                ) {
                  (adapter as any).state.accounts[0].publicKey = publicKey;
                }
              }
            } catch (pubKeyError) {
              // 静默处理public key错误
            }
          }
        }
      } catch (error) {
        // 静默处理错误
      } finally {
        isLoading.value = false;
      }
    },
    confirmedBalance: computed(() => {
      const currentBalance = balance.value;
      return currentBalance && typeof currentBalance === 'object'
        ? currentBalance.confirmed || 0
        : 0;
    }),
    unconfirmedBalance: computed(() => {
      const currentBalance = balance.value;
      return currentBalance && typeof currentBalance === 'object'
        ? currentBalance.unconfirmed || 0
        : 0;
    }),
    totalBalance: computed(() => {
      const currentBalance = balance.value;
      return currentBalance && typeof currentBalance === 'object'
        ? currentBalance.total || 0
        : 0;
    }),
  };
}
