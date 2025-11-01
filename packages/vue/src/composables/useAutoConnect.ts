import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import type { AccountInfo } from '../types';
import { storage } from '../utils';
import { useWalletContext } from '../walletContext';

/**
 * 自动连接功能的Composable
 * 负责在页面刷新后自动恢复之前的钱包连接
 */
export function useAutoConnect() {
  const ctx = useWalletContext();

  // 自动连接状态
  const isAutoConnecting = ref(false);
  const lastWalletId = ref<string | null>(null);
  const autoConnectEnabled = ref(true);
  const hasAttemptedConnect = ref(false); // 防止重复尝试
  const eventListenersRegistered = ref(false); // 防止重复注册事件监听器

  // 持久化存储键名 - 与React包保持一致
  const STORAGE_KEY = 'btc-connect-auto-connect';
  const WALLET_ID_KEY = 'btc-connect:last-wallet-id';

  // 检查是否支持自动连接
  const canAutoConnect = computed(() => {
    return (
      autoConnectEnabled.value &&
      typeof window !== 'undefined' &&
      !!lastWalletId.value &&
      !ctx.isConnected.value
    );
  });

  // 从本地存储加载配置
  const loadStorageData = () => {
    try {
      const storedWalletId = storage.get<string>(WALLET_ID_KEY);
      const autoConnectSetting = storage.get<string>(STORAGE_KEY);

      if (storedWalletId) {
        lastWalletId.value = storedWalletId;
      }

      if (autoConnectSetting !== null) {
        autoConnectEnabled.value = autoConnectSetting === 'true';
      }
    } catch (error) {
      console.warn('Failed to load auto-connect settings:', error);
    }
  };

  // 保存到本地存储
  const saveToStorage = (walletId?: string) => {
    try {
      if (walletId) {
        storage.set(WALLET_ID_KEY, walletId);
        lastWalletId.value = walletId;
      }

      storage.set(STORAGE_KEY, String(autoConnectEnabled.value));
    } catch (error) {
      console.warn('Failed to save auto-connect settings:', error);
    }
  };

  // 清除存储数据
  const clearStorageData = () => {
    try {
      storage.remove(WALLET_ID_KEY);
      storage.remove(STORAGE_KEY);
      lastWalletId.value = null;
    } catch (error) {
      console.warn('Failed to clear auto-connect settings:', error);
    }
  };

  // 执行自动连接 - 简化版本，主要由事件驱动调用
  const performAutoConnect = async (): Promise<AccountInfo[] | null> => {
    if (!canAutoConnect.value || !lastWalletId.value || !ctx.manager.value) {
      return null;
    }

    // 防止重复尝试
    if (hasAttemptedConnect.value) {
      return null;
    }

    hasAttemptedConnect.value = true;

    console.log(
      `🎯 [useAutoConnect] Event-driven auto-connect to: ${lastWalletId.value}`,
    );

    try {
      isAutoConnecting.value = true;

      // 检查钱包是否在可用列表中
      const availableWallets = ctx.availableWallets.value;
      const isWalletAvailable = availableWallets.some(
        (w) => w.id === lastWalletId.value,
      );

      if (!isWalletAvailable) {
        console.warn(
          `⚠️ [useAutoConnect] Wallet ${lastWalletId.value} is not available`,
        );
        return null;
      }

      // 使用assumeConnected方法尝试静默连接
      const accounts = await ctx.manager.value.assumeConnected(
        lastWalletId.value,
      );

      if (accounts && accounts.length > 0) {
        console.log(
          `✅ [useAutoConnect] Auto-connected to ${lastWalletId.value}:`,
          accounts,
        );
        return accounts;
      } else {
        console.log(
          `❌ [useAutoConnect] No previous session found for ${lastWalletId.value}`,
        );
        return null;
      }
    } catch (error) {
      console.error(
        `❌ [useAutoConnect] Auto-connect failed for ${lastWalletId.value}:`,
        error,
      );
      return null;
    } finally {
      isAutoConnecting.value = false;
    }
  };

  // 手动触发自动连接
  const triggerAutoConnect = async () => {
    return await performAutoConnect();
  };

  // 启用/禁用自动连接
  const setAutoConnect = (enabled: boolean) => {
    autoConnectEnabled.value = enabled;
    saveToStorage();
  };

  // 监听连接状态变化，保存钱包ID并重置尝试状态
  watch(
    () => ctx.isConnected.value,
    (connected) => {
      if (connected && ctx.currentWallet.value) {
        // 连接成功时，重置尝试状态并保存钱包ID
        hasAttemptedConnect.value = false;
        saveToStorage(ctx.currentWallet.value.id);
        console.log(
          `💾 [useAutoConnect] 已保存连接的钱包: ${ctx.currentWallet.value.id}`,
        );
      } else if (!connected) {
        // 断开连接时重置尝试状态，但保留设置以便下次自动重连
        hasAttemptedConnect.value = false;
        console.log(`🔄 [useAutoConnect] 已断开连接，重置自动连接状态`);
      }
    },
  );

  // 监听当前钱包变化
  watch(
    () => ctx.currentWallet.value?.id,
    (walletId) => {
      if (walletId && ctx.isConnected.value) {
        // 钱包变化时更新存储的钱包ID
        saveToStorage(walletId);
        lastWalletId.value = walletId;
        console.log(`💾 [useAutoConnect] 已更新钱包ID: ${walletId}`);
      }
    },
  );

  // 注册钱包检测事件监听器
  const registerWalletDetectionListeners = () => {
    if (eventListenersRegistered.value || !ctx.detectionManager.value) {
      return;
    }

    const detectionManager = ctx.detectionManager.value;

    // 监听钱包检测事件
    detectionManager.on('walletDetected', (params) => {
      console.log(`📡 [useAutoConnect] 检测到钱包事件: ${params.walletId}`);

      // 如果是上次连接的钱包且还未尝试连接，立即尝试自动连接
      if (
        params.walletId === lastWalletId.value &&
        !hasAttemptedConnect.value &&
        !ctx.isConnected.value &&
        autoConnectEnabled.value
      ) {
        console.log(
          `🚀 [useAutoConnect] 检测到目标钱包 ${params.walletId}，立即触发自动连接`,
        );
        // 延迟一小段时间确保钱包完全就绪
        setTimeout(() => {
          performAutoConnect();
        }, 100);
      }
    });

    // 监听检测完成事件，如果还没有连接但钱包已检测到，尝试连接
    detectionManager.on('walletDetectionComplete', (params) => {
      console.log(`📡 [useAutoConnect] 钱包检测完成事件`);

      // 如果检测完成后仍未连接且目标钱包在列表中，尝试连接
      if (
        !ctx.isConnected.value &&
        !hasAttemptedConnect.value &&
        lastWalletId.value &&
        params.wallets.includes(lastWalletId.value) &&
        autoConnectEnabled.value
      ) {
        console.log(
          `🔄 [useAutoConnect] 检测完成，尝试连接目标钱包 ${lastWalletId.value}`,
        );
        performAutoConnect();
      }
    });

    eventListenersRegistered.value = true;
    console.log('✅ [useAutoConnect] 已注册钱包检测事件监听器');
  };

  // 组件挂载时的初始化
  onMounted(() => {
    // 加载存储的数据
    loadStorageData();

    // 立即注册事件监听器（如果检测管理器已就绪）
    if (ctx.detectionManager.value) {
      registerWalletDetectionListeners();
    } else {
      // 如果检测管理器还未就绪，监听其变化
      const unwatch = watch(
        () => ctx.detectionManager.value,
        (detectionManager) => {
          if (detectionManager) {
            registerWalletDetectionListeners();
            unwatch(); // 停止监听，避免重复注册
          }
        },
        { immediate: true },
      );
    }

    // 备用方案：如果短时间内没有检测到事件，且目标钱包已经在可用列表中，直接尝试连接
    setTimeout(() => {
      if (
        !hasAttemptedConnect.value &&
        !ctx.isConnected.value &&
        lastWalletId.value &&
        ctx.availableWallets.value.some((w) => w.id === lastWalletId.value) &&
        autoConnectEnabled.value
      ) {
        console.log(
          `🔄 [useAutoConnect] 备用方案：直接尝试连接 ${lastWalletId.value}`,
        );
        performAutoConnect();
      }
    }, 2000); // 2秒备用超时
  });

  // 监听页面可见性变化，当用户回到页面时重置状态并尝试自动连接
  const handleVisibilityChange = async () => {
    if (document.visibilityState === 'visible') {
      // 用户回到页面时重置尝试状态
      hasAttemptedConnect.value = false;

      // 如果条件满足，尝试自动连接
      if (
        canAutoConnect.value &&
        !ctx.isConnected.value &&
        ctx.availableWallets.value.some((w) => w.id === lastWalletId.value)
      ) {
        console.log(`🔄 [useAutoConnect] 页面可见，尝试自动连接`);
        await performAutoConnect();
      }
    }
  };

  onMounted(() => {
    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }
  });

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  });

  return {
    // 状态
    isAutoConnecting: computed(() => isAutoConnecting.value),
    lastWalletId: computed(() => lastWalletId.value),
    autoConnectEnabled: computed(() => autoConnectEnabled.value),
    canAutoConnect,

    // 方法
    triggerAutoConnect,
    setAutoConnect,
    clearStorageData,
    performAutoConnect,
  };
}
