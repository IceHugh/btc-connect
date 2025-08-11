import { describe, expect, it } from 'bun:test';
import { XverseAdapter } from '../src/adapters/xverse';
import { Network } from '../src/types';

describe('Xverse适配器网络转换测试', () => {
  it('应该正确转换Xverse网络字符串为Network枚举', () => {
    const adapter = new XverseAdapter();

    // 测试私有方法，需要访问内部方法
    const normalizeNetwork = (adapter as any).normalizeNetwork.bind(adapter);

    expect(normalizeNetwork('livenet')).toBe(Network.MAINNET);
    expect(normalizeNetwork('testnet')).toBe(Network.TESTNET);
    expect(normalizeNetwork('regtest')).toBe(Network.REGTEST);
    expect(normalizeNetwork('unknown')).toBe(Network.MAINNET); // 默认值
  });

  it('应该正确转换Network枚举为Xverse网络字符串', () => {
    const adapter = new XverseAdapter();

    // 测试私有方法，需要访问内部方法
    const convertToXverseNetwork = (adapter as any).convertToXverseNetwork.bind(
      adapter,
    );

    expect(convertToXverseNetwork(Network.MAINNET)).toBe('livenet');
    expect(convertToXverseNetwork(Network.TESTNET)).toBe('testnet');
    expect(convertToXverseNetwork(Network.REGTEST)).toBe('regtest');
    expect(convertToXverseNetwork('unknown' as Network)).toBe('livenet'); // 默认值
  });
});
