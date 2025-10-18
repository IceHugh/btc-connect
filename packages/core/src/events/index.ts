import type {
  AccountChangeEventParams,
  ConnectEventParams,
  DisconnectEventParams,
  ErrorEventParams,
  LegacyEventHandler,
  Network,
  NetworkChangeEventParams,
  WalletEvent,
} from '../types';

// 事件监听器接口
interface EventListener {
  event: WalletEvent;
  handler: LegacyEventHandler;
  once?: boolean;
}

/**
 * 简单的事件发射器实现
 */
export class EventEmitter {
  private listeners: Map<WalletEvent, EventListener[]> = new Map();
  private maxListeners: number = 100;

  /**
   * 添加事件监听器
   */
  on(event: WalletEvent, handler: LegacyEventHandler): void {
    this.addListener(event, handler, false);
  }

  /**
   * 添加一次性事件监听器
   */
  once(event: WalletEvent, handler: LegacyEventHandler): void {
    this.addListener(event, handler, true);
  }

  /**
   * 移除事件监听器
   */
  off(event: WalletEvent, handler: LegacyEventHandler): void {
    const listeners = this.listeners.get(event);
    if (!listeners) return;

    const index = listeners.findIndex(
      (listener) => listener.handler === handler,
    );
    if (index !== -1) {
      listeners.splice(index, 1);
    }

    // 如果没有监听器了，删除该事件的映射
    if (listeners.length === 0) {
      this.listeners.delete(event);
    }
  }

  /**
   * 移除所有事件监听器
   */
  removeAllListeners(event?: WalletEvent): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * 发射事件
   */
  emit(event: WalletEvent, ...args: any[]): boolean {
    const listeners = this.listeners.get(event);
    if (!listeners || listeners.length === 0) {
      return false;
    }

    // 创建副本以避免在遍历时修改数组
    const listenersCopy = [...listeners];

    for (const listener of listenersCopy) {
      try {
        listener.handler(...args);

        // 如果是一次性监听器，移除它
        if (listener.once) {
          this.off(event, listener.handler);
        }
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    }

    return true;
  }

  /**
   * 获取事件监听器数量
   */
  listenerCount(event: WalletEvent): number {
    const listeners = this.listeners.get(event);
    return listeners ? listeners.length : 0;
  }

  /**
   * 获取所有事件名称
   */
  eventNames(): WalletEvent[] {
    return Array.from(this.listeners.keys());
  }

  /**
   * 设置最大监听器数量
   */
  setMaxListeners(n: number): void {
    this.maxListeners = n;
  }

  /**
   * 获取最大监听器数量
   */
  getMaxListeners(): number {
    return this.maxListeners;
  }

  /**
   * 添加监听器的内部方法
   */
  private addListener(
    event: WalletEvent,
    handler: LegacyEventHandler,
    once: boolean,
  ): void {
    const listeners = this.listeners.get(event) || [];

    // 检查监听器数量限制
    if (listeners.length >= this.maxListeners) {
      console.warn(
        `Possible memory leak detected. ${listeners.length} ${event} listeners added.`,
      );
    }

    listeners.push({ event, handler, once });
    this.listeners.set(event, listeners);
  }
}

/**
 * 钱包事件管理器
 */
export class WalletEventManager extends EventEmitter {
  private isDestroyed = false;

  /**
   * 发射连接事件
   */
  emitConnect(
    walletId: string,
    accounts: ConnectEventParams['accounts'],
  ): boolean {
    if (this.isDestroyed) return false;
    return this.emit('connect', { walletId, accounts });
  }

  /**
   * 发射连接事件（兼容旧版本）
   */
  emitConnectLegacy(accounts: ConnectEventParams['accounts']): boolean {
    if (this.isDestroyed) return false;
    return this.emit('connect', accounts as any);
  }

  /**
   * 发射断开连接事件
   */
  emitDisconnect(walletId: string): boolean {
    if (this.isDestroyed) return false;
    return this.emit('disconnect', { walletId });
  }

  /**
   * 发射断开连接事件（兼容旧版本）
   */
  emitDisconnectLegacy(): boolean {
    if (this.isDestroyed) return false;
    return this.emit('disconnect', undefined as any);
  }

  /**
   * 发射账户变化事件
   */
  emitAccountChange(
    walletId: string,
    accounts: AccountChangeEventParams['accounts'],
  ): boolean {
    if (this.isDestroyed) return false;
    return this.emit('accountChange', { walletId, accounts });
  }

  /**
   * 发射账户变化事件（兼容旧版本）
   */
  emitAccountChangeLegacy(
    accounts: AccountChangeEventParams['accounts'],
  ): boolean {
    if (this.isDestroyed) return false;
    return this.emit('accountChange', accounts as any);
  }

  /**
   * 发射网络变化事件
   */
  emitNetworkChange(
    walletId: string,
    network: NetworkChangeEventParams['network'],
  ): boolean {
    if (this.isDestroyed) return false;
    return this.emit('networkChange', { walletId, network });
  }

  /**
   * 发射网络变化事件（兼容旧版本）
   */
  emitNetworkChangeLegacy(
    network: NetworkChangeEventParams['network'],
  ): boolean {
    if (this.isDestroyed) return false;
    return this.emit('networkChange', network as any);
  }

  /**
   * 发射错误事件
   */
  emitError(walletId: string, error: ErrorEventParams['error']): boolean {
    if (this.isDestroyed) return false;
    return this.emit('error', { walletId, error });
  }

  /**
   * 发射错误事件（兼容旧版本）
   */
  emitErrorLegacy(error: Error): boolean {
    if (this.isDestroyed) return false;
    return this.emit('error', error as any);
  }

  /**
   * 销毁事件管理器
   */
  destroy(): void {
    this.isDestroyed = true;
    this.removeAllListeners();
  }
}
