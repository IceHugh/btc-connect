import { describe, expect, it } from 'bun:test';
import { Network } from '../src/types';

describe('Network枚举测试', () => {
  it('应该定义正确的Network枚举值', () => {
    expect(Network.MAINNET).toBe('mainnet');
    expect(Network.TESTNET).toBe('testnet');
    expect(Network.REGTEST).toBe('regtest');
  });

  it('应该能够使用Network枚举作为类型', () => {
    const testNetwork: Network = Network.MAINNET;
    expect(testNetwork).toBe('mainnet');
  });

  it('应该能够比较Network枚举值', () => {
    expect(Network.MAINNET).toBe(Network.MAINNET);
    expect(Network.MAINNET).not.toBe(Network.TESTNET);
  });
});
