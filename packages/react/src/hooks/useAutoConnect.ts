import { useCallback, useEffect, useRef, useState } from 'react';
import { useWalletContext } from '../context';
import type {
  AccountInfo,
  WalletDetectedEventParams,
  WalletDetectionCompleteEventParams,
} from '../types';
import { storage } from '../utils';

/**
 * 自动连接功能的Hook
 * 负责在页面刷新后自动恢复之前的钱包连接
 */
export function useAutoConnect() {
  const ctx = useWalletContext();
  const manager = ctx.manager;

  // 自动连接状态
  const [isAutoConnecting, setIsAutoConnecting] = useState(false);
  const [lastWalletId, setLastWalletId] = useState<string | null>(null);
  const [autoConnectEnabled, setAutoConnectEnabled] = useState(true);
  const hasAttemptedConnect = useRef(false); // 防止重复尝试
  const eventListenersRegistered = useRef(false); // 防止重复注册事件监听器

  // 持久化存储键名 - 与Vue包保持一致
  const STORAGE_KEY = 'btc-connect-auto-connect';
  const WALLET_ID_KEY = 'btc-connect:last-wallet-id';

  // 检查是否支持自动连接
  const canAutoConnect = Boolean(
    autoConnectEnabled &&
      typeof window !== 'undefined' &&
      lastWalletId &&
      !ctx.isConnected &&
      manager,
  );

  // 从本地存储加载配置
  const loadStorageData = useCallback(() => {
    try {
      const storedWalletId = storage.get<string>(WALLET_ID_KEY);
      const autoConnectSetting = storage.get<string>(STORAGE_KEY);

      if (storedWalletId) {
        setLastWalletId(storedWalletId);
      }

      if (autoConnectSetting !== null) {
        setAutoConnectEnabled(autoConnectSetting === 'true');
      }
    } catch (error) {
      console.warn('Failed to load auto-connect settings:', error);
    }
  }, []);

  // 保存到本地存储
  const saveToStorage = useCallback(
    (walletId?: string) => {
      try {
        if (walletId) {
          storage.set(WALLET_ID_KEY, walletId);
          setLastWalletId(walletId);
        }

        storage.set(STORAGE_KEY, String(autoConnectEnabled));
      } catch (error) {
        console.warn('Failed to save auto-connect settings:', error);
      }
    },
    [autoConnectEnabled],
  );

  // 清除存储数据
  const clearStorageData = useCallback(() => {
    try {
      storage.remove(WALLET_ID_KEY);
      storage.remove(STORAGE_KEY);
      setLastWalletId(null);
    } catch (error) {
      console.warn('Failed to clear auto-connect settings:', error);
    }
  }, []);

  // 执行自动连接 - 简化版本，主要由事件驱动调用
  const performAutoConnect = useCallback(async (): Promise<
    AccountInfo[] | null
  > => {
    if (!canAutoConnect || !lastWalletId || !manager) {
      return null;
    }

    // 防止重复尝试
    if (hasAttemptedConnect.current) {
      return null;
    }

    hasAttemptedConnect.current = true;

    console.log(
      `🎯 [useAutoConnect] Event-driven auto-connect to: ${lastWalletId}`,
    );

    try {
      setIsAutoConnecting(true);

      // 检查钱包是否在可用列表中
      const availableWallets = ctx.availableWallets;
      const isWalletAvailable = availableWallets.some(
        (w) => w.id === lastWalletId,
      );

      if (!isWalletAvailable) {
        console.warn(
          `⚠️ [useAutoConnect] Wallet ${lastWalletId} is not available`,
        );
        return null;
      }

      // 使用assumeConnected方法尝试静默连接
      const accounts = await manager.assumeConnected(lastWalletId);

      if (accounts && accounts.length > 0) {
        console.log(
          `✅ [useAutoConnect] Auto-connected to ${lastWalletId}:`,
          accounts,
        );
        return accounts;
      } else {
        console.log(
          `❌ [useAutoConnect] No previous session found for ${lastWalletId}`,
        );
        return null;
      }
    } catch (error) {
      console.error(
        `❌ [useAutoConnect] Auto-connect failed for ${lastWalletId}:`,
        error,
      );
      return null;
    } finally {
      setIsAutoConnecting(false);
    }
  }, [canAutoConnect, lastWalletId, manager, ctx.availableWallets]);

  // 手动触发自动连接
  const triggerAutoConnect = useCallback(() => {
    return performAutoConnect();
  }, [performAutoConnect]);

  // 启用/禁用自动连接
  const setAutoConnect = useCallback(
    (enabled: boolean) => {
      setAutoConnectEnabled(enabled);
      saveToStorage();
    },
    [saveToStorage],
  );

  // 监听连接状态变化，保存钱包ID并重置尝试状态
  useEffect(() => {
    if (ctx.isConnected && ctx.currentWallet) {
      // 连接成功时，重置尝试状态并保存钱包ID
      hasAttemptedConnect.current = false;
      saveToStorage(ctx.currentWallet.id);
      console.log(
        `💾 [useAutoConnect] 已保存连接的钱包: ${ctx.currentWallet.id}`,
      );
    } else if (!ctx.isConnected) {
      // 断开连接时重置尝试状态，但保留设置以便下次自动重连
      hasAttemptedConnect.current = false;
      console.log(`🔄 [useAutoConnect] 已断开连接，重置自动连接状态`);
    }
  }, [ctx.isConnected, ctx.currentWallet, saveToStorage]);

  // 监听当前钱包变化
  useEffect(() => {
    if (ctx.currentWallet?.id && ctx.isConnected) {
      // 钱包变化时更新存储的钱包ID
      saveToStorage(ctx.currentWallet.id);
      setLastWalletId(ctx.currentWallet.id);
      console.log(`💾 [useAutoConnect] 已更新钱包ID: ${ctx.currentWallet.id}`);
    }
  }, [ctx.currentWallet?.id, ctx.isConnected, saveToStorage]);

  // 监听钱包检测事件，实现事件驱动的自动连接
  useEffect(() => {
    if (!manager || eventListenersRegistered.current) return;

    // 钱包检测完成事件处理
    const handleDetectionComplete = (
      params: WalletDetectionCompleteEventParams,
    ) => {
      console.log(
        `🔍 [useAutoConnect] Wallet detection complete: ${params.wallets.length} wallets found`,
      );

      // 如果检测完成且满足自动连接条件，立即尝试连接
      if (
        !hasAttemptedConnect.current &&
        !ctx.isConnected &&
        lastWalletId &&
        autoConnectEnabled
      ) {
        // 检查上次使用的钱包是否在检测结果中
        const targetWalletFound = params.wallets.includes(lastWalletId);
        if (targetWalletFound) {
          console.log(
            `🎯 [useAutoConnect] Target wallet ${lastWalletId} detected, attempting auto-connect`,
          );
          setTimeout(() => {
            performAutoConnect();
          }, 100); // 短暂延迟确保检测状态稳定
        } else {
          console.log(
            `⚠️ [useAutoConnect] Target wallet ${lastWalletId} not available in detection results`,
          );
        }
      }
    };

    // 单个钱包检测事件处理
    const handleWalletDetected = (params: WalletDetectedEventParams) => {
      console.log(
        `🔍 [useAutoConnect] Wallet detected: ${params.walletId} (${params.walletInfo.name})`,
      );

      // 如果检测到目标钱包且满足自动连接条件，立即尝试连接
      if (
        !hasAttemptedConnect.current &&
        !ctx.isConnected &&
        lastWalletId === params.walletId &&
        autoConnectEnabled
      ) {
        console.log(
          `🎯 [useAutoConnect] Target wallet ${params.walletId} detected, attempting immediate auto-connect`,
        );
        setTimeout(() => {
          performAutoConnect();
        }, 50); // 非常短的延迟以确保检测完成
      }
    };

    // 注册事件监听器
    manager.on('walletDetectionComplete', handleDetectionComplete);
    manager.on('walletDetected', handleWalletDetected);
    eventListenersRegistered.current = true;

    // 清理函数
    return () => {
      manager.off('walletDetectionComplete', handleDetectionComplete);
      manager.off('walletDetected', handleWalletDetected);
      eventListenersRegistered.current = false;
    };
  }, [
    manager,
    ctx.isConnected,
    lastWalletId,
    autoConnectEnabled,
    performAutoConnect,
  ]);

  // 组件挂载时的初始化
  useEffect(() => {
    // 加载存储的数据
    loadStorageData();

    // 备用方案：如果短时间内没有检测到事件，且目标钱包已经在可用列表中，直接尝试连接
    const timeoutId = setTimeout(() => {
      if (
        !hasAttemptedConnect.current &&
        !ctx.isConnected &&
        lastWalletId &&
        ctx.availableWallets.some((w) => w.id === lastWalletId) &&
        autoConnectEnabled
      ) {
        console.log(
          `🔄 [useAutoConnect] 备用方案：直接尝试连接 ${lastWalletId}`,
        );
        performAutoConnect();
      }
    }, 2000); // 2秒备用超时

    return () => clearTimeout(timeoutId);
  }, [
    loadStorageData,
    ctx.isConnected,
    lastWalletId,
    ctx.availableWallets,
    autoConnectEnabled,
    performAutoConnect,
  ]);

  // 监听页面可见性变化，当用户回到页面时重置状态并尝试自动连接
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        // 用户回到页面时重置尝试状态
        hasAttemptedConnect.current = false;

        // 如果条件满足，尝试自动连接
        if (
          canAutoConnect &&
          !ctx.isConnected &&
          ctx.availableWallets.some((w) => w.id === lastWalletId)
        ) {
          console.log(`🔄 [useAutoConnect] 页面可见，尝试自动连接`);
          await performAutoConnect();
        }
      }
    };

    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => {
        document.removeEventListener(
          'visibilitychange',
          handleVisibilityChange,
        );
      };
    }
  }, [
    canAutoConnect,
    ctx.isConnected,
    ctx.availableWallets,
    lastWalletId,
    performAutoConnect,
  ]);

  return {
    // 状态
    isAutoConnecting,
    lastWalletId,
    autoConnectEnabled,
    canAutoConnect,

    // 方法
    triggerAutoConnect,
    setAutoConnect,
    clearStorageData,
    performAutoConnect,
  };
}
