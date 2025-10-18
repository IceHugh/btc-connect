/**
 * 缓存系统入口
 */

export {
  type CachedMethodOptions,
  CachePresets,
  cached,
  conditionalCached,
  invalidateCache,
  smartCached,
} from './cache-decorators';
export {
  type CacheItem,
  CacheKeyBuilder,
  CacheManager,
  type CacheOptions,
  MemoryCache,
} from './memory-cache';

import { CacheManager, type CacheOptions, MemoryCache } from './memory-cache';

// 便捷的缓存实例创建函数
export function createCache<T>(options?: CacheOptions): MemoryCache<T> {
  return new MemoryCache<T>(options);
}

// 获取全局缓存管理器
export function getCacheManager(): CacheManager {
  return CacheManager.getInstance();
}
