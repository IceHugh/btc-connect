// 网络相关的类型定义

/**
 * 网络类型
 * - `livenet`: 比特币主网 (与 'mainnet' 和 'bitcoin' 相同)
 * - `testnet`: 比特币测试网
 * - `regtest`: 本地回归测试网络
 * - `mainnet`: 比特币主网
 * - `bitcoin`: 比特币主网
 */
export type Network = 'livenet' | 'testnet' | 'regtest' | 'mainnet' | 'bitcoin';

/**
 * 定义网络切换事件的回调函数类型。
 * 当网络发生变化时，将调用此类型的函数。
 *
 * @param network 新的网络名称。
 */
export type OnNetworkChange = (network: Network) => void;
