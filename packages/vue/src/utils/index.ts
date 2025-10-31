/**
 * BTC Connect Vue 工具函数
 *
 * 提供钱包连接、格式化、存储等通用工具函数
 * 增强了错误处理、性能优化和类型安全
 */

import type { CacheItem } from '../types';

// 样式工具函数
export const cn = (
  ...classes: (string | undefined | null | false)[]
): string => {
  return classes.filter(Boolean).join(' ');
};

// 复制到剪贴板
export const copyToClipboard = async (text: string): Promise<void> => {
  // SSR 安全：无浏览器环境时直接返回
  if (typeof window === 'undefined') return;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    } catch {
      // 忽略
    }
  }
};

// 格式化地址
export const formatAddress = (address: string, length = 6): string => {
  if (!address) return '';
  if (address.length <= length * 2) return address;

  return `${address.slice(0, length)}...${address.slice(-length)}`;
};

// 只显示地址后几位
export const formatAddressShort = (
  address: string,
  suffixLength = 4,
): string => {
  if (!address) return '';
  if (address.length <= suffixLength) return address;

  return address.slice(-suffixLength);
};

// 按需保留最多 6 位小数并去掉末尾 0（仅当传入为小数时）
export const formatDecimal = (
  value: number | string,
  maxFractionDigits = 6,
): string => {
  const num = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(num)) return '0';

  const isDecimalInput =
    (typeof value === 'string' && value.includes('.')) ||
    !Number.isInteger(num);

  if (!isDecimalInput) {
    return num.toString();
  }

  const fixed = num.toFixed(maxFractionDigits);
  // 通过 parseFloat 去除末尾多余的 0 与小数点
  return parseFloat(fixed).toString();
};

// 格式化余额
export const formatBalance = (
  balance: number | string,
  decimals = 8,
): string => {
  const num = typeof balance === 'string' ? parseFloat(balance) : balance;

  if (num === 0) return '0 BTC';
  if (num < 0.000001) return '< 0.000001 BTC';

  // 如果余额很大，显示整数
  if (num >= 1000) {
    return `${num.toFixed(0)} BTC`;
  }

  return `${num.toFixed(decimals)} BTC`;
};

// 格式化BTC余额（聪转BTC，智能单位显示）
export const formatBTCBalance = (satoshis: number): string => {
  // 1 BTC = 100,000,000 satoshis
  const btc = satoshis / 100000000;

  if (btc === 0) return '0';

  // 定义单位转换
  const units = [
    { threshold: 1e9, suffix: 'M', divisor: 1e9 }, // 百万级 BTC
    { threshold: 1e6, suffix: 'K', divisor: 1e6 }, // 千级 BTC
    { threshold: 1, suffix: '', divisor: 1 }, // 1-999 BTC
  ];

  // 找到合适的单位
  let unit = units[2]; // 默认使用BTC
  for (const u of units) {
    if (btc >= u.threshold) {
      unit = u;
      break;
    }
  }

  const value = btc / unit.divisor;

  // 根据数值大小决定小数位数
  let maxDecimalPlaces = 10; // 使用10位小数
  if (value >= 100) {
    maxDecimalPlaces = 2; // 大数值用2位小数
  } else if (value >= 1) {
    maxDecimalPlaces = 4; // 整数用4位小数
  }

  // 格式化数字，确保不超过最大小数位数，且不使用科学计数法
  const formatted = Number(value.toPrecision(maxDecimalPlaces + 2)).toFixed(
    maxDecimalPlaces,
  );

  // 去除末尾多余的0，但保留至少1位小数（如果需要）
  const trimmed = formatted.replace(/\.?0+$/, '');

  return `${trimmed}${unit.suffix}`;
};

// 获取网络显示名称
export const getNetworkDisplayName = (network: string): string => {
  const networkMap: Record<string, string> = {
    livenet: 'livenet',
    testnet: 'testnet',
    regtest: 'regtest',
    mainnet: 'mainnet',
  };

  return networkMap[network] || network;
};

// 格式化时间戳
export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US');
};

// 验证比特币地址
export const isValidBitcoinAddress = (address: string): boolean => {
  // 简单的比特币地址验证
  const bitcoinAddressRegex =
    /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[ac-hj-np-z02-9]{8,87}$/;
  return bitcoinAddressRegex.test(address);
};

// 格式化哈希值
export const formatHash = (hash: string, length = 8): string => {
  if (!hash) return '';
  if (hash.length <= length * 2) return hash;

  return `${hash.slice(0, length)}...${hash.slice(-length)}`;
};

// 延迟函数
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// 重试函数
export const retry = async <T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delayMs = 1000,
): Promise<T> => {
  let lastError: Error | undefined;

  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxAttempts - 1) {
        await delay(delayMs);
      }
    }
  }

  throw lastError ?? new Error('Unknown error');
};

// 防抖函数
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// 节流函数
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

// 本地存储工具
export const storage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    if (typeof window === 'undefined') return defaultValue || null;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch {
      return defaultValue || null;
    }
  },

  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // 忽略
    }
  },

  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      // 忽略
    }
  },

  clear: (): void => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.clear();
    } catch {
      // 忽略
    }
  },
};

// 生成唯一 ID
export const generateId = (prefix = ''): string => {
  return `${prefix}${Math.random().toString(36).substr(2, 9)}`;
};

// 深度合并对象
export const deepMerge = <T extends Record<string, any>>(
  target: T,
  source: Partial<T>,
): T => {
  const result = { ...target };

  for (const key in source) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key])
    ) {
      result[key] = deepMerge((result[key] as any) || {}, source[key] as any);
    } else {
      result[key] = source[key] as any;
    }
  }

  return result;
};

// 检查对象是否为空
export const isEmpty = (obj: any): boolean => {
  if (obj === null || obj === undefined) return true;
  if (typeof obj === 'string') return obj.trim() === '';
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
};

// 安全的 JSON 解析
export const safeJsonParse = <T>(jsonString: string, defaultValue: T): T => {
  try {
    return JSON.parse(jsonString);
  } catch {
    return defaultValue;
  }
};

// 格式化文件大小
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
};

// 获取浏览器信息
export const getBrowserInfo = (): { name: string; version: string } => {
  if (typeof window === 'undefined') {
    return { name: 'Unknown', version: '0' };
  }
  const ua = window.navigator.userAgent;
  let browserName = 'Unknown';
  let browserVersion = '0';

  if (ua.indexOf('Chrome') > -1) {
    browserName = 'Chrome';
    browserVersion = ua.match(/Chrome\/(\d+)/)?.[1] || '0';
  } else if (ua.indexOf('Safari') > -1) {
    browserName = 'Safari';
    browserVersion = ua.match(/Version\/(\d+)/)?.[1] || '0';
  } else if (ua.indexOf('Firefox') > -1) {
    browserName = 'Firefox';
    browserVersion = ua.match(/Firefox\/(\d+)/)?.[1] || '0';
  } else if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident') > -1) {
    browserName = 'IE';
    browserVersion = ua.match(/(?:MSIE |rv:)(\d+)/)?.[1] || '0';
  }

  return { name: browserName, version: browserVersion };
};

// === 新增增强工具函数 ===

// 错误处理工具
export class ErrorHandler {
  static withErrorHandling<T extends (...args: any[]) => any>(
    fn: T,
    onError?: (error: Error) => void,
  ): (...args: Parameters<T>) => ReturnType<T> | null {
    return (...args: Parameters<T>) => {
      try {
        const result = fn(...args);

        // 处理异步函数
        if (result && typeof result.catch === 'function') {
          return result.catch((error: Error) => {
            console.error('Error in async function:', error);
            onError?.(error);
            throw error;
          });
        }

        return result;
      } catch (error) {
        console.error('Error in function:', error);
        onError?.(error instanceof Error ? error : new Error('Unknown error'));
        return null;
      }
    };
  }

  static createSafeAsyncFunction<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    defaultValue: ReturnType<T> extends Promise<infer P> ? P : never,
    onError?: (error: Error) => void,
  ): (
    ...args: Parameters<T>
  ) => Promise<ReturnType<T> extends Promise<infer P> ? P : never> {
    return async (...args: Parameters<T>) => {
      try {
        return await fn(...args);
      } catch (error) {
        console.error('Error in async function:', error);
        onError?.(error instanceof Error ? error : new Error('Unknown error'));
        return defaultValue;
      }
    };
  }
}

// 缓存管理器
export class CacheManager {
  private cache = new Map<string, CacheItem>();
  private defaultExpireTime = 5 * 60 * 1000; // 5分钟

  set<T>(key: string, value: T, expireTime?: number): void {
    this.cache.set(key, {
      value,
      expireTime: Date.now() + (expireTime || this.defaultExpireTime),
      createdAt: Date.now(),
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expireTime) {
      this.cache.delete(key);
      return null;
    }

    return item.value as T;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // 清理过期缓存
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expireTime) {
        this.cache.delete(key);
      }
    }
  }

  // 获取缓存统计
  getStats() {
    const items = Array.from(this.cache.values());
    const now = Date.now();
    const expired = items.filter((item) => now > item.expireTime).length;

    return {
      total: this.cache.size,
      expired,
      valid: this.cache.size - expired,
      items: items.map((item) => ({
        age: now - item.createdAt,
        ttl: item.expireTime - now,
        expired: now > item.expireTime,
      })),
    };
  }
}

// 性能监控器
export class PerformanceMonitor {
  private timers = new Map<string, number>();
  private metrics = new Map<string, number[]>();

  start(name: string): void {
    this.timers.set(name, performance.now());
  }

  end(name: string): number {
    const startTime = this.timers.get(name);
    if (!startTime) return 0;

    const duration = performance.now() - startTime;
    this.timers.delete(name);

    // 记录指标
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(duration);

    return duration;
  }

  getMetrics(name: string) {
    const values = this.metrics.get(name) || [];
    if (values.length === 0) return null;

    return {
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((sum, val) => sum + val, 0) / values.length,
      recent: values[values.length - 1],
    };
  }

  getAllMetrics() {
    const result: Record<string, ReturnType<typeof this.getMetrics>> = {};
    for (const name of this.metrics.keys()) {
      result[name] = this.getMetrics(name);
    }
    return result;
  }

  clear(name?: string): void {
    if (name) {
      this.metrics.delete(name);
      this.timers.delete(name);
    } else {
      this.metrics.clear();
      this.timers.clear();
    }
  }
}

// 增强的存储工具
export const enhancedStorage = {
  ...storage,

  // 带TTL的存储
  setWithTTL: <T>(key: string, value: T, ttlMs: number): void => {
    const item = {
      value,
      expireTime: Date.now() + ttlMs,
    };
    storage.set(key, item);
  },

  getWithTTL: <T>(key: string): T | null => {
    const item = storage.get<{ value: T; expireTime: number }>(key);
    if (!item) return null;

    if (Date.now() > item.expireTime) {
      storage.remove(key);
      return null;
    }

    return item.value;
  },

  // 批量操作
  getMultiple: <T extends Record<string, any>>(keys: string[]): T => {
    const result = {} as T;
    for (const key of keys) {
      const value = storage.get(key);
      if (value !== null) {
        (result as any)[key] = value;
      }
    }
    return result;
  },

  setMultiple: <T extends Record<string, any>>(items: T): void => {
    for (const [key, value] of Object.entries(items)) {
      storage.set(key, value);
    }
  },

  // 命名空间支持
  createNamespace: (namespace: string) => ({
    get: <T>(key: string, defaultValue?: T): T | null => {
      return storage.get(`${namespace}:${key}`, defaultValue);
    },

    set: <T>(key: string, value: T): void => {
      storage.set(`${namespace}:${key}`, value);
    },

    remove: (key: string): void => {
      storage.remove(`${namespace}:${key}`);
    },

    clear: (): void => {
      const prefix = `${namespace}:`;
      // 只能清理当前命名空间的键
      const keysToKeep: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !key.startsWith(prefix)) {
          const value = localStorage.getItem(key);
          if (value !== null) {
            keysToKeep.push(key + ':' + value);
          }
        }
      }

      localStorage.clear();

      for (const item of keysToKeep) {
        const [key, value] = item.split(':');
        if (key && value) {
          localStorage.setItem(key, value);
        }
      }
    },
  }),
};

// 事件发射器
export class EventEmitter {
  private events = new Map<string, Function[]>();

  on(event: string, listener: Function): void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(listener);
  }

  off(event: string, listener: Function): void {
    const listeners = this.events.get(event);
    if (!listeners) return;

    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }

    if (listeners.length === 0) {
      this.events.delete(event);
    }
  }

  emit(event: string, ...args: any[]): void {
    const listeners = this.events.get(event);
    if (!listeners) return;

    for (const listener of listeners) {
      try {
        listener(...args);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    }
  }

  once(event: string, listener: Function): void {
    const onceListener = (...args: any[]) => {
      this.off(event, onceListener);
      listener(...args);
    };
    this.on(event, onceListener);
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }

  listenerCount(event: string): number {
    return this.events.get(event)?.length || 0;
  }
}

// 增强的防抖函数
export const enhancedDebounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options: { leading?: boolean; trailing?: boolean; maxWait?: number } = {},
): ((...args: Parameters<T>) => void) & {
  cancel: () => void;
  flush: () => void;
} => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  const maxTimeout: ReturnType<typeof setTimeout> | null = null;
  let lastCallTime = 0;
  let lastInvokeTime = 0;
  let result: ReturnType<T>;

  const invokeFunc = (time: number) => {
    const args = lastArgs;
    lastArgs = undefined;
    lastInvokeTime = time;
    result = func(...args!);
    return result;
  };

  const leadingEdge = (time: number) => {
    lastInvokeTime = time;
    timeout = setTimeout(timerExpired, wait);
    return options.leading ? invokeFunc(time) : result;
  };

  const remainingWait = (time: number) => {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = wait - timeSinceLastCall;
    return options.maxWait !== undefined
      ? Math.min(timeWaiting, options.maxWait - timeSinceLastInvoke)
      : timeWaiting;
  };

  const shouldInvoke = (time: number) => {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;
    return (
      lastCallTime === 0 ||
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0 ||
      (options.maxWait !== undefined && timeSinceLastInvoke >= options.maxWait)
    );
  };

  const timerExpired = () => {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    timeout = setTimeout(timerExpired, remainingWait(time));
  };

  const trailingEdge = (time: number) => {
    timeout = null;
    if (options.trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = undefined;
    return result;
  };

  let lastArgs: Parameters<T> | undefined;

  const debounced = function (this: any, ...args: Parameters<T>) {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastArgs = args;
    lastCallTime = time;

    if (isInvoking) {
      if (timeout === null) {
        return leadingEdge(lastCallTime);
      }
      if (options.maxWait !== undefined) {
        timeout = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timeout === null) {
      timeout = setTimeout(timerExpired, wait);
    }
    return result;
  } as typeof debounced & { cancel: () => void; flush: () => void };

  debounced.cancel = () => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    lastInvokeTime = 0;
    lastArgs = undefined;
    timeout = null;
  };

  debounced.flush = () => {
    return timeout === null ? result : trailingEdge(Date.now());
  };

  return debounced;
};

// 数字格式化工具
export const formatNumber = (
  value: number,
  options: {
    decimals?: number;
    separator?: string;
    prefix?: string;
    suffix?: string;
  } = {},
): string => {
  const { decimals = 2, separator = ',', prefix = '', suffix = '' } = options;

  const formatted = value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return `${prefix}${formatted}${suffix}`;
};

// 金额验证工具
export const validateAmount = (
  amount: string | number,
): {
  isValid: boolean;
  value: number;
  error?: string;
} => {
  const numValue = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numValue)) {
    return {
      isValid: false,
      value: 0,
      error: 'Invalid number format',
    };
  }

  if (numValue < 0) {
    return {
      isValid: false,
      value: numValue,
      error: 'Amount cannot be negative',
    };
  }

  if (numValue === 0) {
    return {
      isValid: false,
      value: 0,
      error: 'Amount cannot be zero',
    };
  }

  return {
    isValid: true,
    value: numValue,
  };
};

// 全局实例
export const cacheManager = new CacheManager();
export const performanceMonitor = new PerformanceMonitor();
export const eventEmitter = new EventEmitter();
