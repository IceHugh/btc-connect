import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWalletContext } from '../context/provider';
import type { BalanceDetail } from '../types';

/**
 * 使用余额信息的Hook
 */
export function useBalance() {
  const ctx = useWalletContext();
  const manager = ctx.manager;

  // 添加本地余额状态，避免每次连接都重新获取
  const [localBalance, setLocalBalance] = useState<BalanceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 监听连接状态变化，当连接成功时获取余额和public key
  useEffect(() => {
    const handleBalanceAndPublicKey = async () => {
      if (ctx.isConnected && manager) {
        // 连接成功，获取余额和public key
        try {
          setIsLoading(true);
          const adapter = manager.getCurrentAdapter();

          if (adapter) {
            // 获取余额
            if (typeof (adapter as any).getBalance === 'function') {
              try {
                const balance = await (adapter as any).getBalance();
                const validBalance =
                  balance && typeof balance === 'object' ? balance : null;
                setLocalBalance(validBalance);

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
              } catch (_balanceError) {
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
              } catch (_pubKeyError) {
                // 静默处理public key错误
              }
            }
          }
        } catch (_error) {
          // 静默处理错误
        } finally {
          setIsLoading(false);
        }
      } else {
        // 断开连接时清除状态
        setLocalBalance(null);
      }
    };

    handleBalanceAndPublicKey();
  }, [ctx.isConnected, manager]);

  // 使用本地余额作为主要来源
  const balance = useMemo(() => {
    // 优先使用本地余额，如果本地没有则使用状态中的余额
    const stateBalance = ctx.state.currentAccount?.balance;
    const finalBalance =
      localBalance ||
      (stateBalance && typeof stateBalance === 'object' ? stateBalance : null);

    return finalBalance;
  }, [localBalance, ctx.state.currentAccount?.balance]);

  const refreshBalance = useCallback(async () => {
    if (!manager) return;

    try {
      setIsLoading(true);
      const adapter = manager.getCurrentAdapter();

      if (adapter) {
        // 获取余额
        if (typeof (adapter as any).getBalance === 'function') {
          try {
            const balance = await (adapter as any).getBalance();
            const validBalance =
              balance && typeof balance === 'object' ? balance : null;
            setLocalBalance(validBalance);

            if (validBalance && (adapter as any).state?.currentAccount) {
              (adapter as any).state.currentAccount.balance = validBalance;
              if (
                (adapter as any).state.accounts &&
                (adapter as any).state.accounts.length > 0
              ) {
                (adapter as any).state.accounts[0].balance = validBalance;
              }
            }
          } catch (_balanceError) {
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
          } catch (_pubKeyError) {
            // 静默处理public key错误
          }
        }
      }
    } catch (_error) {
      // 静默处理错误
    } finally {
      setIsLoading(false);
    }
  }, [manager]);

  const confirmedBalance = useMemo(() => {
    const currentBalance = balance;
    return currentBalance && typeof currentBalance === 'object'
      ? currentBalance.confirmed || 0
      : 0;
  }, [balance]);

  const unconfirmedBalance = useMemo(() => {
    const currentBalance = balance;
    return currentBalance && typeof currentBalance === 'object'
      ? currentBalance.unconfirmed || 0
      : 0;
  }, [balance]);

  const totalBalance = useMemo(() => {
    const currentBalance = balance;
    return currentBalance && typeof currentBalance === 'object'
      ? currentBalance.total || 0
      : 0;
  }, [balance]);

  return {
    balance,
    isLoading,
    refreshBalance,
    confirmedBalance,
    unconfirmedBalance,
    totalBalance,
  };
}
