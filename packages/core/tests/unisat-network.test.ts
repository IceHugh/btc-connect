import { describe, expect, it } from 'bun:test';
import { UniSatAdapter } from '../src/adapters/unisat';
import { Network } from '../src/types';

describe('UniSat适配器网络转换测试', () => {
  it('应该正确转换UniSat网络字符串为Network枚举', () => {
    const adapter = new UniSatAdapter();

    // 测试私有方法，需要访问内部方法
    const normalizeNetwork = (adapter as any).normalizeNetwork.bind(adapter);

    expect(normalizeNetwork('livenet')).toBe(Network.MAINNET);
    expect(normalizeNetwork('testnet')).toBe(Network.TESTNET);
    expect(normalizeNetwork('regtest')).toBe(Network.REGTEST);
    expect(normalizeNetwork('unknown')).toBe(Network.MAINNET); // 默认值
  });

  it('应该正确转换Network枚举为UniSat网络字符串', () => {
    const adapter = new UniSatAdapter();

    // 测试私有方法，需要访问内部方法
    const convertToUnisatNetwork = (adapter as any).convertToUnisatNetwork.bind(
      adapter,
    );

    expect(convertToUnisatNetwork(Network.MAINNET)).toBe('livenet');
    expect(convertToUnisatNetwork(Network.TESTNET)).toBe('testnet');
    expect(convertToUnisatNetwork(Network.REGTEST)).toBe('regtest');
    expect(convertToUnisatNetwork('unknown' as Network)).toBe('livenet'); // 默认值
  });
});
