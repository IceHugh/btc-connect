// 性能优化相关的 composables
// 提供基本的性能监控功能

import { ref, computed, onMounted, onUnmounted } from 'vue';

// 防抖hook
export function useDebounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): {
  debouncedFn: (...args: Parameters<T>) => void;
  cancel: () => void;
} {
  let timeoutId: number | null = null;

  const debouncedFn = (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };

  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  onUnmounted(() => {
    cancel();
  });

  return { debouncedFn, cancel };
}

// 节流hook
export function useThrottle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): {
  throttledFn: (...args: Parameters<T>) => void;
  cancel: () => void;
} {
  let lastExecution = 0;
  let timeoutId: number | null = null;

  const throttledFn = (...args: Parameters<T>) => {
    const now = Date.now();

    if (now - lastExecution >= delay) {
      lastExecution = now;
      fn(...args);
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        lastExecution = Date.now();
        fn(...args);
      }, delay - (now - lastExecution));
    }
  };

  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  onUnmounted(() => {
    cancel();
  });

  return { throttledFn, cancel };
}

// 性能监控hook
export function usePerformanceMonitor() {
  const metrics = ref<{
    connectTime: number;
    disconnectTime: number;
    switchTime: number;
    balanceRefreshTime: number;
    errorCount: number;
    successCount: number;
  }>({
    connectTime: 0,
    disconnectTime: 0,
    switchTime: 0,
    balanceRefreshTime: 0,
    errorCount: 0,
    successCount: 0
  });

  const timerStart = ref<number | null>(null);

  const startTimer = () => {
    timerStart.value = performance.now();
  };

  const endTimer = (metricName: keyof typeof metrics.value) => {
    if (timerStart.value !== null) {
      const duration = performance.now() - timerStart.value;
      (metrics.value as any)[metricName] = duration;
      timerStart.value = null;
    }
  };

  const recordSuccess = () => {
    metrics.value.successCount++;
  };

  const recordError = () => {
    metrics.value.errorCount++;
  };

  const reset = () => {
    metrics.value = {
      connectTime: 0,
      disconnectTime: 0,
      switchTime: 0,
      balanceRefreshTime: 0,
      errorCount: 0,
      successCount: 0
    };
  };

  return {
    metrics,
    startTimer,
    endTimer,
    recordSuccess,
    recordError,
    reset,
  };
}

// 内存使用监控
export function useMemoryMonitor() {
  const memoryInfo = ref<{
    used: number;
    total: number;
    limit: number;
    percentage: number;
  } | null>(null);

  const isSupported = computed(() => {
    return 'memory' in performance;
  });

  const updateMemoryInfo = () => {
    if (isSupported.value && (performance as any).memory) {
      const memory = (performance as any).memory;
      memoryInfo.value = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      };
    }
  };

  // 定期更新内存信息
  let intervalId: number | null = null;

  onMounted(() => {
    updateMemoryInfo();
    intervalId = setInterval(updateMemoryInfo, 5000); // 每5秒更新一次
  });

  onUnmounted(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  });

  return {
    memoryInfo,
    isSupported,
    updateMemoryInfo
  };
}

// 网络检测hook
export function useNetworkDetector() {
  // SSR 安全：默认设为在线，在客户端初始化时更新为实际状态
  const isOnline = ref(true);
  const connectionType = ref<string | null>(null);
  const connectionSpeed = ref<string>('unknown');

  const handleOnline = () => {
    isOnline.value = true;
  };

  const handleOffline = () => {
    isOnline.value = false;
  };

  onMounted(() => {
    // 只在客户端环境下访问 navigator 和 window
    if (typeof navigator !== 'undefined' && typeof window !== 'undefined') {
      // 初始化为实际的网络状态
      isOnline.value = navigator.onLine;

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }
  });

  onUnmounted(() => {
    // 只在客户端环境下移除事件监听器
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    }
  });

  return {
    isOnline,
    connectionType,
    connectionSpeed,
  };
}