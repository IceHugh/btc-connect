import type {
  AvailableWalletsEventParams,
  BTCWalletAdapter,
  WalletDetectedEventParams,
  WalletDetectionCompleteEventParams,
} from '@btc-connect/core';
import { getAllAdapters } from '@btc-connect/core';

/**
 * 钱包检测配置接口
 */
export interface WalletDetectionManagerConfig {
  timeout?: number; // 超时时间（毫秒），默认20000
  interval?: number; // 轮询间隔（毫秒），默认10000（改为10秒间隔）
  immediateInterval?: number; // 初始检测间隔（毫秒），默认1000
  maxImmediateChecks?: number; // 最大初始检测次数，默认5次
}

/**
 * 钱包检测管理器
 * 负责检测钱包的可用性并发射相关事件
 */
export class WalletDetectionManager {
  private detectionTimer: NodeJS.Timeout | null = null;
  private immediateCheckTimer: NodeJS.Timeout | null = null;
  private isDetecting = false;
  private lastDetectedWallets: string[] = [];
  private startTime = 0;
  private immediateCheckCount = 0;
  private config: Required<WalletDetectionManagerConfig>;
  private eventListeners: Map<string, Set<Function>> = new Map();

  constructor(config: WalletDetectionManagerConfig = {}) {
    this.config = {
      timeout: config.timeout || 20000, // 20秒超时
      interval: config.interval || 10000, // 10秒检测间隔
      immediateInterval: config.immediateInterval || 1000, // 1秒初始检测间隔
      maxImmediateChecks: config.maxImmediateChecks || 5, // 最多5次初始检测
    };
  }

  /**
   * 添加事件监听器
   */
  on<T extends string>(event: T, handler: (params: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(handler);
  }

  /**
   * 移除事件监听器
   */
  off<T extends string>(event: T, handler: (params: any) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(handler);
      if (listeners.size === 0) {
        this.eventListeners.delete(event);
      }
    }
  }

  /**
   * 发射事件
   */
  private emit(event: string, params: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((handler) => {
        try {
          handler(params);
        } catch (error) {
          console.error(`Error in ${event} event handler:`, error);
        }
      });
    }
  }

  /**
   * 开始钱包检测并发射事件
   */
  async startDetection(): Promise<void> {
    if (this.isDetecting) {
      console.warn('Detection already in progress');
      return;
    }

    this.isDetecting = true;
    this.startTime = Date.now();
    this.immediateCheckCount = 0;
    this.lastDetectedWallets = [];

    console.log('🔍 [WalletDetectionManager] Starting wallet detection');

    // 立即执行一次检测
    await this.performDetection();

    // 设置初始频繁检测阶段（前5秒，每秒检测一次）
    this.immediateCheckTimer = setInterval(async () => {
      this.immediateCheckCount++;
      await this.performDetection();

      // 5次初始检测后，停止频繁检测
      if (this.immediateCheckCount >= this.config.maxImmediateChecks) {
        if (this.immediateCheckTimer) {
          clearInterval(this.immediateCheckTimer);
          this.immediateCheckTimer = null;
        }

        // 启动10秒间隔的常规检测
        this.detectionTimer = setInterval(async () => {
          await this.performDetection();
        }, this.config.interval);
      }
    }, this.config.immediateInterval);

    // 设置超时
    setTimeout(() => {
      this.stopDetection();
      this.emitDetectionComplete(true);
    }, this.config.timeout);
  }

  /**
   * 执行钱包检测
   */
  private async performDetection(): Promise<void> {
    try {
      const adapters = getAllAdapters();
      const availableAdapters = adapters.filter((adapter) => adapter.isReady());
      const detectedWallets = availableAdapters.map((adapter) => adapter.id);
      const elapsedTime = Date.now() - this.startTime;

      // 检查是否有新钱包
      const newWallets = detectedWallets.filter(
        (walletId) => !this.lastDetectedWallets.includes(walletId),
      );

      if (newWallets.length > 0) {
        console.log(
          `🆕 [WalletDetectionManager] New wallets detected: ${newWallets.join(', ')} (${elapsedTime}ms)`,
        );

        // 发射新钱包检测事件
        for (const walletId of newWallets) {
          const adapter = availableAdapters.find((a) => a.id === walletId);
          if (adapter) {
            this.emit('walletDetected', {
              walletId,
              walletInfo: {
                id: adapter.id,
                name: adapter.name,
                icon: adapter.icon,
              },
              totalDetected: detectedWallets.length,
              timestamp: Date.now(),
            } as WalletDetectedEventParams);
          }
        }

        // 发射可用钱包列表变化事件
        this.emit('availableWallets', {
          wallets: availableAdapters.map((adapter) => ({
            id: adapter.id,
            name: adapter.name,
            icon: adapter.icon,
          })),
          adapters: availableAdapters,
          timestamp: Date.now(),
        } as AvailableWalletsEventParams);
      }

      this.lastDetectedWallets = [...detectedWallets];

      // 如果检测到所有已知钱包，可以提前停止
      const allKnownWallets = ['unisat', 'okx', 'xverse'];
      if (detectedWallets.length === allKnownWallets.length) {
        console.log(
          `✅ [WalletDetectionManager] All known wallets detected (${elapsedTime}ms), stopping detection`,
        );
        this.stopDetection();
        this.emitDetectionComplete(true);
      }
    } catch (error) {
      console.error(
        '❌ [WalletDetectionManager] Error during detection:',
        error,
      );
    }
  }

  /**
   * 停止检测
   */
  stopDetection(): void {
    if (this.detectionTimer) {
      clearInterval(this.detectionTimer);
      this.detectionTimer = null;
    }

    if (this.immediateCheckTimer) {
      clearInterval(this.immediateCheckTimer);
      this.immediateCheckTimer = null;
    }

    this.isDetecting = false;
    console.log('🛑 [WalletDetectionManager] Detection stopped');
  }

  /**
   * 发射检测完成事件
   */
  private emitDetectionComplete(isComplete: boolean): void {
    const adapters = getAllAdapters().filter((adapter) => adapter.isReady());
    const elapsedTime = Date.now() - this.startTime;

    console.log(
      `🏁 [WalletDetectionManager] Detection complete: ${adapters.length} wallets found (${elapsedTime}ms)`,
    );

    this.emit('walletDetectionComplete', {
      wallets: adapters.map((adapter) => adapter.id),
      adapters,
      elapsedTime,
      isComplete,
      timestamp: Date.now(),
    } as WalletDetectionCompleteEventParams);
  }

  /**
   * 获取当前检测结果
   */
  getCurrentDetection(): {
    wallets: string[];
    adapters: BTCWalletAdapter[];
    isDetecting: boolean;
    elapsedTime: number;
  } {
    const adapters = getAllAdapters().filter((adapter) => adapter.isReady());

    return {
      wallets: adapters.map((adapter) => adapter.id),
      adapters,
      isDetecting: this.isDetecting,
      elapsedTime: this.isDetecting ? Date.now() - this.startTime : 0,
    };
  }

  /**
   * 检查是否正在检测
   */
  isActive(): boolean {
    return this.isDetecting;
  }

  /**
   * 销毁检测管理器
   */
  destroy(): void {
    this.stopDetection();
    this.eventListeners.clear();
    console.log('💥 [WalletDetectionManager] Detection manager destroyed');
  }
}
