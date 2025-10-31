/**
 * 核心钱包功能 Composable
 *
 * 提供对钱包管理器的核心访问，包含错误处理和性能优化
 */

import {
  type ComputedRef,
  computed,
  nextTick,
  onUnmounted,
  readonly,
  ref,
  watch,
} from 'vue';
import { useConfig } from '../config';
import { isClient } from '../index';
import type { UseCoreReturn } from '../types';
import { useWalletContext } from '../walletContext';

/**
 * 使用核心钱包功能的Composable - 提供对manager的访问
 */
export function useCore(): UseCoreReturn {
  const ctx = useWalletContext();
  const config = useConfig();

  // 错误边界检查
  if (!ctx) {
    throw new Error('useCore must be used within BTCWalletPlugin');
  }

  // 性能优化的计算属性
  const isConnected: ComputedRef<boolean> = computed(() => {
    return Boolean(ctx.isConnected.value && ctx.manager.value);
  });

  // 添加错误处理的连接方法
  const connect = async (walletId: string) => {
    if (!isClient) {
      throw new Error('Cannot connect wallet on server side');
    }

    if (!ctx.manager.value) {
      throw new Error('Wallet manager not initialized');
    }

    if (!walletId) {
      throw new Error('Wallet ID is required');
    }

    const startTime = performance.now();

    try {
      if (config.getDevConfig().debug) {
        console.log(`🔗 [useCore] Connecting to wallet: ${walletId}`);
      }

      const accounts = await ctx.connect(walletId);

      // 性能监控
      if (config.getPerformanceConfig().enableCache) {
        const duration = performance.now() - startTime;
        if (config.getDevConfig().showPerformanceMetrics) {
          console.log(`⚡ [useCore] Connection took ${duration.toFixed(2)}ms`);
        }
      }

      // 等待下一个tick确保状态更新
      await nextTick();

      return accounts;
    } catch (error) {
      console.error(`❌ [useCore] Failed to connect to ${walletId}:`, error);
      throw error;
    }
  };

  // 添加错误处理的断开连接方法
  const disconnect = async () => {
    if (!isClient) {
      return;
    }

    if (!ctx.manager.value) {
      return;
    }

    try {
      if (config.getDevConfig().debug) {
        console.log('🔌 [useCore] Disconnecting wallet');
      }

      await ctx.disconnect();

      // 等待下一个tick确保状态更新
      await nextTick();
    } catch (error) {
      console.error('❌ [useCore] Failed to disconnect wallet:', error);
      throw error;
    }
  };

  // 添加错误处理的切换钱包方法
  const switchWallet = async (walletId: string) => {
    if (!isClient) {
      throw new Error('Cannot switch wallet on server side');
    }

    if (!ctx.manager.value) {
      throw new Error('Wallet manager not initialized');
    }

    if (!walletId) {
      throw new Error('Wallet ID is required');
    }

    try {
      if (config.getDevConfig().debug) {
        console.log(`🔄 [useCore] Switching to wallet: ${walletId}`);
      }

      const accounts = await ctx.switchWallet(walletId);

      // 等待下一个tick确保状态更新
      await nextTick();

      return accounts;
    } catch (error) {
      console.error(`❌ [useCore] Failed to switch to ${walletId}:`, error);
      throw error;
    }
  };

  // 监听连接状态变化，进行性能优化
  let stateUpdateTimer: NodeJS.Timeout | null = null;

  const throttledStateUpdate = () => {
    if (stateUpdateTimer) {
      clearTimeout(stateUpdateTimer);
    }

    stateUpdateTimer = setTimeout(() => {
      // 强制触发状态重新计算
      ctx._stateUpdateTrigger.value++;

      // 清除定时器
      stateUpdateTimer = null;
    }, config.getPerformanceConfig().stateUpdateThrottle);
  };

  // 监听状态变化
  watch(
    () => ctx.state.value,
    () => {
      throttledStateUpdate();
    },
    { deep: false, flush: 'post' },
  );

  // 组件卸载时清理定时器
  onUnmounted(() => {
    if (stateUpdateTimer) {
      clearTimeout(stateUpdateTimer);
      stateUpdateTimer = null;
    }
  });

  return {
    // 核心管理器
    manager: ctx.manager,

    // 状态（优化响应性）
    state: ctx.state,
    isConnected,
    isConnecting: ctx.isConnecting,
    currentWallet: ctx.currentWallet,
    availableWallets: ctx.availableWallets,

    // 主题
    theme: ctx.theme,

    // 操作方法（增强错误处理）
    connect,
    disconnect,
    switchWallet,
  };
}

/**
 * 获取钱包管理器的直接访问（仅用于高级用法）
 *
 * @warning 直接操作管理器可能跳过 Vue 的响应式系统，请谨慎使用
 */
export function useWalletManager() {
  const ctx = useWalletContext();

  if (!ctx?.manager.value) {
    throw new Error('Wallet manager not initialized');
  }

  return ctx.manager.value;
}

/**
 * 钱包状态监听器（用于调试和监控）
 *
 * @param callback 状态变化回调
 * @returns 清理函数
 */
export function useWalletStateMonitor(
  callback: (state: any, prevState: any) => void,
) {
  const ctx = useWalletContext();
  const config = useConfig();

  if (!config.getDevConfig().debug) {
    // 非调试模式下不启用监控
    return () => {};
  }

  let prevState = null;

  const stopWatcher = watch(
    () => ctx.state.value,
    (newState) => {
      if (prevState !== null) {
        callback(newState, prevState);
      }
      prevState = { ...newState };
    },
    { deep: true, immediate: false },
  );

  return () => {
    stopWatcher();
  };
}

/**
 * 性能监控 Composable
 */
export function usePerformanceMonitor() {
  const config = useConfig();

  const metrics = ref({
    connectionTime: 0,
    stateUpdateCount: 0,
    lastUpdateTime: 0,
  });

  if (config.getPerformanceConfig().enableCache) {
    const ctx = useWalletContext();

    // 监控状态更新
    watch(
      () => ctx._stateUpdateTrigger.value,
      () => {
        metrics.value.stateUpdateCount++;
        metrics.value.lastUpdateTime = Date.now();
      },
    );
  }

  return {
    metrics: readonly(metrics),
    reset: () => {
      metrics.value = {
        connectionTime: 0,
        stateUpdateCount: 0,
        lastUpdateTime: 0,
      };
    },
  };
}
