import { describe, it, expect } from 'bun:test';
import { EventEmitter, BaseWalletAdapter } from '../index';

describe('Core Package Basic Tests', () => {
  describe('EventEmitter', () => {
    it('should create an event emitter', () => {
      const emitter = new EventEmitter();
      expect(emitter).toBeDefined();
    });

    it('should register and trigger event listeners', () => {
      const emitter = new EventEmitter();
      let called = false;

      emitter.on('test-event', () => {
        called = true;
      });

      emitter.emit('test-event');
      expect(called).toBe(true);
    });

    it('should remove event listeners', () => {
      const emitter = new EventEmitter();
      let calls = 0;

      const handler = () => calls++;
      emitter.on('test-event', handler);
      emitter.emit('test-event');
      expect(calls).toBe(1);

      emitter.off('test-event', handler);
      emitter.emit('test-event');
      expect(calls).toBe(1); // Should still be 1
    });

    it('should handle multiple listeners', () => {
      const emitter = new EventEmitter();
      let calls = 0;

      emitter.on('test-event', () => calls++);
      emitter.on('test-event', () => calls++);

      emitter.emit('test-event');
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
      const network = await adapter.getNetwork();
      expect(network).toBe('livenet');

      await adapter.switchNetwork('testnet');
      // Should complete without throwing
      expect(true).toBe(true);
    });

    it('should handle signing operations', async () => {
      const adapter = new TestWalletAdapter();
      const signature = await adapter.signMessage('test message');
      expect(signature).toBe('mock-signature');

      const signedPsbt = await adapter.signPsbt('test-psbt');
      expect(signedPsbt).toBe('mock-signed-psbt');
    });

    it('should handle sending bitcoin', async () => {
      const adapter = new TestWalletAdapter();
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

  isReady(): boolean {
    return true;
  }

  async connect(): Promise<any[]> {
    return [{
      address: 'test-address',
      publicKey: 'test-public-key',
    }];
  }

  async disconnect(): Promise<void> {
    // Mock implementation
  }

  async getAccounts(): Promise<any[]> {
    return [{
      address: 'test-address',
      publicKey: 'test-public-key',
    }];
  }

  async getCurrentAccount(): Promise<any> {
    return {
      address: 'test-address',
      publicKey: 'test-public-key',
    };
  }

  async getNetwork(): Promise<string> {
    return 'livenet';
  }

  async switchNetwork(network: string): Promise<void> {
    // Mock implementation
  }

  async signMessage(message: string): Promise<string> {
    return 'mock-signature';
  }

  async signPsbt(psbt: string): Promise<string> {
    return 'mock-signed-psbt';
  }

  async sendBitcoin(toAddress: string, amount: number): Promise<string> {
    return 'mock-txid';
  }
}