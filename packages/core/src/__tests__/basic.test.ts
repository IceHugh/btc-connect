import { describe, it, expect } from 'bun:test';
import { EventEmitter, BaseWalletAdapter, Network, WalletEvent, AccountInfo } from '../index';

describe('Core Package Basic Tests', () => {
  describe('EventEmitter', () => {
    it('should create an event emitter', () => {
      const emitter = new EventEmitter();
      expect(emitter).toBeDefined();
    });

    it('should register and trigger event listeners', () => {
      const emitter = new EventEmitter();
      let called = false;

      emitter.on('connect', () => {
        called = true;
      });

      emitter.emit('connect', { walletId: 'test-wallet', accounts: [] });
      expect(called).toBe(true);
    });

    it('should remove event listeners', () => {
      const emitter = new EventEmitter();
      let calls = 0;

      const handler = () => calls++;
      emitter.on('connect', handler);
      emitter.emit('connect', { walletId: 'test-wallet', accounts: [] });
      expect(calls).toBe(1);

      emitter.off('connect', handler);
      emitter.emit('connect', { walletId: 'test-wallet', accounts: [] });
      expect(calls).toBe(1); // Should still be 1
    });

    it('should handle multiple listeners', () => {
      const emitter = new EventEmitter();
      let calls = 0;

      emitter.on('connect', () => calls++);
      emitter.on('connect', () => calls++);

      emitter.emit('connect', { walletId: 'test-wallet', accounts: [] });
      expect(calls).toBe(2);
    });
  });

  describe('BaseWalletAdapter', () => {
    it('should create a base adapter', () => {
      const adapter = new TestWalletAdapter();
      expect(adapter.id).toBe('test-wallet');
      expect(adapter.name).toBe('Test Wallet');
      expect(adapter.icon).toBe('test-icon.png');
    });

    it('should check readiness', () => {
      const adapter = new TestWalletAdapter();
      expect(adapter.isReady()).toBe(true);
    });

    it('should return wallet state', () => {
      const adapter = new TestWalletAdapter();
      const state = adapter.getState();
      expect(state).toHaveProperty('status');
      expect(state).toHaveProperty('accounts');
    });

    it('should handle network operations', async () => {
      const adapter = new TestWalletAdapter();

      // 先连接钱包
      await adapter.connect();

      const network = await adapter.getNetwork();
      expect(network).toBe('livenet');

      await adapter.switchNetwork('testnet');
      // Should complete without throwing
      expect(true).toBe(true);
    });

    it('should handle signing operations', async () => {
      const adapter = new TestWalletAdapter();

      // 先连接钱包
      await adapter.connect();

      const signature = await adapter.signMessage('test message');
      expect(signature).toBe('mock-signature');

      const signedPsbt = await adapter.signPsbt('test-psbt');
      expect(signedPsbt).toBe('mock-signed-psbt');
    });

    it('should handle sending bitcoin', async () => {
      const adapter = new TestWalletAdapter();

      // 先连接钱包
      await adapter.connect();

      const txid = await adapter.sendBitcoin('test-address', 1000);
      expect(txid).toBe('mock-txid');
    });
  });
});

// Test implementation of BaseWalletAdapter
class TestWalletAdapter extends BaseWalletAdapter {
  id = 'test-wallet';
  name = 'Test Wallet';
  icon = 'test-icon.png';

  // 实现抽象方法：获取钱包实例
  protected getWalletInstance(): any {
    return {
      id: 'test-wallet',
      name: 'Test Wallet',
      // Mock wallet methods
      on: () => {},
      removeListener: () => {},
    };
  }

  // 重写 isReady 方法，在测试环境中始终返回 true
  isReady(): boolean {
    return true;
  }

  // 实现抽象方法：连接处理
  protected async handleConnect(): Promise<AccountInfo[]> {
    return [{
      address: 'test-address',
      publicKey: 'test-public-key',
      network: 'livenet',
    }];
  }

  // 实现抽象方法：断开连接处理
  protected async handleDisconnect(): Promise<void> {
    // Mock implementation
  }

  // 实现抽象方法：获取账户列表
  protected async handleGetAccounts(): Promise<AccountInfo[]> {
    return [{
      address: 'test-address',
      publicKey: 'test-public-key',
      network: 'livenet',
    }];
  }

  // 实现抽象方法：获取网络
  protected async handleGetNetwork(): Promise<Network> {
    return 'livenet';
  }

  // 实现抽象方法：切换网络
  protected async handleSwitchNetwork(network: Network): Promise<void> {
    // Mock implementation
  }

  // 实现抽象方法：签名消息
  protected async handleSignMessage(message: string): Promise<string> {
    return 'mock-signature';
  }

  // 实现抽象方法：签名PSBT
  protected async handleSignPsbt(psbt: string): Promise<string> {
    return 'mock-signed-psbt';
  }

  // 实现抽象方法：发送比特币
  protected async handleSendBitcoin(toAddress: string, amount: number): Promise<string> {
    return 'mock-txid';
  }
}