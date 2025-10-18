/**
 * 错误处理系统测试
 */

import {
  WalletError,
  WalletNotInstalledError,
  WalletConnectionError,
  WalletDisconnectedError,
  NetworkError,
  SignatureError,
  TransactionError,
  TimeoutError,
  ConfigurationError,
  ErrorSeverity,
  ErrorHandlerManager,
  ErrorCode,
} from '../types';

describe('Error Classes', () => {
  describe('WalletError', () => {
    it('should create basic wallet error', () => {
      const error = new WalletError('Test error', 'TEST_ERROR');

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.name).toBe('WalletError');
      expect(error.severity).toBe(ErrorSeverity.MEDIUM);
      expect(error.context).toBeDefined();
      expect(error.context.timestamp).toBeGreaterThan(0);
      expect(error.context.retryable).toBe(false);
    });

    it('should create wallet error with custom severity', () => {
      const error = new WalletError(
        'Critical error',
        'CRITICAL_ERROR',
        undefined,
        undefined,
        ErrorSeverity.CRITICAL
      );

      expect(error.severity).toBe(ErrorSeverity.CRITICAL);
    });

    it('should create wallet error with context', () => {
      const context = {
        walletId: 'test-wallet',
        operation: 'connect',
        network: 'testnet' as const,
        address: 'test-address',
      };

      const error = new WalletError('Test error', 'TEST_ERROR', context);

      expect(error.context.walletId).toBe('test-wallet');
      expect(error.context.operation).toBe('connect');
      expect(error.context.network).toBe('testnet');
      expect(error.context.address).toBe('test-address');
    });

    it('should create wallet error with original error', () => {
      const originalError = new Error('Original error');
      const error = new WalletError(
        'Wrapped error',
        'WRAPPED_ERROR',
        undefined,
        originalError
      );

      expect(error.originalError).toBe(originalError);
    });

    it('should get full message', () => {
      const context = {
        walletId: 'test-wallet',
        operation: 'connect',
        network: 'testnet' as const,
        suggestion: 'Try again',
      };

      const error = new WalletError('Test error', 'TEST_ERROR', context);
      const fullMessage = error.getFullMessage();

      expect(fullMessage).toContain('Test error');
      expect(fullMessage).toContain('Wallet: test-wallet');
      expect(fullMessage).toContain('Operation: connect');
      expect(fullMessage).toContain('Network: testnet');
      expect(fullMessage).toContain('Suggestion: Try again');
    });

    it('should serialize to JSON', () => {
      const originalError = new Error('Original error');
      const error = new WalletError(
        'Test error',
        'TEST_ERROR',
        { walletId: 'test-wallet' },
        originalError
      );

      const json = error.toJSON();

      expect(json.name).toBe('WalletError');
      expect(json.message).toBe('Test error');
      expect(json.code).toBe('TEST_ERROR');
      expect(json.severity).toBe(ErrorSeverity.MEDIUM);
      expect(json.context.walletId).toBe('test-wallet');
      expect(json.originalError).toBeDefined();
      expect(json.originalError.name).toBe('Error');
      expect(json.originalError.message).toBe('Original error');
    });
  });

  describe('WalletNotInstalledError', () => {
    it('should create not installed error', () => {
      const error = new WalletNotInstalledError('unisat');

      expect(error.message).toBe('Wallet unisat is not installed or not available');
      expect(error.code).toBe('WALLET_NOT_INSTALLED');
      expect(error.name).toBe('WalletNotInstalledError');
      expect(error.severity).toBe(ErrorSeverity.HIGH);
      expect(error.context.walletId).toBe('unisat');
      expect(error.context.operation).toBe('wallet_check');
      expect(error.context.retryable).toBe(false);
      expect(error.context.suggestion).toContain('install unisat wallet');
    });

    it('should create not installed error with custom context', () => {
      const context = { network: 'testnet' as const };
      const error = new WalletNotInstalledError('unisat', context);

      expect(error.context.network).toBe('testnet');
    });
  });

  describe('WalletConnectionError', () => {
    it('should create connection error', () => {
      const error = new WalletConnectionError('unisat', 'Connection failed');

      expect(error.message).toBe('Failed to connect to unisat: Connection failed');
      expect(error.code).toBe('WALLET_CONNECTION_ERROR');
      expect(error.name).toBe('WalletConnectionError');
      expect(error.severity).toBe(ErrorSeverity.HIGH);
      expect(error.context.walletId).toBe('unisat');
      expect(error.context.operation).toBe('connect');
      expect(error.context.retryable).toBe(true);
      expect(error.context.suggestion).toContain('try connecting again');
    });

    it('should create connection error with original error', () => {
      const originalError = new Error('Network error');
      const error = new WalletConnectionError(
        'unisat',
        'Connection failed',
        undefined,
        originalError
      );

      expect(error.originalError).toBe(originalError);
    });
  });

  describe('WalletDisconnectedError', () => {
    it('should create disconnected error', () => {
      const error = new WalletDisconnectedError('unisat');

      expect(error.message).toBe('Wallet unisat is disconnected');
      expect(error.code).toBe('WALLET_DISCONNECTED');
      expect(error.name).toBe('WalletDisconnectedError');
      expect(error.severity).toBe(ErrorSeverity.MEDIUM);
      expect(error.context.walletId).toBe('unisat');
      expect(error.context.operation).toBe('disconnect');
      expect(error.context.retryable).toBe(false);
      expect(error.context.suggestion).toContain('reconnect your wallet');
    });
  });

  describe('NetworkError', () => {
    it('should create network error', () => {
      const error = new NetworkError('Network unavailable');

      expect(error.message).toBe('Network error: Network unavailable');
      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.name).toBe('NetworkError');
      expect(error.severity).toBe(ErrorSeverity.MEDIUM);
      expect(error.context.operation).toBe('network');
      expect(error.context.retryable).toBe(true);
      expect(error.context.suggestion).toContain('check your network connection');
    });

    it('should create network error with network', () => {
      const error = new NetworkError('Invalid network', 'testnet');

      expect(error.context.network).toBe('testnet');
    });
  });

  describe('SignatureError', () => {
    it('should create signature error', () => {
      const error = new SignatureError('Invalid signature');

      expect(error.message).toBe('Signature error: Invalid signature');
      expect(error.code).toBe('SIGNATURE_ERROR');
      expect(error.name).toBe('SignatureError');
      expect(error.severity).toBe(ErrorSeverity.HIGH);
      expect(error.context.operation).toBe('sign');
      expect(error.context.retryable).toBe(false);
      expect(error.context.suggestion).toContain('check the message format');
    });
  });

  describe('TransactionError', () => {
    it('should create transaction error', () => {
      const error = new TransactionError('Insufficient funds');

      expect(error.message).toBe('Transaction error: Insufficient funds');
      expect(error.code).toBe('TRANSACTION_ERROR');
      expect(error.name).toBe('TransactionError');
      expect(error.severity).toBe(ErrorSeverity.HIGH);
      expect(error.context.operation).toBe('transaction');
      expect(error.context.retryable).toBe(true);
      expect(error.context.suggestion).toContain('check the transaction details');
    });

    it('should create transaction error with txid', () => {
      const error = new TransactionError('Transaction failed', 'tx123');

      expect(error.message).toBe('Transaction error: Transaction failed');
      expect(error.code).toBe('TRANSACTION_ERROR');
      // Note: txid is stored in the context but not shown in getFullMessage
      expect(error.context.operation).toBe('transaction');
    });
  });

  describe('TimeoutError', () => {
    it('should create timeout error', () => {
      const error = new TimeoutError('connect', 5000);

      expect(error.message).toBe('Operation timeout: connect took longer than 5000ms');
      expect(error.code).toBe('TIMEOUT_ERROR');
      expect(error.name).toBe('TimeoutError');
      expect(error.severity).toBe(ErrorSeverity.MEDIUM);
      expect(error.context.operation).toBe('connect');
      expect(error.context.retryable).toBe(true);
      expect(error.context.suggestion).toContain('try again');
    });
  });

  describe('ConfigurationError', () => {
    it('should create configuration error', () => {
      const error = new ConfigurationError('Invalid config');

      expect(error.message).toBe('Configuration error: Invalid config');
      expect(error.code).toBe('CONFIGURATION_ERROR');
      expect(error.name).toBe('ConfigurationError');
      expect(error.severity).toBe(ErrorSeverity.CRITICAL);
      expect(error.context.operation).toBe('configuration');
      expect(error.context.retryable).toBe(false);
      expect(error.context.suggestion).toContain('check your wallet configuration');
    });
  });
});

describe('ErrorHandlerManager', () => {
  let manager: ErrorHandlerManager;

  beforeEach(() => {
    manager = new ErrorHandlerManager();
  });

  describe('handler registration', () => {
    it('should register error handler', () => {
      const handler = jest.fn();

      manager.register('TEST_ERROR', handler);

      expect(() => {
        manager.handleError(new WalletError('Test error', 'TEST_ERROR'));
      }).not.toThrow();
    });

    it('should register multiple handlers for same error code', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      manager.register('TEST_ERROR', handler1);
      manager.register('TEST_ERROR', handler2);

      const error = new WalletError('Test error', 'TEST_ERROR');
      manager.handleError(error);

      expect(handler1).toHaveBeenCalledWith(error);
      expect(handler2).toHaveBeenCalledWith(error);
    });

    it('should unregister error handler', () => {
      const handler = jest.fn();

      manager.register('TEST_ERROR', handler);
      manager.unregister('TEST_ERROR', handler);

      const error = new WalletError('Test error', 'TEST_ERROR');
      manager.handleError(error);

      expect(handler).not.toHaveBeenCalled();
    });

    it('should handle unregistering non-existent handler gracefully', () => {
      const handler = jest.fn();

      expect(() => {
        manager.unregister('TEST_ERROR', handler);
      }).not.toThrow();
    });
  });

  describe('error handling', () => {
    it('should call registered handler for matching error code', () => {
      const handler = jest.fn();
      manager.register('TEST_ERROR', handler);

      const error = new WalletError('Test error', 'TEST_ERROR');
      manager.handleError(error);

      expect(handler).toHaveBeenCalledWith(error);
    });

    it('should not call handler for non-matching error code', () => {
      const handler = jest.fn();
      manager.register('OTHER_ERROR', handler);

      const error = new WalletError('Test error', 'TEST_ERROR');
      manager.handleError(error);

      expect(handler).not.toHaveBeenCalled();
    });

    it('should handle errors in error handlers gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const faultyHandler = jest.fn(() => {
        throw new Error('Handler error');
      });

      manager.register('TEST_ERROR', faultyHandler);

      const error = new WalletError('Test error', 'TEST_ERROR');

      expect(() => {
        manager.handleError(error);
      }).not.toThrow();

      expect(faultyHandler).toHaveBeenCalledWith(error);
      expect(consoleSpy).toHaveBeenCalledWith('Error in error handler:', expect.any(Error));
      expect(consoleSpy).toHaveBeenCalledWith('Wallet Error:', error.getFullMessage());

      consoleSpy.mockRestore();
    });

    it('should log error to console by default', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const error = new WalletError('Test error', 'TEST_ERROR');
      manager.handleError(error);

      expect(consoleSpy).toHaveBeenCalledWith('Wallet Error:', error.getFullMessage());

      consoleSpy.mockRestore();
    });

    it('should log detailed error info in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const error = new WalletError('Test error', 'TEST_ERROR');
      manager.handleError(error);

      expect(consoleSpy).toHaveBeenCalledWith('Error details:', error.toJSON());

      process.env.NODE_ENV = originalEnv;
      consoleSpy.mockRestore();
    });
  });

  describe('edge cases', () => {
    it('should handle error with no handlers registered', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const error = new WalletError('Test error', 'TEST_ERROR');

      expect(() => {
        manager.handleError(error);
      }).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith('Wallet Error:', error.getFullMessage());

      consoleSpy.mockRestore();
    });

    it('should handle multiple error types', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      manager.register('WALLET_NOT_INSTALLED', handler1);
      manager.register('NETWORK_ERROR', handler2);

      const error1 = new WalletNotInstalledError('unisat');
      const error2 = new NetworkError('Network down');

      manager.handleError(error1);
      manager.handleError(error2);

      expect(handler1).toHaveBeenCalledWith(error1);
      expect(handler2).toHaveBeenCalledWith(error2);
      expect(handler1).not.toHaveBeenCalledWith(error2);
      expect(handler2).not.toHaveBeenCalledWith(error1);
    });
  });
});

describe('ErrorCode enum', () => {
  it('should contain all expected error codes', () => {
    expect(ErrorCode.UNKNOWN_ERROR).toBe('UNKNOWN_ERROR');
    expect(ErrorCode.INVALID_ARGUMENT).toBe('INVALID_ARGUMENT');
    expect(ErrorCode.WALLET_NOT_INSTALLED).toBe('WALLET_NOT_INSTALLED');
    expect(ErrorCode.WALLET_CONNECTION_ERROR).toBe('WALLET_CONNECTION_ERROR');
    expect(ErrorCode.WALLET_DISCONNECTED).toBe('WALLET_DISCONNECTED');
    expect(ErrorCode.NETWORK_ERROR).toBe('NETWORK_ERROR');
    expect(ErrorCode.UNSUPPORTED_NETWORK).toBe('UNSUPPORTED_NETWORK');
    expect(ErrorCode.NETWORK_SWITCH_FAILED).toBe('NETWORK_SWITCH_FAILED');
    expect(ErrorCode.SIGNATURE_ERROR).toBe('SIGNATURE_ERROR');
    expect(ErrorCode.TRANSACTION_ERROR).toBe('TRANSACTION_ERROR');
    expect(ErrorCode.TIMEOUT_ERROR).toBe('TIMEOUT_ERROR');
    expect(ErrorCode.CONFIGURATION_ERROR).toBe('CONFIGURATION_ERROR');
    expect(ErrorCode.INSUFFICIENT_FUNDS).toBe('INSUFFICIENT_FUNDS');
    expect(ErrorCode.INVALID_ADDRESS).toBe('INVALID_ADDRESS');
  });
});

describe('ErrorSeverity enum', () => {
  it('should contain all expected severity levels', () => {
    expect(ErrorSeverity.LOW).toBe('low');
    expect(ErrorSeverity.MEDIUM).toBe('medium');
    expect(ErrorSeverity.HIGH).toBe('high');
    expect(ErrorSeverity.CRITICAL).toBe('critical');
  });
});