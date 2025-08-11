import { describe, expect, it } from 'bun:test';
import { OKXAdapter } from '../src/adapters/okx';
import { Network } from '../src/types';

describe('OKX适配器网络转换测试', () => {
  it('应该正确转换OKX网络字符串为Network枚举', () => {
    const adapter = new OKXAdapter();

    // 测试私有方法，需要访问内部方法
    const normalizeNetwork = (adapter as any).normalizeNetwork.bind(adapter);

    expect(normalizeNetwork('livenet')).toBe(Network.MAINNET);
    expect(normalizeNetwork('testnet')).toBe(Network.TESTNET);
    expect(normalizeNetwork('regtest')).toBe(Network.REGTEST);
    expect(normalizeNetwork('unknown')).toBe(Network.MAINNET); // 默认值
  });
});
