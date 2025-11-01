/**
 * 钱包检测功能的 Composable
 *
 * 基于事件驱动的钱包检测系统，提供实时检测状态和手动控制功能
 */

import type { ComputedRef, Ref } from 'vue';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import type { WalletInfo } from '../types';
import { useWalletContext } from '../walletContext';

/**
 * 钱包检测状态
 */
export interface WalletDetectionState {
  isDetecting: boolean;
  availableWallets: WalletInfo[];
  detectedWallets: string[];
  elapsedTime: number;
  isComplete: boolean;
  lastDetectionTime: number | null;
}

/**
 * 使用钱包检测功能的 Composable
 */
export function useWalletDetection() {
  const ctx = useWalletContext();

  // 检测状态
  const detectionState: Ref<WalletDetectionState> = ref({
    isDetecting: false,
    availableWallets: [],
    detectedWallets: [],
    elapsedTime: 0,
    isComplete: false,
    lastDetectionTime: null,
  });

  // 事件监听器注册状态
  const eventListenersRegistered = ref(false);

  // 计算属性
  const isDetecting: ComputedRef<boolean> = computed(() => {
    return ctx.isDetecting.value || detectionState.value.isDetecting;
  });

  const availableWallets: ComputedRef<WalletInfo[]> = computed(() => {
    return ctx.availableWallets.value;
  });

  const detectedWallets: ComputedRef<string[]> = computed(() => {
    return detectionState.value.detectedWallets;
  });

  const isComplete: ComputedRef<boolean> = computed(() => {
    return detectionState.value.isComplete;
  });

  const elapsedTime: ComputedRef<number> = computed(() => {
    return detectionState.value.elapsedTime;
  });

  const lastDetectionTime: ComputedRef<number | null> = computed(() => {
    return detectionState.value.lastDetectionTime;
  });

  // 获取检测统计信息
  const detectionStats = computed(() => {
    const walletCount = availableWallets.value.length;
    const detectedCount = detectedWallets.value.length;

    return {
      totalWallets: walletCount,
      detectedWallets: detectedCount,
      detectionRate: walletCount > 0 ? (detectedCount / walletCount) * 100 : 0,
      averageDetectionTime: elapsedTime.value,
      isOptimal:
        (walletCount > 0 ? (detectedCount / walletCount) * 100 : 0) >= 80 &&
        elapsedTime.value <= 5000,
    };
  });

  // 检查特定钱包是否已检测
  const isWalletDetected = (walletId: string): boolean => {
    return detectedWallets.value.includes(walletId);
  };

  // 获取钱包检测时间
  const getWalletDetectionTime = (_walletId: string): number | null => {
    // 这里可以从 detectionManager 获取更详细的时间信息
    // 目前返回检测完成的总时间
    return detectionState.value.isComplete
      ? detectionState.value.elapsedTime
      : null;
  };

  // 手动启动检测
  const startDetection = async (): Promise<void> => {
    if (!ctx.detectionManager.value) {
      console.warn('⚠️ [useWalletDetection] 检测管理器未初始化');
      return;
    }

    if (isDetecting.value) {
      console.warn('⚠️ [useWalletDetection] 检测已在进行中');
      return;
    }

    console.log('🔍 [useWalletDetection] 手动启动钱包检测');

    try {
      await ctx.startWalletDetection();
      console.log('✅ [useWalletDetection] 检测启动成功');
    } catch (error) {
      console.error('❌ [useWalletDetection] 检测启动失败:', error);
    }
  };

  // 停止检测
  const stopDetection = (): void => {
    if (!ctx.detectionManager.value) {
      console.warn('⚠️ [useWalletDetection] 检测管理器未初始化');
      return;
    }

    if (!isDetecting.value) {
      console.warn('⚠️ [useWalletDetection] 检测未在进行中');
      return;
    }

    console.log('🛑 [useWalletDetection] 停止钱包检测');
    ctx.stopWalletDetection();
  };

  // 重新检测
  const restartDetection = async (): Promise<void> => {
    console.log('🔄 [useWalletDetection] 重新启动钱包检测');
    stopDetection();

    // 等待一小段时间确保状态清理完成
    setTimeout(async () => {
      await startDetection();
    }, 100);
  };

  // 注册事件监听器
  const registerEventListeners = (): void => {
    if (eventListenersRegistered.value || !ctx.detectionManager.value) {
      return;
    }

    const detectionManager = ctx.detectionManager.value;

    // 监听新钱包检测事件
    detectionManager.on('walletDetected', (params) => {
      console.log(`📡 [useWalletDetection] 检测到新钱包: ${params.walletId}`);

      // 更新检测状态
      detectionState.value.detectedWallets.push(params.walletId);
      detectionState.value.elapsedTime =
        params.timestamp -
        (detectionState.value.lastDetectionTime || Date.now());

      // 如果这是第一次检测到钱包，更新开始时间
      if (detectionState.value.detectedWallets.length === 1) {
        detectionState.value.lastDetectionTime = params.timestamp;
      }
    });

    // 监听可用钱包列表变化事件
    detectionManager.on('availableWallets', (params) => {
      console.log(
        `📱 [useWalletDetection] 可用钱包列表更新: ${params.wallets.length}个钱包`,
      );

      // 更新可用钱包列表
      detectionState.value.availableWallets = params.wallets;
      detectionState.value.detectedWallets = params.wallets.map((w) => w.id);
    });

    // 监听检测完成事件
    detectionManager.on('walletDetectionComplete', (params) => {
      console.log(
        `🏁 [useWalletDetection] 检测完成: ${params.wallets.length}个钱包 (耗时: ${params.elapsedTime}ms)`,
      );

      // 更新最终状态
      detectionState.value.isDetecting = false;
      detectionState.value.isComplete = params.isComplete;
      detectionState.value.elapsedTime = params.elapsedTime;
      detectionState.value.detectedWallets = params.wallets;
      detectionState.value.availableWallets = params.wallets.map((w) => w.id);
    });

    eventListenersRegistered.value = true;
    console.log('✅ [useWalletDetection] 已注册钱包检测事件监听器');
  };

  // 组件挂载时初始化
  onMounted(() => {
    // 立即注册事件监听器（如果检测管理器已就绪）
    if (ctx.detectionManager.value) {
      registerEventListeners();

      // 如果检测正在进行，同步当前状态
      if (ctx.isDetecting.value) {
        detectionState.value.isDetecting = true;
        detectionState.value.availableWallets = ctx.availableWallets.value;
        detectionState.value.detectedWallets = ctx.availableWallets.value.map(
          (w) => w.id,
        );
      }
    } else {
      // 如果检测管理器还未就绪，监听其变化
      const unwatch = watch(
        () => ctx.detectionManager.value,
        (detectionManager) => {
          if (detectionManager) {
            registerEventListeners();
            unwatch(); // 停止监听，避免重复注册
          }
        },
        { immediate: true },
      );
    }

    // 监听检测状态变化
    const _unwatchDetecting = watch(
      () => ctx.isDetecting.value,
      (isDetecting) => {
        detectionState.value.isDetecting = isDetecting;
      },
      { immediate: true },
    );

    // 监听可用钱包列表变化
    const _unwatchAvailable = watch(
      () => ctx.availableWallets.value,
      (availableWallets) => {
        detectionState.value.availableWallets = availableWallets;
        if (
          availableWallets.length > 0 &&
          !detectionState.value.lastDetectionTime
        ) {
          detectionState.value.lastDetectionTime = Date.now();
        }
      },
      { immediate: true },
    );
  });

  // 组件卸载时清理
  onUnmounted(() => {
    // 移除所有事件监听器
    if (ctx.detectionManager.value && eventListenersRegistered.value) {
      // 由于当前实现中检测管理器的事件系统可能不支持移除特定监听器
      // 这里我们只重置状态标志
      eventListenersRegistered.value = false;
    }
  });

  return {
    // 状态
    isDetecting,
    availableWallets,
    detectedWallets,
    isComplete,
    elapsedTime,
    lastDetectionTime,
    detectionStats,

    // 方法
    isWalletDetected,
    getWalletDetectionTime,
    startDetection,
    stopDetection,
    restartDetection,
  };
}
