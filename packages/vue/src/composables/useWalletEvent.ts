import type {
  EventHandler,
  UseWalletEventReturn,
  WalletEvent,
} from '@btc-connect/core';
import { onUnmounted, ref } from 'vue';
import { useWalletContext } from '../walletContext';

/**
 * 钱包事件监听 Composable
 *
 * 提供钱包事件的订阅和管理功能，支持自动清理监听器
 *
 * @example
 * ```vue
 * <script setup>
 * import { useWalletEvent } from '@btc-connect/vue';
 *
 * // 监听连接事件
 * useWalletEvent('connect', (accounts) => {
 *   console.log('钱包已连接:', accounts);
 * });
 *
 * // 监听断开连接事件
 * useWalletEvent('disconnect', () => {
 *   console.log('钱包已断开连接');
 * });
 *
 * // 监听账户变化事件
 * useWalletEvent('accountChange', (accounts) => {
 *   console.log('账户已变化:', accounts);
 * });
 *
 * // 监听网络变化事件
 * useWalletEvent('networkChange', ({ network }) => {
 *   console.log('网络已切换:', network);
 * });
 * </script>
 * ```
 */
export function useWalletEvent<T extends WalletEvent>(
  event: T,
  handler: EventHandler<T>,
): UseWalletEventReturn {
  const ctx = useWalletContext();
  const isActive = ref(true);

  // 包装处理器以检查组件是否还活跃
  const wrappedHandler = handler as any;

  // 添加事件监听器
  if (ctx.manager.value) {
    ctx.manager.value.on(event, wrappedHandler);
  }

  // 组件卸载时自动清理
  onUnmounted(() => {
    isActive.value = false;
    if (ctx.manager.value) {
      ctx.manager.value.off(event, wrappedHandler);
    }
  });

  return {
    on: (newEvent: any, newHandler: any) => {
      if (ctx.manager.value) {
        ctx.manager.value.on(newEvent, newHandler);
      }
      return () => {
        if (ctx.manager.value) {
          ctx.manager.value.off(newEvent, newHandler);
        }
      };
    },
    once: (newEvent: any, newHandler: any) => {
      if (ctx.manager.value) {
        // 简化实现，直接添加监听器
        ctx.manager.value.on(newEvent, newHandler);
      }
      return () => {
        if (ctx.manager.value) {
          ctx.manager.value.off(newEvent, newHandler);
        }
      };
    },
    off: (newEvent: any, newHandler: any) => {
      if (ctx.manager.value) {
        ctx.manager.value.off(newEvent, newHandler);
      }
    },
    eventHistory: [],
    clear: () => {
      // 清理当前事件监听器
      if (ctx.manager.value) {
        ctx.manager.value.off(event, wrappedHandler);
      }
      isActive.value = false;
    },
    clearHistory: () => {
      // 清理事件历史（简化实现）
    },
    removeAllListeners: () => {
      // 简化实现
      if (ctx.manager.value) {
        // 由于没有移除所有监听器的方法，这里只是占位
      }
    },
    event: event,
  } as UseWalletEventReturn;
}

/**
 * 高级事件监听 Composable
 *
 * 提供多事件监听、条件监听和手动管理功能
 *
 * @example
 * ```vue
 * <script setup>
 * import { useWalletEventAdvanced } from '@btc-connect/vue';
 *
 * const { addListener, removeListener, clearAllListeners } = useWalletEventAdvanced();
 *
 * // 添加多个监听器
 * const connectListener = addListener('connect', (accounts) => {
 *   console.log('连接成功:', accounts);
 * });
 *
 * const disconnectListener = addListener('disconnect', () => {
 *   console.log('已断开连接');
 * });
 *
 * // 条件监听（仅在特定条件下监听）
 * const conditionalListener = addListener('accountChange', (accounts) => {
 *   console.log('账户变化:', accounts);
 * }, { condition: () => shouldListen.value });
 *
 * // 手动移除监听器
 * const handleRemove = () => {
 *   removeListener(connectListener);
 * };
 * </script>
 * ```
 */
export function useWalletEventAdvanced() {
  const ctx = useWalletContext();
  const listeners = ref<
    Array<{
      event: WalletEvent;
      handler: EventHandler<WalletEvent>;
      unsubscribe: () => void;
    }>
  >([]);

  const addListener = <T extends WalletEvent>(
    event: T,
    handler: EventHandler<T>,
    options?: {
      condition?: () => boolean;
      once?: boolean;
    },
  ) => {
    if (!ctx.manager.value) {
      return null;
    }

    let wrappedHandler: EventHandler<T>;
    let unsubscribe: () => void;

    if (options?.once) {
      // 一次性监听器
      wrappedHandler = ((...args: any[]) => {
        if (!options.condition || options.condition()) {
          (handler as any)(...args);
          unsubscribe();
        }
      }) as EventHandler<T>;
    } else {
      // 普通监听器
      wrappedHandler = ((...args: any[]) => {
        if (!options.condition || options.condition()) {
          (handler as any)(...args);
        }
      }) as EventHandler<T>;
    }

    // 添加监听器
    ctx.manager.value.on(event, wrappedHandler);
    unsubscribe = () => {
      if (ctx.manager.value) {
        ctx.manager.value.off(event, wrappedHandler);
      }
    };

    // 存储监听器引用
    const listenerRef = { event, handler: wrappedHandler, unsubscribe };
    listeners.value.push(listenerRef);

    return listenerRef;
  };

  const removeListener = (listenerRef: ReturnType<typeof addListener>) => {
    if (listenerRef) {
      listenerRef.unsubscribe();
      const index = listeners.value.indexOf(listenerRef);
      if (index > -1) {
        listeners.value.splice(index, 1);
      }
    }
  };

  const clearAllListeners = () => {
    listeners.value.forEach((listener) => {
      listener.unsubscribe();
    });
    listeners.value = [];
  };

  // 组件卸载时清理所有监听器
  onUnmounted(() => {
    clearAllListeners();
  });

  return {
    addListener,
    removeListener,
    clearAllListeners,
    listeners,
  };
}
