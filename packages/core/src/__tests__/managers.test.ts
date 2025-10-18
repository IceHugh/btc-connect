/**
 * 钱包管理器测试
 */

import { BTCWalletManager } from '../managers';
import { createMockAdapter, createMockAccountInfo, flushPromises } from './setup';
import type { WalletState, AccountInfo } from '../types';

describe('BTCWalletManager', () => {
  let manager: BTCWalletManager;
  let mockAdapter: ReturnType<typeof createMockAdapter>;

  beforeEach(() => {
    manager = new BTCWalletManager();
    mockAdapter = createMockAdapter('test-wallet');
  });

  afterEach(() => {
    manager.destroy();
  });

  describe('constructor', () => {
    it('should create manager with default config', () => {
      expect(manager.config).toEqual({});
    });

    it('should create manager with custom config', () => {
      const onError = jest.fn();
      const onStateChange = jest.fn();
      const customManager = new BTCWalletManager({
        onError,
        onStateChange,
      });

      expect(customManager.config.onError).toBe(onError);
      expect(customManager.config.onStateChange).toBe(onStateChange);

      customManager.destroy();
    });
  });

  describe('adapter registration', () => {
    it('should register adapter', () => {
      manager.register(mockAdapter);

      expect(manager.getAdapter('test-wallet')).toBe(mockAdapter);
      expect(manager.getAllAdapters()).toContain(mockAdapter);
    });

    it('should unregister adapter', () => {
      manager.register(mockAdapter);
      manager.unregister('test-wallet');

      expect(manager.getAdapter('test-wallet')).toBeNull();
      expect(manager.getAllAdapters()).not.toContain(mockAdapter);
    });

    it('should replace existing adapter', () => {
      const oldAdapter = createMockAdapter('test-wallet');
      const newAdapter = createMockAdapter('test-wallet');

      manager.register(oldAdapter);
      manager.register(newAdapter);

      expect(manager.getAdapter('test-wallet')).toBe(newAdapter);
      expect(manager.getAllAdapters()).toContain(newAdapter);
      expect(manager.getAllAdapters()).not.toContain(oldAdapter);
    });

    it('should throw error when registering to destroyed manager', () => {
      manager.destroy();

      expect(() => {
        manager.register(mockAdapter);
      }).toThrow('WalletManager has been destroyed');
    });
  });

  describe('wallet discovery', () => {
    it('should return available wallets', () => {
      const readyAdapter = createMockAdapter('ready-wallet');
      const notReadyAdapter = createMockAdapter('not-ready-wallet');

      readyAdapter.isReady.mockReturnValue(true);
      notReadyAdapter.isReady.mockReturnValue(false);

      manager.register(readyAdapter);
      manager.register(notReadyAdapter);

      const availableWallets = manager.getAvailableWallets();

      expect(availableWallets).toHaveLength(1);
      expect(availableWallets[0].id).toBe('ready-wallet');
    });

    it('should return empty array when no adapters are ready', () => {
      const notReadyAdapter = createMockAdapter('not-ready-wallet');
      notReadyAdapter.isReady.mockReturnValue(false);

      manager.register(notReadyAdapter);

      const availableWallets = manager.getAvailableWallets();

      expect(availableWallets).toHaveLength(0);
    });
  });

  describe('connection management', () => {
    beforeEach(() => {
      manager.register(mockAdapter);
    });

    it('should connect to wallet', async () => {
      const accounts = [createMockAccountInfo()];
      mockAdapter.connect.mockResolvedValue(accounts);

      const result = await manager.connect('test-wallet');

      expect(result).toBe(accounts);
      expect(mockAdapter.connect).toHaveBeenCalled();
      expect(manager.getCurrentAdapter()).toBe(mockAdapter);
      expect(manager.getCurrentWallet()?.id).toBe('test-wallet');
    });

    it('should throw error when wallet not found', async () => {
      await expect(manager.connect('nonexistent-wallet')).rejects.toThrow(
        'Wallet nonexistent-wallet not found'
      );
    });

    it('should disconnect current wallet before connecting to new one', async () => {
      const oldAdapter = createMockAdapter('old-wallet');
      const newAdapter = createMockAdapter('new-wallet');

      manager.register(oldAdapter);
      manager.register(newAdapter);

      await manager.connect('old-wallet');
      await manager.connect('new-wallet');

      expect(oldAdapter.disconnect).toHaveBeenCalled();
      expect(newAdapter.connect).toHaveBeenCalled();
      expect(manager.getCurrentAdapter()).toBe(newAdapter);
    });

    it('should disconnect wallet', async () => {
      await manager.connect('test-wallet');
      await manager.disconnect();

      expect(mockAdapter.disconnect).toHaveBeenCalled();
      expect(manager.getCurrentAdapter()).toBeNull();
      expect(manager.getCurrentWallet()).toBeNull();
    });

    it('should handle disconnect errors gracefully', async () => {
      mockAdapter.disconnect.mockRejectedValue(new Error('Disconnect error'));

      // Should not throw error
      await expect(manager.disconnect()).resolves.toBeUndefined();
      expect(manager.getCurrentAdapter()).toBeNull();
    });
  });

  describe('state management', () => {
    beforeEach(() => {
      manager.register(mockAdapter);
    });

    it('should return disconnected state when no current adapter', () => {
      const state = manager.getState();

      expect(state.status).toBe('disconnected');
      expect(state.accounts).toEqual([]);
      expect(state.currentAccount).toBeUndefined();
    });

    it('should return adapter state when connected', async () => {
      const accounts = [createMockAccountInfo()];
      const adapterState: WalletState = {
        status: 'connected',
        accounts,
        currentAccount: accounts[0],
        network: 'testnet',
      };

      mockAdapter.getState.mockReturnValue(adapterState);
      mockAdapter.connect.mockResolvedValue(accounts);

      await manager.connect('test-wallet');

      const state = manager.getState();

      expect(state).toEqual(adapterState);
    });
  });

  describe('event handling', () => {
    beforeEach(() => {
      manager.register(mockAdapter);
    });

    it('should emit connect event', async () => {
      const connectHandler = jest.fn();
      manager.on('connect', connectHandler);

      const accounts = [createMockAccountInfo()];
      mockAdapter.connect.mockResolvedValue(accounts);

      await manager.connect('test-wallet');
      await flushPromises();

      expect(connectHandler).toHaveBeenCalledWith(accounts);
    });

    it('should emit disconnect event', async () => {
      const disconnectHandler = jest.fn();
      manager.on('disconnect', disconnectHandler);

      await manager.connect('test-wallet');
      await manager.disconnect();
      await flushPromises();

      expect(disconnectHandler).toHaveBeenCalled();
    });

    it('should emit error event', async () => {
      const errorHandler = jest.fn();
      const customErrorHandler = jest.fn();

      manager.config.onError = customErrorHandler;
      manager.on('error', errorHandler);

      const error = new Error('Connection failed');
      mockAdapter.connect.mockRejectedValue(error);

      await expect(manager.connect('test-wallet')).rejects.toThrow();
      await flushPromises();

      expect(errorHandler).toHaveBeenCalledWith(error);
      expect(customErrorHandler).toHaveBeenCalledWith(error);
    });

    it('should remove event listeners', () => {
      const handler = jest.fn();

      manager.on('connect', handler);
      manager.off('connect', handler);

      mockAdapter._emit('connect', []);

      expect(handler).not.toHaveBeenCalled();
    });

    it('should call onStateChange callback', async () => {
      const onStateChange = jest.fn();
      manager.config.onStateChange = onStateChange;

      const accounts = [createMockAccountInfo()];
      mockAdapter.connect.mockResolvedValue(accounts);

      await manager.connect('test-wallet');
      await flushPromises();

      expect(onStateChange).toHaveBeenCalled();
    });
  });

  describe('assumeConnected', () => {
    beforeEach(() => {
      manager.register(mockAdapter);
    });

    it('should return null when assumeConnected fails', async () => {
      // Mock getAccounts to throw error
      mockAdapter.getAccounts.mockRejectedValue(new Error('Failed to get accounts'));

      const result = await manager.assumeConnected('test-wallet');

      expect(result).toBeNull();
      expect(manager.getCurrentAdapter()).toBeNull();
    });

    it('should return null when no accounts exist', async () => {
      mockAdapter.getAccounts.mockResolvedValue([]);

      const result = await manager.assumeConnected('test-wallet');

      expect(result).toBeNull();
      expect(manager.getCurrentAdapter()).toBeNull();
    });

    it('should return null when adapter not found', async () => {
      const result = await manager.assumeConnected('nonexistent-wallet');

      expect(result).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      mockAdapter.getAccounts.mockRejectedValue(new Error('Failed to get accounts'));

      const result = await manager.assumeConnected('test-wallet');

      expect(result).toBeNull();
    });
  });

  describe('switchWallet', () => {
    beforeEach(() => {
      manager.register(mockAdapter);
    });

    it('should switch to different wallet', async () => {
      const accounts = [createMockAccountInfo()];
      mockAdapter.connect.mockResolvedValue(accounts);

      const result = await manager.switchWallet('test-wallet');

      expect(result).toBe(accounts);
      expect(manager.getCurrentAdapter()).toBe(mockAdapter);
    });
  });

  describe('cleanup', () => {
    it('should destroy manager and clean up resources', () => {
      const adapter1 = createMockAdapter('wallet1');
      const adapter2 = createMockAdapter('wallet2');

      manager.register(adapter1);
      manager.register(adapter2);

      manager.destroy();

      expect(manager.getAllAdapters()).toHaveLength(0);
      expect(manager.getCurrentAdapter()).toBeNull();
    });

    it('should handle multiple destroy calls gracefully', () => {
      manager.register(mockAdapter);

      manager.destroy();
      manager.destroy(); // Should not throw error

      expect(manager.getAllAdapters()).toHaveLength(0);
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      manager.register(mockAdapter);
    });

    it('should handle connection errors', async () => {
      const error = new Error('Connection failed');
      mockAdapter.connect.mockRejectedValue(error);

      await expect(manager.connect('test-wallet')).rejects.toThrow(error);
      expect(manager.getCurrentAdapter()).toBeNull();
    });

    it('should call error handler on connection errors', async () => {
      const errorHandler = jest.fn();
      manager.config.onError = errorHandler;

      const error = new Error('Connection failed');
      mockAdapter.connect.mockRejectedValue(error);

      await expect(manager.connect('test-wallet')).rejects.toThrow();

      expect(errorHandler).toHaveBeenCalledWith(error);
    });
  });
});