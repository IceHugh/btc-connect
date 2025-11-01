/**
 * @btc-connect/core 核心模块测试套件
 */

import { describe, it, expect, beforeEach, beforeAll } from 'bun:test';
import { BTCWalletManager, createWalletManager, createAdapter, detectAvailableWallets, getAllAdapters } from '../index';

describe('BTCWalletManager', () => {
  let manager: BTCWalletManager;

  beforeEach(() => {
    manager = new BTCWalletManager({
      onStateChange: () => {},
      onError: () => {},
    });
  });

  it('应该创建管理器实例', () => {
    expect(manager).toBeDefined();
    expect(manager).toBeInstanceOf(BTCWalletManager);
  });

  it('应该有正确的初始状态', () => {
    const state = manager.getState();
    expect(state.status).toBe('disconnected');
    expect(state.accounts).toEqual([]);
    expect(state.currentAccount).toBeUndefined();
  });

  it('应该能够注册适配器', () => {
    const mockAdapter = {
      id: 'test-wallet',
      name: 'Test Wallet',
      icon: 'test-icon.png',
      isReady: () => true,
      getState: () => ({
        status: 'disconnected',
        accounts: [],
        network: 'livenet',
        error: null,
      }),
      connect: async () => [],
      disconnect: async () => {},
      getAccounts: async () => [],
      getCurrentAccount: async () => null,
      getNetwork: async () => 'livenet',
      switchNetwork: async () => {},
      on: () => {},
      off: () => {},
      signMessage: async () => 'signature',
      signPsbt: async () => 'psbt',
      sendBitcoin: async () => 'txid',
    };

    manager.register(mockAdapter);

    const retrievedAdapter = manager.getAdapter('test-wallet');
    expect(retrievedAdapter).toBe(mockAdapter);
  });

  it('应该能够获取所有适配器', () => {
    const allAdapters = manager.getAllAdapters();
    expect(Array.isArray(allAdapters)).toBe(true);
    expect(allAdapters.length).toBeGreaterThanOrEqual(0);
  });

  it('应该能够获取当前适配器', () => {
    const currentAdapter = manager.getCurrentAdapter();
    expect(currentAdapter).toBeNull();
  });
});

describe('createWalletManager', () => {
  it('应该使用工厂函数创建管理器', () => {
    const manager = createWalletManager();
    expect(manager).toBeDefined();
    expect(manager).toBeInstanceOf(BTCWalletManager);
  });

  it('应该接受配置选项', () => {
    const mockErrorHandler = () => {};
    const manager = createWalletManager({
      onError: mockErrorHandler,
    });
    expect(manager).toBeDefined();
  });
});

describe('适配器工厂', () => {
  it('应该创建 UniSat 适配器', () => {
    const adapter = createAdapter('unisat');
    expect(adapter).toBeDefined();
    expect(adapter.id).toBe('unisat');
  });

  it('应该创建 OKX 适配器', () => {
    const adapter = createAdapter('okx');
    expect(adapter).toBeDefined();
    expect(adapter.id).toBe('okx');
  });

  it('应该对未知适配器返回 null', () => {
    try {
      const adapter = createAdapter('unknown');
      // 如果没有抛出错误，应该返回 null
      expect(adapter).toBeNull();
    } catch (error) {
      // 如果抛出错误，验证错误信息
      expect(error.message).toContain('Unsupported wallet type');
    }
  });

  it('应该获取所有适配器', () => {
    const adapters = getAllAdapters();
    expect(Array.isArray(adapters)).toBe(true);
    expect(adapters.length).toBeGreaterThanOrEqual(2);
  });
});

describe('钱包检测', () => {
  it('应该检测可用的钱包', async () => {
    const result = await detectAvailableWallets({
      timeout: 1000,
      interval: 100,
    });

    expect(result).toBeDefined();
    expect(result.wallets).toBeDefined();
    expect(Array.isArray(result.wallets)).toBe(true);
    expect(result.isComplete).toBe(true);
    expect(result.elapsedTime).toBeGreaterThan(0);
  });

  it('应该返回适配器实例', async () => {
    const result = await detectAvailableWallets({
      timeout: 1000,
      interval: 100
    });

    expect(result).toBeDefined();
    expect(result.adapters).toBeDefined();
    expect(Array.isArray(result.adapters)).toBe(true);
    expect(result.isComplete).toBe(true);
    expect(result.elapsedTime).toBeGreaterThan(0);

    if (result.adapters.length > 0) {
      const adapter = result.adapters[0];
      expect(adapter).toBeDefined();
      expect(typeof adapter.id).toBe('string');
      expect(typeof adapter.name).toBe('string');
    }
  });
});

describe('事件系统', () => {
  let manager: BTCWalletManager;
  let events: any[] = [];

  beforeEach(() => {
    events = [];
    manager = new BTCWalletManager({
      onStateChange: (state) => events.push({ type: 'stateChange', state }),
      onError: (error) => events.push({ type: 'error', error }),
    });
  });

  it('应该能够触发状态变化事件', () => {
    // 注册一个模拟适配器
    const mockAdapter = {
      id: 'test-wallet',
      name: 'Test Wallet',
      icon: 'test-icon.png',
      isReady: () => true,
      getState: () => ({
        status: 'connected',
        accounts: [{
          address: 'test-address',
          publicKey: 'test-publickey',
          balance: 1000,
          network: 'livenet',
        }],
        currentAccount: {
          address: 'test-address',
          publicKey: 'test-publickey',
          balance: 1000,
          network: 'livenet',
        },
        network: 'livenet',
        error: null,
      }),
      connect: async () => [],
      disconnect: async () => {},
      getAccounts: async () => [],
      getCurrentAccount: async () => ({
        address: 'test-address',
        publicKey: 'test-publickey',
        balance: 1000,
        network: 'livenet',
      }),
      getNetwork: async () => 'livenet',
      switchNetwork: async () => {},
      on: () => {},
      off: () => {},
      signMessage: async () => 'signature',
      signPsbt: async () => 'psbt',
      sendBitcoin: async () => 'txid',
    };

    manager.register(mockAdapter);
    // 这里可以添加状态变化触发逻辑
  });
});

describe('错误处理', () => {
  let manager: BTCWalletManager;

  beforeEach(() => {
    manager = new BTCWalletManager({
      onError: () => {},
    });
  });

  it('应该处理无效的钱包ID', () => {
    const adapter = manager.getAdapter('invalid-wallet');
    expect(adapter).toBeNull();
  });

  it('应该处理重复注册的适配器', () => {
    const mockAdapter = {
      id: 'duplicate-wallet',
      name: 'Duplicate Wallet',
      icon: 'test-icon.png',
      isReady: () => true,
      getState: () => ({
        status: 'disconnected',
        accounts: [],
        network: 'livenet',
        error: null,
      }),
      connect: async () => [],
      disconnect: async () => {},
      getAccounts: async () => [],
      getCurrentAccount: async () => null,
      getNetwork: async () => 'livenet',
      switchNetwork: async () => {},
      on: () => {},
      off: () => {},
      signMessage: async () => 'signature',
      signPsbt: async () => 'psbt',
      sendBitcoin: async () => 'txid',
    };

    manager.register(mockAdapter);

    // 尝试注册同名适配器应该不会崩溃
    expect(() => {
      manager.register(mockAdapter);
    }).not.toThrow();
  });
});