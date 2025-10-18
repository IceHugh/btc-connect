/**
 * 事件系统测试
 */

import { EventEmitter, WalletEventManager } from '../events';
import type { WalletEvent, AccountInfo } from '../types';

describe('EventEmitter', () => {
  let emitter: EventEmitter;

  beforeEach(() => {
    emitter = new EventEmitter();
  });

  describe('basic event handling', () => {
    it('should add and trigger event listener', () => {
      const handler = jest.fn();

      emitter.on('connect', handler);
      emitter.emit('connect', { walletId: 'test', accounts: [] });

      expect(handler).toHaveBeenCalledWith({ walletId: 'test', accounts: [] });
    });

    it('should remove event listener', () => {
      const handler = jest.fn();

      emitter.on('connect', handler);
      emitter.off('connect', handler);
      emitter.emit('connect', { walletId: 'test', accounts: [] });

      expect(handler).not.toHaveBeenCalled();
    });

    it('should trigger multiple listeners for same event', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      emitter.on('connect', handler1);
      emitter.on('connect', handler2);
      emitter.emit('connect', { walletId: 'test', accounts: [] });

      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });

    it('should handle listeners for different events', () => {
      const connectHandler = jest.fn();
      const disconnectHandler = jest.fn();

      emitter.on('connect', connectHandler);
      emitter.on('disconnect', disconnectHandler);

      emitter.emit('connect', { walletId: 'test', accounts: [] });
      emitter.emit('disconnect', { walletId: 'test' });

      expect(connectHandler).toHaveBeenCalledTimes(1);
      expect(disconnectHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('once listeners', () => {
    it('should trigger once listener only once', () => {
      const handler = jest.fn();

      emitter.once('connect', handler);
      emitter.emit('connect', { walletId: 'test', accounts: [] });
      emitter.emit('connect', { walletId: 'test', accounts: [] });

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should remove once listener after execution', () => {
      const handler = jest.fn();

      emitter.once('connect', handler);
      emitter.emit('connect', { walletId: 'test', accounts: [] });

      expect(emitter.listenerCount('connect')).toBe(0);
    });

    it('should handle multiple once listeners', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      emitter.once('connect', handler1);
      emitter.once('connect', handler2);
      emitter.emit('connect', { walletId: 'test', accounts: [] });

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    it('should not affect regular listeners when removing once listeners', () => {
      const onceHandler = jest.fn();
      const regularHandler = jest.fn();

      emitter.once('connect', onceHandler);
      emitter.on('connect', regularHandler);

      emitter.emit('connect', { walletId: 'test', accounts: [] });
      emitter.emit('connect', { walletId: 'test', accounts: [] });

      expect(onceHandler).toHaveBeenCalledTimes(1);
      expect(regularHandler).toHaveBeenCalledTimes(2);
    });
  });

  describe('listener management', () => {
    it('should return correct listener count', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      expect(emitter.listenerCount('connect')).toBe(0);

      emitter.on('connect', handler1);
      expect(emitter.listenerCount('connect')).toBe(1);

      emitter.on('connect', handler2);
      expect(emitter.listenerCount('connect')).toBe(2);

      emitter.off('connect', handler1);
      expect(emitter.listenerCount('connect')).toBe(1);
    });

    it('should return all event names', () => {
      emitter.on('connect', jest.fn());
      emitter.on('disconnect', jest.fn());
      emitter.on('error', jest.fn());

      const eventNames = emitter.eventNames();

      expect(eventNames).toContain('connect');
      expect(eventNames).toContain('disconnect');
      expect(eventNames).toContain('error');
      expect(eventNames).toHaveLength(3);
    });

    it('should remove all listeners for specific event', () => {
      const connectHandler = jest.fn();
      const disconnectHandler = jest.fn();

      emitter.on('connect', connectHandler);
      emitter.on('disconnect', disconnectHandler);

      emitter.removeAllListeners('connect');

      expect(emitter.listenerCount('connect')).toBe(0);
      expect(emitter.listenerCount('disconnect')).toBe(1);

      emitter.emit('connect', { walletId: 'test', accounts: [] });
      emitter.emit('disconnect', { walletId: 'test' });

      expect(connectHandler).not.toHaveBeenCalled();
      expect(disconnectHandler).toHaveBeenCalled();
    });

    it('should remove all listeners for all events', () => {
      emitter.on('connect', jest.fn());
      emitter.on('disconnect', jest.fn());
      emitter.on('error', jest.fn());

      emitter.removeAllListeners();

      expect(emitter.eventNames()).toHaveLength(0);
    });

    it('should handle removing non-existent event gracefully', () => {
      expect(() => {
        emitter.removeAllListeners('nonexistent');
      }).not.toThrow();
    });
  });

  describe('max listeners', () => {
    it('should set and get max listeners', () => {
      expect(emitter.getMaxListeners()).toBe(100);

      emitter.setMaxListeners(50);
      expect(emitter.getMaxListeners()).toBe(50);
    });

    it('should warn when exceeding max listeners', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      emitter.setMaxListeners(2);

      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const handler3 = jest.fn();

      emitter.on('connect', handler1);
      emitter.on('connect', handler2);
      emitter.on('connect', handler3); // Should trigger warning

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Possible memory leak detected')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('error handling', () => {
    it('should handle errors in listeners gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const errorHandler = jest.fn(() => {
        throw new Error('Listener error');
      });

      emitter.on('connect', errorHandler);
      emitter.emit('connect', { walletId: 'test', accounts: [] });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error in event listener for connect:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should continue executing other listeners when one fails', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const faultyHandler = jest.fn(() => {
        throw new Error('Listener error');
      });
      const normalHandler = jest.fn();

      emitter.on('connect', faultyHandler);
      emitter.on('connect', normalHandler);
      emitter.emit('connect', { walletId: 'test', accounts: [] });

      expect(faultyHandler).toHaveBeenCalled();
      expect(normalHandler).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should return false when emitting to no listeners', () => {
      const result = emitter.emit('connect', { walletId: 'test', accounts: [] });

      expect(result).toBe(false);
    });

    it('should return true when emitting to listeners', () => {
      emitter.on('connect', jest.fn());
      const result = emitter.emit('connect', { walletId: 'test', accounts: [] });

      expect(result).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle removing non-existent listener gracefully', () => {
      const handler = jest.fn();

      expect(() => {
        emitter.off('connect', handler);
      }).not.toThrow();
    });

    it('should handle removing listener from empty event gracefully', () => {
      const handler = jest.fn();

      expect(() => {
        emitter.off('connect', handler);
      }).not.toThrow();
    });

    it('should prevent modification of listeners array during emit', () => {
      const handler1 = jest.fn(() => {
        emitter.off('connect', handler2);
      });
      const handler2 = jest.fn();

      emitter.on('connect', handler1);
      emitter.on('connect', handler2);

      emitter.emit('connect', { walletId: 'test', accounts: [] });

      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled(); // Should still be called due to array copy
    });
  });
});

describe('WalletEventManager', () => {
  let manager: WalletEventManager;
  let mockAccounts: AccountInfo[];

  beforeEach(() => {
    manager = new WalletEventManager();
    mockAccounts = [
      {
        address: 'tb1qexample1234567890abcdef',
        publicKey: '02abcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678',
        balance: { confirmed: 100000, unconfirmed: 0, total: 100000 },
        network: 'testnet',
      },
    ];
  });

  afterEach(() => {
    manager.destroy();
  });

  describe('connect events', () => {
    it('should emit connect event with params', () => {
      const handler = jest.fn();

      manager.on('connect', handler);
      const result = manager.emitConnect('test-wallet', mockAccounts);

      expect(result).toBe(true);
      expect(handler).toHaveBeenCalledWith({ walletId: 'test-wallet', accounts: mockAccounts });
    });

    it('should emit legacy connect event', () => {
      const handler = jest.fn();

      manager.on('connect', handler);
      const result = manager.emitConnectLegacy(mockAccounts);

      expect(result).toBe(true);
      expect(handler).toHaveBeenCalledWith(mockAccounts);
    });

    it('should not emit connect event after destroy', () => {
      const handler = jest.fn();

      manager.on('connect', handler);
      manager.destroy();

      const result = manager.emitConnect('test-wallet', mockAccounts);

      expect(result).toBe(false);
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('disconnect events', () => {
    it('should emit disconnect event with params', () => {
      const handler = jest.fn();

      manager.on('disconnect', handler);
      const result = manager.emitDisconnect('test-wallet');

      expect(result).toBe(true);
      expect(handler).toHaveBeenCalledWith({ walletId: 'test-wallet' });
    });

    it('should emit legacy disconnect event', () => {
      const handler = jest.fn();

      manager.on('disconnect', handler);
      const result = manager.emitDisconnectLegacy();

      expect(result).toBe(true);
      expect(handler).toHaveBeenCalledWith(undefined);
    });

    it('should not emit disconnect event after destroy', () => {
      const handler = jest.fn();

      manager.on('disconnect', handler);
      manager.destroy();

      const result = manager.emitDisconnect('test-wallet');

      expect(result).toBe(false);
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('account change events', () => {
    it('should emit account change event with params', () => {
      const handler = jest.fn();

      manager.on('accountChange', handler);
      const result = manager.emitAccountChange('test-wallet', mockAccounts);

      expect(result).toBe(true);
      expect(handler).toHaveBeenCalledWith({ walletId: 'test-wallet', accounts: mockAccounts });
    });

    it('should emit legacy account change event', () => {
      const handler = jest.fn();

      manager.on('accountChange', handler);
      const result = manager.emitAccountChangeLegacy(mockAccounts);

      expect(result).toBe(true);
      expect(handler).toHaveBeenCalledWith(mockAccounts);
    });

    it('should not emit account change event after destroy', () => {
      const handler = jest.fn();

      manager.on('accountChange', handler);
      manager.destroy();

      const result = manager.emitAccountChange('test-wallet', mockAccounts);

      expect(result).toBe(false);
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('network change events', () => {
    it('should emit network change event with params', () => {
      const handler = jest.fn();

      manager.on('networkChange', handler);
      const result = manager.emitNetworkChange('test-wallet', 'testnet');

      expect(result).toBe(true);
      expect(handler).toHaveBeenCalledWith({ walletId: 'test-wallet', network: 'testnet' });
    });

    it('should emit legacy network change event', () => {
      const handler = jest.fn();

      manager.on('networkChange', handler);
      const result = manager.emitNetworkChangeLegacy('testnet');

      expect(result).toBe(true);
      expect(handler).toHaveBeenCalledWith('testnet');
    });

    it('should not emit network change event after destroy', () => {
      const handler = jest.fn();

      manager.on('networkChange', handler);
      manager.destroy();

      const result = manager.emitNetworkChange('test-wallet', 'testnet');

      expect(result).toBe(false);
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('error events', () => {
    it('should emit error event with params', () => {
      const handler = jest.fn();
      const error = new Error('Test error');

      manager.on('error', handler);
      const result = manager.emitError('test-wallet', error);

      expect(result).toBe(true);
      expect(handler).toHaveBeenCalledWith({ walletId: 'test-wallet', error });
    });

    it('should emit legacy error event', () => {
      const handler = jest.fn();
      const error = new Error('Test error');

      manager.on('error', handler);
      const result = manager.emitErrorLegacy(error);

      expect(result).toBe(true);
      expect(handler).toHaveBeenCalledWith(error);
    });

    it('should not emit error event after destroy', () => {
      const handler = jest.fn();
      const error = new Error('Test error');

      manager.on('error', handler);
      manager.destroy();

      const result = manager.emitError('test-wallet', error);

      expect(result).toBe(false);
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('destroy functionality', () => {
    it('should remove all listeners when destroyed', () => {
      manager.on('connect', jest.fn());
      manager.on('disconnect', jest.fn());
      manager.on('error', jest.fn());

      expect(manager.eventNames()).toHaveLength(3);

      manager.destroy();

      expect(manager.eventNames()).toHaveLength(0);
    });

    it('should handle multiple destroy calls gracefully', () => {
      manager.on('connect', jest.fn());

      manager.destroy();
      manager.destroy(); // Should not throw error

      expect(manager.eventNames()).toHaveLength(0);
    });

    it('should prevent event emission after destroy', () => {
      const handler = jest.fn();

      manager.on('connect', handler);
      manager.destroy();

      // All emit methods should return false
      expect(manager.emitConnect('test-wallet', mockAccounts)).toBe(false);
      expect(manager.emitDisconnect('test-wallet')).toBe(false);
      expect(manager.emitAccountChange('test-wallet', mockAccounts)).toBe(false);
      expect(manager.emitNetworkChange('test-wallet', 'testnet')).toBe(false);
      expect(manager.emitError('test-wallet', new Error('test'))).toBe(false);

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('inheritance from EventEmitter', () => {
    it('should inherit EventEmitter functionality', () => {
      const handler = jest.fn();

      // Should have all EventEmitter methods
      expect(typeof manager.on).toBe('function');
      expect(typeof manager.off).toBe('function');
      expect(typeof manager.once).toBe('function');
      expect(typeof manager.emit).toBe('function');
      expect(typeof manager.removeAllListeners).toBe('function');
      expect(typeof manager.listenerCount).toBe('function');
      expect(typeof manager.eventNames).toBe('function');

      // Should work like EventEmitter
      manager.on('connect', handler);
      manager.emit('connect', { walletId: 'test', accounts: mockAccounts });

      expect(handler).toHaveBeenCalledWith({ walletId: 'test', accounts: mockAccounts });
    });

    it('should handle custom events through EventEmitter interface', () => {
      const handler = jest.fn();

      manager.on('custom-event', handler);
      const result = manager.emit('custom-event', 'custom-data');

      expect(result).toBe(true);
      expect(handler).toHaveBeenCalledWith('custom-data');
    });
  });
});