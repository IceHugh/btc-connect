import type { ZIndexStrategy } from '../types';

/**
 * Z-Index管理器
 * 负责计算和管理Modal的z-index值，确保在第三方网站上正确显示
 */
export class ZIndexManager {
  // 默认高优先级z-index值
  private static readonly DEFAULT_Z_INDEX = 999999;
  // 安全余量
  private static readonly SAFE_MARGIN = 10;
  // 缓存检测结果的时间（毫秒）
  private static readonly CACHE_TTL = 5000; // 5秒
  // 缓存的z-index值
  private static cachedZIndex: number | null = null;
  // 缓存时间戳
  private static cacheTimestamp: number = 0;

  /**
   * 计算z-index值
   * @param strategy z-index策略
   * @param customValue 自定义值（当strategy为'custom'时使用）
   * @returns 计算得出的z-index值
   */
  static calculateZIndex(
    strategy: ZIndexStrategy = 'fixed',
    customValue?: number
  ): number {
    switch (strategy) {
      case 'fixed':
        return this.DEFAULT_Z_INDEX;
      case 'dynamic':
        return this.getDynamicZIndex();
      case 'custom':
        return this.validateCustomValue(customValue);
      default:
        return this.DEFAULT_Z_INDEX;
    }
  }

  /**
   * 获取动态z-index值
   * 检测页面中最高z-index值并加上安全余量
   * @returns 动态计算的z-index值
   */
  private static getDynamicZIndex(): number {
    // 检查缓存是否有效
    const now = Date.now();
    if (
      this.cachedZIndex !== null &&
      now - this.cacheTimestamp < this.CACHE_TTL
    ) {
      return this.cachedZIndex;
    }

    // SSR环境安全检查
    if (typeof document === 'undefined') {
      return this.DEFAULT_Z_INDEX;
    }

    try {
      let maxZIndex = 0;
      const elements = document.querySelectorAll('*');

      // 优化：只检查可能有z-index的元素
      const elementsWithZIndex = Array.from(elements).filter(el => {
        const style = window.getComputedStyle(el);
        const zIndex = style.zIndex;
        return zIndex && zIndex !== 'auto' && zIndex !== '0';
      });

      elementsWithZIndex.forEach(el => {
        const zIndex = parseInt(window.getComputedStyle(el).zIndex || '0');
        if (zIndex > maxZIndex) {
          maxZIndex = zIndex;
        }
      });

      const result = maxZIndex + this.SAFE_MARGIN;

      // 缓存结果
      this.cachedZIndex = result;
      this.cacheTimestamp = now;

      return result;
    } catch (error) {
      console.warn('Failed to calculate dynamic z-index, using default:', error);
      return this.DEFAULT_Z_INDEX;
    }
  }

  /**
   * 验证自定义z-index值
   * @param value 用户提供的自定义值
   * @returns 验证后的z-index值
   */
  private static validateCustomValue(value?: number): number {
    if (typeof value === 'number' && isFinite(value) && value >= 0) {
      return Math.floor(value);
    }

    console.warn(
      `Invalid custom z-index value: ${value}. Using default value: ${this.DEFAULT_Z_INDEX}`
    );
    return this.DEFAULT_Z_INDEX;
  }

  /**
   * 清除缓存
   * 在页面结构发生变化时可以调用此方法清除缓存
   */
  static clearCache(): void {
    this.cachedZIndex = null;
    this.cacheTimestamp = 0;
  }

  /**
   * 预计算z-index值
   * 可以在页面加载时预先计算，避免首次使用时的延迟
   * @param strategy z-index策略
   * @param customValue 自定义值
   */
  static preCalculateZIndex(
    strategy: ZIndexStrategy = 'fixed',
    customValue?: number
  ): void {
    if (strategy === 'dynamic') {
      this.getDynamicZIndex();
    }
  }

  /**
   * 检查z-index值是否会超出安全范围
   * @param zIndex 要检查的z-index值
   * @returns 是否在安全范围内
   */
  static isSafeZIndex(zIndex: number): boolean {
    // 大多数浏览器的最大z-index值约为2^31-1
    const MAX_SAFE_Z_INDEX = 2147483647;
    return zIndex >= 0 && zIndex <= MAX_SAFE_Z_INDEX;
  }

  /**
   * 获取推荐的z-index值
   * 根据当前页面环境提供推荐值
   * @returns 推荐的z-index值和策略
   */
  static getRecommendedZIndex(): {
    value: number;
    strategy: ZIndexStrategy;
    reason: string;
  } {
    if (typeof document === 'undefined') {
      return {
        value: this.DEFAULT_Z_INDEX,
        strategy: 'fixed',
        reason: 'SSR环境，使用固定高值',
      };
    }

    const dynamicValue = this.getDynamicZIndex();

    // 如果动态检测到的值接近默认值，推荐使用固定策略
    if (Math.abs(dynamicValue - this.DEFAULT_Z_INDEX) < 100) {
      return {
        value: this.DEFAULT_Z_INDEX,
        strategy: 'fixed',
        reason: '页面z-index环境较简单，推荐使用固定值',
      };
    }

    return {
      value: dynamicValue,
      strategy: 'dynamic',
      reason: '页面z-index环境复杂，推荐使用动态检测',
    };
  }
}