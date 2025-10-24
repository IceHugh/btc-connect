import { OKXAdapter } from './okx';
import { UniSatAdapter } from './unisat';

export { BaseWalletAdapter } from './base';
export { OKXAdapter } from './okx';
export { UniSatAdapter } from './unisat';
export { XverseAdapter } from './xverse';

// 适配器工厂函数
export function createAdapter(type: 'unisat' | 'okx' | 'xverse') {
  switch (type) {
    case 'unisat':
      return new UniSatAdapter();
    case 'okx':
      return new OKXAdapter();
    // case 'xverse':
    //   return new XverseAdapter();
    default:
      throw new Error(`Unsupported wallet type: ${type}`);
  }
}

// 获取所有可用的适配器
export function getAllAdapters() {
  return [new UniSatAdapter(), new OKXAdapter()];
}

// 获取可用的适配器（已安装的钱包）
export function getAvailableAdapters() {
  return getAllAdapters().filter((adapter) => adapter.isReady());
}

// 增强的钱包检测配置
export interface WalletDetectionConfig {
  timeout?: number; // 超时时间（毫秒），默认20000
  interval?: number; // 轮询间隔（毫秒），默认300
  onProgress?: (detectedWallets: string[], elapsedTime: number) => void; // 进度回调
}

// 增强的钱包检测结果
export interface WalletDetectionResult {
  wallets: string[]; // 检测到的钱包ID列表
  adapters: ReturnType<typeof getAllAdapters>; // 可用的适配器实例
  elapsedTime: number; // 总耗时
  isComplete: boolean; // 是否完成检测
}

/**
 * 增强的钱包检测方法，支持轮询检测延迟注入的钱包
 * @param config 检测配置
 * @returns 检测结果
 */
export function detectAvailableWallets(
  config: WalletDetectionConfig = {},
): Promise<WalletDetectionResult> {
  const {
    timeout = 20000, // 20秒超时
    interval = 300, // 300ms间隔
    onProgress,
  } = config;

  return new Promise((resolve) => {
    const startTime = Date.now();
    let lastDetectedWallets: string[] = [];

    const checkWallets = (): WalletDetectionResult => {
      const adapters = getAllAdapters();
      const availableAdapters = adapters.filter((adapter) => adapter.isReady());
      const detectedWallets = availableAdapters.map((adapter) => adapter.id);
      const elapsedTime = Date.now() - startTime;

      // 检查是否有新的钱包被检测到
      const hasNewWallets =
        detectedWallets.length !== lastDetectedWallets.length ||
        detectedWallets.some(
          (wallet, index) => wallet !== lastDetectedWallets[index],
        );

      if (hasNewWallets) {
        lastDetectedWallets = [...detectedWallets];
        onProgress?.(detectedWallets, elapsedTime);
      }

      const result: WalletDetectionResult = {
        wallets: detectedWallets,
        adapters: availableAdapters,
        elapsedTime,
        isComplete: elapsedTime >= timeout,
      };

      return result;
    };

    // 立即执行一次检测
    const initialResult = checkWallets();
    if (initialResult.wallets.length > 0) {
      // 如果初始检测就有钱包，继续轮询以确保完整性
    }

    // 设置轮询
    const pollInterval = setInterval(() => {
      const result = checkWallets();

      if (result.isComplete) {
        clearInterval(pollInterval);
        resolve(result);
      }
    }, interval);

    // 设置超时保险
    const timeoutId = setTimeout(() => {
      clearInterval(pollInterval);
      const finalResult = checkWallets();
      resolve({
        ...finalResult,
        isComplete: true,
      });
    }, timeout);

    // 清理函数
    const cleanup = () => {
      clearInterval(pollInterval);
      clearTimeout(timeoutId);
    };

    // 如果所有已知钱包都被检测到，可以提前结束
    const allKnownWallets = ['unisat', 'okx', 'xverse'];
    const earlyCheckInterval = setInterval(() => {
      const result = checkWallets();
      if (
        result.wallets.length === allKnownWallets.length ||
        result.isComplete
      ) {
        cleanup();
        resolve(result);
      }
    }, interval);

    // 合并清理
    setTimeout(() => {
      clearInterval(earlyCheckInterval);
    }, timeout);
  });
}

/**
 * 简化的同步检测方法（向后兼容）
 */
export function getAvailableWalletsWithRetry(
  maxRetries: number = 5,
  retryDelay: number = 300,
): ReturnType<typeof getAvailableAdapters> {
  let retries = 0;

  const check = (): ReturnType<typeof getAvailableAdapters> => {
    const adapters = getAvailableAdapters();

    if (adapters.length > 0 || retries >= maxRetries) {
      return adapters;
    }

    retries++;
    setTimeout(check, retryDelay);
    return adapters;
  };

  return check();
}
