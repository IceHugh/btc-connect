/**
 * 缓存装饰器
 * 为方法添加自动缓存功能
 */

import type { CacheConfig } from '../types';
import {
  CacheKeyBuilder,
  CacheManager,
  type MemoryCache,
} from './memory-cache';

export interface CachedMethodOptions {
  cacheName: string;
  keyBuilder?: (...args: any[]) => string;
  ttl?: number;
  shouldCache?: (result: any, args: any[]) => boolean;
  onError?: (error: Error, args: any[]) => void;
  bypassCache?: (...args: any[]) => boolean;
}

/**
 * 方法缓存装饰器
 */
export function cached(options: CachedMethodOptions) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cache = CacheManager.getInstance().getCache(options.cacheName);

      // 检查是否应该绕过缓存
      if (options.bypassCache && options.bypassCache.call(this, ...args)) {
        return await originalMethod.apply(this, args);
      }

      // 生成缓存键
      const cacheKey = options.keyBuilder
        ? options.keyBuilder(...args)
        : `${propertyKey}:${JSON.stringify(args)}`;

      // 尝试从缓存获取
      const cachedResult = cache.get(cacheKey);
      if (cachedResult !== null) {
        return cachedResult;
      }

      // 执行原方法
      try {
        const result = await originalMethod.apply(this, args);

        // 检查是否应该缓存结果
        if (!options.shouldCache || options.shouldCache(result, args)) {
          cache.set(cacheKey, result, options.ttl);
        }

        return result;
      } catch (error) {
        // 错误处理
        if (options.onError) {
          options.onError.call(this, error as Error, args);
        }
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * 预定义的缓存选项配置
 */
export const CachePresets = {
  // 余额缓存 - 10秒TTL，最大100个条目
  balance: {
    cacheName: 'balance',
    ttl: 10000,
    keyBuilder: (walletId: string, address: string) =>
      CacheKeyBuilder.balance(walletId, address),
    shouldCache: (result: any) =>
      result && typeof result === 'object' && 'total' in result,
  } as CachedMethodOptions,

  // 账户缓存 - 30秒TTL，最大50个条目
  accounts: {
    cacheName: 'accounts',
    ttl: 30000,
    keyBuilder: (walletId: string, network: string) =>
      CacheKeyBuilder.accounts(walletId, network),
    shouldCache: (result: any) => Array.isArray(result) && result.length > 0,
  } as CachedMethodOptions,

  // 网络缓存 - 60秒TTL，最大50个条目
  network: {
    cacheName: 'network',
    ttl: 60000,
    keyBuilder: (walletId: string) => CacheKeyBuilder.network(walletId),
    shouldCache: (result: any) => result && typeof result === 'string',
  } as CachedMethodOptions,

  // 铭文缓存 - 60秒TTL，最大20个条目
  inscriptions: {
    cacheName: 'inscriptions',
    ttl: 60000,
    keyBuilder: (walletId: string, address: string, cursor = 0, size = 10) =>
      CacheKeyBuilder.inscriptions(walletId, address, cursor),
    shouldCache: (result: any) =>
      result && typeof result === 'object' && 'list' in result,
  } as CachedMethodOptions,

  // 链信息缓存 - 60秒TTL，最大10个条目
  chain: {
    cacheName: 'chain',
    ttl: 60000,
    keyBuilder: (walletId: string) => `chain:${walletId}`,
    shouldCache: (result: any) =>
      result && typeof result === 'object' && 'enum' in result,
  } as CachedMethodOptions,

  // 公钥缓存 - 30秒TTL，最大20个条目
  publicKey: {
    cacheName: 'publicKey',
    ttl: 30000,
    keyBuilder: (walletId: string) => `publicKey:${walletId}`,
    shouldCache: (result: any) =>
      result && typeof result === 'string' && result.length > 0,
  } as CachedMethodOptions,
};

/**
 * 缓存失效装饰器
 * 在方法执行后自动清除相关缓存
 */
export function invalidateCache(cacheNames: string[]) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);

      // 清除指定缓存
      const cacheManager = CacheManager.getInstance();
      cacheNames.forEach((cacheName) => {
        const cache = cacheManager.getCache(cacheName);
        cache.clear();
      });

      return result;
    };

    return descriptor;
  };
}

/**
 * 智能缓存装饰器
 * 根据方法返回结果动态调整TTL
 */
export function smartCached(
  options: CachedMethodOptions & {
    successTtl?: number;
    errorTtl?: number;
    emptyTtl?: number;
  },
) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cache = CacheManager.getInstance().getCache(options.cacheName);

      // 生成缓存键
      const cacheKey = options.keyBuilder
        ? options.keyBuilder(...args)
        : `${propertyKey}:${JSON.stringify(args)}`;

      // 尝试从缓存获取
      const cachedResult = cache.get(cacheKey);
      if (cachedResult !== null) {
        return cachedResult;
      }

      // 执行原方法
      try {
        const result = await originalMethod.apply(this, args);

        // 根据结果类型决定TTL
        let ttl = options.ttl;
        if (options.successTtl && result !== null && result !== undefined) {
          ttl = options.successTtl;
        } else if (
          options.emptyTtl &&
          (result === null || result === undefined)
        ) {
          ttl = options.emptyTtl;
        }

        // 检查是否应该缓存结果
        if (!options.shouldCache || options.shouldCache(result, args)) {
          cache.set(cacheKey, result, ttl);
        }

        return result;
      } catch (error) {
        // 缓存错误结果（较短的TTL）
        if (options.errorTtl && options.onError) {
          cache.set(
            cacheKey,
            { error: true, message: (error as Error).message },
            options.errorTtl,
          );
          options.onError.call(this, error as Error, args);
        }
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * 条件缓存装饰器
 * 根据运行时条件决定是否使用缓存
 */
export function conditionalCached(
  condition: (...args: any[]) => boolean,
  options: CachedMethodOptions,
) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cache = CacheManager.getInstance().getCache(options.cacheName);

      // 检查缓存条件
      const shouldUseCache = condition.call(this, ...args);
      if (!shouldUseCache) {
        return await originalMethod.apply(this, args);
      }

      // 生成缓存键
      const cacheKey = options.keyBuilder
        ? options.keyBuilder(...args)
        : `${propertyKey}:${JSON.stringify(args)}`;

      // 尝试从缓存获取
      const cachedResult = cache.get(cacheKey);
      if (cachedResult !== null) {
        return cachedResult;
      }

      // 执行原方法
      try {
        const result = await originalMethod.apply(this, args);

        // 检查是否应该缓存结果
        if (!options.shouldCache || options.shouldCache(result, args)) {
          cache.set(cacheKey, result, options.ttl);
        }

        return result;
      } catch (error) {
        if (options.onError) {
          options.onError.call(this, error as Error, args);
        }
        throw error;
      }
    };

    return descriptor;
  };
}
