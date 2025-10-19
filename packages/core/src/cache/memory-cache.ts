/**
 * 内存缓存系统
 * 支持基于TTL的缓存项自动过期和LRU淘汰策略
 */

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}

export interface CacheOptions {
  ttl?: number;
  maxSize?: number;
  enableAutoCleanup?: boolean;
  cleanupInterval?: number;
}

export class MemoryCache<T = any> {
  private cache: Map<string, CacheItem<T>> = new Map();
  private maxSize: number;
  private defaultTtl: number;
  private cleanupTimer?: NodeJS.Timeout;
  private accessOrder: string[] = []; // LRU访问顺序记录

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize || 100;
    this.defaultTtl = options.ttl || 60000; // 默认60秒

    // 启动自动清理过期缓存
    if (options.enableAutoCleanup !== false) {
      this.startAutoCleanup(options.cleanupInterval || 30000); // 默认30秒清理一次
    }
  }

  /**
   * 设置缓存项
   */
  set(key: string, data: T, ttl?: number): void {
    const effectiveTtl = ttl || this.defaultTtl;
    const now = Date.now();

    // 如果缓存已满，执行LRU淘汰
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    const cacheItem: CacheItem<T> = {
      data,
      timestamp: now,
      ttl: effectiveTtl,
      key,
    };

    this.cache.set(key, cacheItem);
    this.updateAccessOrder(key);
  }

  /**
   * 获取缓存项
   */
  get(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // 检查是否过期
    if (this.isExpired(item)) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      return null;
    }

    // 更新访问顺序
    this.updateAccessOrder(key);

    return item.data;
  }

  /**
   * 检查缓存项是否存在且未过期
   */
  has(key: string): boolean {
    const item = this.cache.get(key);

    if (!item) {
      return false;
    }

    if (this.isExpired(item)) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      return false;
    }

    return true;
  }

  /**
   * 删除缓存项
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.removeFromAccessOrder(key);
    }
    return deleted;
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * 获取所有缓存键
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * 手动清理过期缓存
   */
  cleanup(): number {
    const _now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (this.isExpired(item)) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach((key) => {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
    });

    return expiredKeys.length;
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate?: number;
    memoryUsage?: number;
  } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
    };
  }

  /**
   * 销毁缓存实例
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
    this.clear();
  }

  /**
   * 检查缓存项是否过期
   */
  private isExpired(item: CacheItem<T>): boolean {
    return Date.now() - item.timestamp > item.ttl;
  }

  /**
   * 淘汰最近最少使用的缓存项
   */
  private evictLRU(): void {
    if (this.accessOrder.length > 0) {
      const lruKey = this.accessOrder[0];
      this.cache.delete(lruKey);
      this.accessOrder.shift();
    }
  }

  /**
   * 更新访问顺序
   */
  private updateAccessOrder(key: string): void {
    this.removeFromAccessOrder(key);
    this.accessOrder.push(key);
  }

  /**
   * 从访问顺序中移除键
   */
  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  /**
   * 启动自动清理过期缓存
   */
  private startAutoCleanup(interval: number): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, interval);
  }
}

/**
 * 缓存管理器 - 管理多个不同类型的缓存实例
 */
export class CacheManager {
  private static instance: CacheManager;
  private caches: Map<string, MemoryCache> = new Map();

  private constructor() {}

  /**
   * 获取单例实例
   */
  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  /**
   * 创建或获取缓存实例
   */
  getCache<T>(name: string, options?: CacheOptions): MemoryCache<T> {
    let cache = this.caches.get(name);

    if (!cache) {
      cache = new MemoryCache<T>(options);
      this.caches.set(name, cache);
    }

    return cache as MemoryCache<T>;
  }

  /**
   * 删除缓存实例
   */
  deleteCache(name: string): boolean {
    const cache = this.caches.get(name);
    if (cache) {
      cache.destroy();
      return this.caches.delete(name);
    }
    return false;
  }

  /**
   * 清空所有缓存
   */
  clearAll(): void {
    for (const [_name, cache] of this.caches.entries()) {
      cache.destroy();
    }
    this.caches.clear();
  }

  /**
   * 获取所有缓存的统计信息
   */
  getAllStats(): Record<string, { size: number; maxSize: number }> {
    const stats: Record<string, { size: number; maxSize: number }> = {};

    for (const [name, cache] of this.caches.entries()) {
      stats[name] = cache.getStats();
    }

    return stats;
  }

  /**
   * 清理所有过期缓存
   */
  cleanupAll(): number {
    let totalCleaned = 0;

    for (const cache of this.caches.values()) {
      totalCleaned += cache.cleanup();
    }

    return totalCleaned;
  }

  /**
   * 销毁缓存管理器
   */
  destroy(): void {
    this.clearAll();
  }
}

/**
 * 缓存键生成工具
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CacheKeyBuilder {
  /**
   * 生成余额缓存键
   */
  static balance(walletId: string, address: string): string {
    return `balance:${walletId}:${address}`;
  }

  /**
   * 生成账户缓存键
   */
  static accounts(walletId: string, network: string): string {
    return `accounts:${walletId}:${network}`;
  }

  /**
   * 生成网络缓存键
   */
  static network(walletId: string): string {
    return `network:${walletId}`;
  }

  /**
   * 生成交易缓存键
   */
  static transaction(walletId: string, txId: string): string {
    return `tx:${walletId}:${txId}`;
  }

  /**
   * 生成签名缓存键
   */
  static signature(walletId: string, messageHash: string): string {
    return `sig:${walletId}:${messageHash}`;
  }

  /**
   * 生成钱包状态缓存键
   */
  static walletState(walletId: string, address: string): string {
    return `state:${walletId}:${address}`;
  }

  /**
   * 生成铭文缓存键
   */
  static inscriptions(
    walletId: string,
    address: string,
    cursor?: number,
  ): string {
    return `inscriptions:${walletId}:${address}:${cursor || 0}`;
  }
}
