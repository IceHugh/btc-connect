// 网络相关的类型定义
import type { Network as CoreNetwork } from './core';

/**
 * 网络类型
 * - `livenet`: 比特币主网 (与 'mainnet' 和 'bitcoin' 相同)
 * - `testnet`: 比特币测试网
 * - `regtest`: 本地回归测试网络
 * - `mainnet`: 比特币主网
 */
export type Network = CoreNetwork;

/**
 * 定义网络切换事件的回调函数类型。
 * 当网络发生变化时，将调用此类型的函数。
 *
 * @param network 新的网络名称。
 */
export type OnNetworkChange = (network: Network) => void;

// 网络信息映射
export const NETWORK_INFO: Record<Network, { name: string; type: string }> = {
  livenet: {
    name: 'Mainnet',
    type: 'main',
  },
  testnet: {
    name: 'Testnet',
    type: 'test',
  },
  regtest: {
    name: 'Regtest',
    type: 'regtest',
  },
  mainnet: {
    name: 'Mainnet',
    type: 'main',
  },
};

// 获取网络名称
export function getNetworkName(network?: Network): string {
  if (!network) return 'Unknown';
  return NETWORK_INFO[network]?.name || 'Unknown';
}

// 获取网络类型
export function getNetworkType(network?: Network): string {
  if (!network) return 'unknown';
  return NETWORK_INFO[network]?.type || 'unknown';
}

// 扩展网络类型以包含显示信息
export interface NetworkInfo {
  network: Network;
  name: string;
  type: string;
}

// 获取完整的网络信息
export function getNetworkInfo(network?: Network): NetworkInfo | null {
  if (!network) return null;
  const info = NETWORK_INFO[network];
  return info ? { network, name: info.name, type: info.type } : null;
}
