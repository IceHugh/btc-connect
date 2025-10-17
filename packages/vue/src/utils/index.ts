/**
 * BTC Connect 共享工具函数
 */

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

// 按需保留最多 6 位小数并去掉末尾 0（仅当传入为小数时）
export const formatDecimal = (
  value: number | string,
  maxFractionDigits = 6
): string => {
  const num = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(num)) return '0';

  const isDecimalInput =
    (typeof value === 'string' && value.includes('.')) || !Number.isInteger(num);

  if (!isDecimalInput) {
    return num.toString();
  }

  const fixed = num.toFixed(maxFractionDigits);
  // 通过 parseFloat 去除末尾多余的 0 与小数点
  return parseFloat(fixed).toString();
};

// 格式化余额
export const formatBalance = (balance: number | string, decimals = 8): string => {
  const num = typeof balance === 'string' ? parseFloat(balance) : balance;
  
  if (num === 0) return '0 BTC';
  if (num < 0.000001) return '< 0.000001 BTC';
  
  // 如果余额很大，显示整数
  if (num >= 1000) {
    return `${num.toFixed(0)} BTC`;
  }
  
  return `${num.toFixed(decimals)} BTC`;
};

// 获取网络显示名称
export const getNetworkDisplayName = (network: string): string => {
  const networkMap: Record<string, string> = {
    'livenet': '主网',
    'testnet': '测试网',
    'regtest': '本地测试网',
    'mainnet': '主网'
  };
  
  return networkMap[network] || network;
};

// 格式化时间戳
export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN');
};

// 验证比特币地址
export const isValidBitcoinAddress = (address: string): boolean => {
  // 简单的比特币地址验证
  const bitcoinAddressRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[ac-hj-np-z02-9]{8,87}$/;
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
  return new Promise(resolve => setTimeout(resolve, ms));
};

// 重试函数
export const retry = async <T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delayMs = 1000
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
  wait: number
): (...args: Parameters<T>) => void => {
  let timeout: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// 节流函数
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void => {
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
  }
};

// 生成唯一 ID
export const generateId = (prefix = ''): string => {
  return `${prefix}${Math.random().toString(36).substr(2, 9)}`;
};

// 深度合并对象
export const deepMerge = <T extends Record<string, any>>(target: T, source: Partial<T>): T => {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
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
  
  return parseFloat((bytes / k ** i).toFixed(2)) + ' ' + sizes[i];
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