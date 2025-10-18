import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useWalletContext } from '../walletContext';
import type { AccountInfo } from '../types';

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

  // 持久化存储键名 - 与React包保持一致
  const STORAGE_KEY = 'btc-connect-auto-connect';
  const WALLET_ID_KEY = 'btc-connect:last-wallet-id';

  // 检查是否支持自动连接
  const canAutoConnect = computed(() => {
    return autoConnectEnabled.value &&
           typeof window !== 'undefined' &&
           !!lastWalletId.value &&
           !ctx.isConnected.value;
  });

  // 从本地存储加载配置
  const loadStorageData = () => {
    if (typeof window === 'undefined') return;

    try {
      const storedWalletId = localStorage.getItem(WALLET_ID_KEY);
      const autoConnectSetting = localStorage.getItem(STORAGE_KEY);

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
    if (typeof window === 'undefined') return;

    try {
      if (walletId) {
        localStorage.setItem(WALLET_ID_KEY, walletId);
        lastWalletId.value = walletId;
      }

      localStorage.setItem(STORAGE_KEY, String(autoConnectEnabled.value));
    } catch (error) {
      console.warn('Failed to save auto-connect settings:', error);
    }
  };

  // 清除存储数据
  const clearStorageData = () => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(WALLET_ID_KEY);
      localStorage.removeItem(STORAGE_KEY);
      lastWalletId.value = null;
    } catch (error) {
      console.warn('Failed to clear auto-connect settings:', error);
    }
  };

  // 执行自动连接
  const performAutoConnect = async (): Promise<AccountInfo[] | null> => {
    if (!canAutoConnect.value || !lastWalletId.value || !ctx.manager.value) {
      return null;
    }

    console.log(`🔄 [useAutoConnect] Attempting auto-connect to: ${lastWalletId.value}`);

    try {
      isAutoConnecting.value = true;

      // 首先检查钱包是否可用
      const availableWallets = ctx.manager.value.getAvailableWallets();
      const isWalletAvailable = availableWallets.some(w => w.id === lastWalletId.value);

      if (!isWalletAvailable) {
        console.warn(`⚠️ [useAutoConnect] Wallet ${lastWalletId.value} is not available`);
        clearStorageData();
        return null;
      }

      // 使用assumeConnected方法尝试静默连接
      const accounts = await ctx.manager.value.assumeConnected(lastWalletId.value);

      if (accounts && accounts.length > 0) {
        console.log(`✅ [useAutoConnect] Auto-connected to ${lastWalletId.value}:`, accounts);
        return accounts;
      } else {
        console.log(`❌ [useAutoConnect] No previous session found for ${lastWalletId.value}`);
        return null;
      }

    } catch (error) {
      console.error(`❌ [useAutoConnect] Auto-connect failed for ${lastWalletId.value}:`, error);
      // 清除无效的钱包ID
      clearStorageData();
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

  // 监听连接状态变化，保存钱包ID
  watch(
    () => ctx.isConnected.value,
    (connected) => {
      if (connected && ctx.currentWallet.value) {
        saveToStorage(ctx.currentWallet.value.id);
      } else if (!connected) {
        // 断开连接时可以选择是否清除自动连接设置
        // 这里我们保留设置，以便下次可以自动重连
      }
    }
  );

  // 监听当前钱包变化
  watch(
    () => ctx.currentWallet.value?.id,
    (walletId) => {
      if (walletId && ctx.isConnected.value) {
        saveToStorage(walletId);
      }
    }
  );

  // 组件挂载时执行自动连接
  onMounted(() => {
    // 加载存储的数据
    loadStorageData();

    // 延迟执行自动连接，确保钱包适配器完全初始化
    setTimeout(async () => {
      if (canAutoConnect.value) {
        await performAutoConnect();
      }
    }, 1000); // 延迟1秒执行
  });

  // 监听页面可见性变化，当用户回到页面时尝试自动连接
  const handleVisibilityChange = async () => {
    if (document.visibilityState === 'visible' && canAutoConnect.value && !ctx.isConnected.value) {
      // 用户回到页面且未连接时，尝试自动连接
      await performAutoConnect();
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