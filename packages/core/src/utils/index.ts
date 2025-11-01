import { BTCWalletManager } from '../managers';
import type { WalletManagerConfig } from '../types';
import type {
  FormatAddressOptions,
  FormatBalanceOptions,
} from '../types/unified';

/**
 * 创建钱包管理器的工厂函数
 */
export function createWalletManager(
  config?: WalletManagerConfig,
): BTCWalletManager {
  return new BTCWalletManager(config);
}

/**
 * 默认的钱包管理器实例
 */
export const defaultWalletManager = createWalletManager();

/**
 * 获取默认钱包管理器
 */
export function getDefaultWalletManager(): BTCWalletManager {
  return defaultWalletManager;
}

// === 统一工具函数 ===

/**
 * 地址格式化函数
 *
 * @param address - 要格式化的比特币地址
 * @param options - 格式化选项
 * @returns 格式化后的地址字符串
 *
 * @example
 * ```typescript
 * formatAddress('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh')
 * // 返回: 'bc1q...0wlh'
 *
 * formatAddress('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', {
 *   startChars: 8,
 *   endChars: 4
 * })
 * // 返回: 'bc1qxy2...0wlh'
 * ```
 */
export function formatAddress(
  address: string,
  options: FormatAddressOptions = {},
): string {
  const {
    startChars = 6,
    endChars = 4,
    separator = '...',
    threshold = 12,
  } = options;

  // 如果地址长度小于阈值，直接返回原地址
  if (address.length <= threshold) {
    return address;
  }

  // 如果开始和结束字符数加起来大于等于地址长度，直接返回原地址
  if (startChars + endChars >= address.length) {
    return address;
  }

  const start = address.slice(0, startChars);
  const end = address.slice(-endChars);

  return `${start}${separator}${end}`;
}

/**
 * 余额格式化函数
 *
 * @param satoshis - 以聪为单位的余额
 * @param options - 格式化选项
 * @returns 格式化后的余额字符串
 *
 * @example
 * ```typescript
 * formatBalance(123456789)
 * // 返回: '1.23456789 BTC'
 *
 * formatBalance(123456789, { unit: 'mBTC', decimals: 2 })
 * // 返回: '1,234.57 mBTC'
 *
 * formatBalance(123456789, { showSymbol: false })
 * // 返回: '1.23456789'
 * ```
 */
export function formatBalance(
  satoshis: number,
  options: FormatBalanceOptions = {},
): string {
  const {
    unit = 'BTC',
    decimals = 8,
    showSymbol = true,
    locale = 'en-US',
    useGrouping = true,
  } = options;

  if (typeof satoshis !== 'number' || Number.isNaN(satoshis)) {
    throw new Error('Invalid satoshis value: must be a number');
  }

  if (satoshis < 0) {
    throw new Error('Invalid satoshis value: cannot be negative');
  }

  let value: number;
  let unitSymbol: string;

  switch (unit) {
    case 'satoshi':
      value = satoshis;
      unitSymbol = 'satoshi';
      break;
    case 'mBTC':
      value = satoshis / 100000; // 1 BTC = 1,000,000 mBTC
      unitSymbol = 'mBTC';
      break;
    default:
      value = satoshis / 100000000; // 1 BTC = 100,000,000 satoshis
      unitSymbol = 'BTC';
      break;
  }

  // 格式化数字
  const formattedValue = new Intl.NumberFormat(locale, {
    minimumFractionDigits:
      decimals === 0
        ? 0
        : Math.max(0, decimals - Math.floor(Math.log10(value)) - 8),
    maximumFractionDigits: decimals,
    useGrouping,
  }).format(value);

  // 如果不显示符号，只返回数字
  if (!showSymbol) {
    return formattedValue;
  }

  // 返回带单位的字符串
  return `${formattedValue} ${unitSymbol}`;
}

/**
 * 复制文本到剪贴板
 *
 * @param text - 要复制的文本
 * @returns Promise<boolean> 是否复制成功
 *
 * @example
 * ```typescript
 * const success = await copyToClipboard('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh');
 * if (success) {
 *   console.log('地址已复制到剪贴板');
 * }
 * ```
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // 检查是否支持 Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // 降级方案：使用 document.execCommand
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    }
  } catch (error) {
    console.error('Failed to copy text to clipboard:', error);
    return false;
  }
}

/**
 * 验证比特币地址格式
 *
 * @param address - 要验证的比特币地址
 * @returns 是否为有效的比特币地址
 *
 * @example
 * ```typescript
 * const isValid = validateAddress('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh');
 * console.log(isValid); // true
 * ```
 */
export function validateAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }

  // 基础长度检查
  if (address.length < 26 || address.length > 90) {
    return false;
  }

  // 比特币地址正则表达式（支持 P2PKH, P2SH, P2WPKH, P2WSH, P2TR）
  const bitcoinAddressRegex = /^(bc1|tb1|[13])[a-zA-HJ-NP-Z0-9]{25,87}$/;

  return bitcoinAddressRegex.test(address);
}

/**
 * 验证金额是否有效
 *
 * @param amount - 要验证的金额（聪）
 * @returns 是否为有效金额
 *
 * @example
 * ```typescript
 * const isValid = validateAmount(1000);
 * console.log(isValid); // true
 *
 * const isInvalid = validateAmount(-100);
 * console.log(isInvalid); // false
 * ```
 */
export function validateAmount(amount: number): boolean {
  if (typeof amount !== 'number' || Number.isNaN(amount)) {
    return false;
  }

  if (amount < 0) {
    return false;
  }

  // 检查是否为整数（因为聪是比特币的最小单位）
  if (!Number.isInteger(amount)) {
    return false;
  }

  // 检查最大值（比特币总量约 2100 万 BTC = 2.1 * 10^15 聪）
  const MAX_SATOSHIS = 2100000000000000; // 21 million BTC in satoshis
  if (amount > MAX_SATOSHIS) {
    return false;
  }

  return true;
}

/**
 * 获取钱包图标URL
 *
 * @param walletId - 钱包ID
 * @returns 钱包图标URL
 *
 * @example
 * ```typescript
 * const iconUrl = getWalletIcon('unisat');
 * console.log(iconUrl); // 'https://unisat.io/favicon.ico'
 * ```
 */
export function getWalletIcon(walletId: string): string {
  const walletIcons: Record<string, string> = {
    unisat: 'https://unisat.io/favicon.ico',
    okx: 'https://www.okx.com/favicon.ico',
    xverse: 'https://xverse.app/favicon.ico',
    leather: 'https://leather.io/favicon.ico',
    magic: 'https://magicEden.io/favicon.ico',
    ordinals: 'https://ordinals.com/favicon.ico',
    sparrow: 'https://sparrowwallet.com/favicon.ico',
  };

  return walletIcons[walletId.toLowerCase()] || 'https://btc.com/favicon.ico';
}

/**
 * 格式化时间戳
 *
 * @param timestamp - Unix 时间戳（毫秒）
 * @param locale - 本地化设置
 * @returns 格式化后的时间字符串
 *
 * @example
 * ```typescript
 * const formatted = formatTimestamp(Date.now());
 * console.log(formatted); // '2024-01-01 12:00:00'
 * ```
 */
export function formatTimestamp(
  timestamp: number,
  locale: string = 'en-US',
): string {
  if (typeof timestamp !== 'number' || Number.isNaN(timestamp)) {
    throw new Error('Invalid timestamp: must be a number');
  }

  const date = new Date(timestamp);

  return date.toLocaleString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

/**
 * 格式化交易ID
 *
 * @param txid - 交易ID
 * @param options - 格式化选项
 * @returns 格式化后的交易ID
 *
 * @example
 * ```typescript
 * formatTxid('a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456');
 * // 返回: 'a1b2c3d...3456'
 * ```
 */
export function formatTxid(
  txid: string,
  options: { startChars?: number; endChars?: number; separator?: string } = {},
): string {
  const { startChars = 8, endChars = 4, separator = '...' } = options;

  if (!txid || typeof txid !== 'string') {
    return '';
  }

  if (txid.length <= startChars + endChars) {
    return txid;
  }

  const start = txid.slice(0, startChars);
  const end = txid.slice(-endChars);

  return `${start}${separator}${end}`;
}

/**
 * 计算交易费用率
 *
 * @param fee - 费用（聪）
 * @param size - 交易大小（字节）
 * @returns 费用率（聪/字节）
 *
 * @example
 * ```typescript
 * const feeRate = calculateFeeRate(1000, 250);
 * console.log(feeRate); // 4
 * ```
 */
export function calculateFeeRate(fee: number, size: number): number {
  if (typeof fee !== 'number' || typeof size !== 'number' || size <= 0) {
    throw new Error(
      'Invalid parameters: fee must be a number and size must be a positive number',
    );
  }

  return Math.round(fee / size);
}

/**
 * 格式化费用率
 *
 * @param feeRate - 费用率（聪/字节）
 * @returns 格式化后的费用率字符串
 *
 * @example
 * ```typescript
 * const formatted = formatFeeRate(4.5);
 * console.log(formatted); // '4.5 sat/vB'
 * ```
 */
export function formatFeeRate(feeRate: number): string {
  if (typeof feeRate !== 'number' || Number.isNaN(feeRate)) {
    return '0 sat/vB';
  }

  return `${feeRate.toFixed(1)} sat/vB`;
}

/**
 * 工具函数集合导出
 */
export const utils = {
  formatAddress,
  formatBalance,
  copyToClipboard,
  validateAddress,
  validateAmount,
  getWalletIcon,
  formatTimestamp,
  formatTxid,
  calculateFeeRate,
  formatFeeRate,
} as const;
