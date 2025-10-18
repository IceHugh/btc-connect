/**
 * 从 shared 包内联的类型和函数声明
 * 避免在最终类型声明文件中出现对 @btc-connect/shared 的依赖
 */

// 存储工具接口
export interface Storage {
  get: <T>(key: string, defaultValue?: T) => T | null;
  set: <T>(key: string, value: T) => void;
  remove: (key: string) => void;
  clear: () => void;
}

// 格式化函数类型
export type FormatAddressFunction = (
  address: string,
  length?: number,
) => string;
export type FormatBalanceFunction = (
  balance: number | string,
  decimals?: number,
) => string;
export type IsValidBitcoinAddressFunction = (address: string) => boolean;