/**
 * 错误处理工具类
 */

import type { Network } from '../types';
import {
  ConfigurationError,
  ErrorCode,
  type ErrorContext,
  ErrorHandlerManager,
  ErrorSeverity,
  NetworkError,
  SignatureError,
  TimeoutError,
  TransactionError,
  WalletConnectionError,
  WalletDisconnectedError,
  WalletError,
  WalletNotInstalledError,
} from '../types';

// 错误处理工具类
export class WalletErrorHandler {
  private static instance: WalletErrorHandler;
  private errorManager: ErrorHandlerManager;

  private constructor() {
    this.errorManager = new ErrorHandlerManager();
    this.setupDefaultHandlers();
  }

  /**
   * 获取单例实例
   */
  static getInstance(): WalletErrorHandler {
    if (!WalletErrorHandler.instance) {
      WalletErrorHandler.instance = new WalletErrorHandler();
    }
    return WalletErrorHandler.instance;
  }

  /**
   * 设置默认错误处理器
   */
  private setupDefaultHandlers(): void {
    // 为高严重性错误添加特殊处理
    this.errorManager.register(ErrorCode.WALLET_NOT_INSTALLED, (error) => {
      console.warn('Wallet installation required:', error.context.suggestion);
    });

    this.errorManager.register(ErrorCode.CONFIGURATION_ERROR, (error) => {
      console.error('Critical configuration error:', error.getFullMessage());
    });
  }

  /**
   * 创建钱包未安装错误
   */
  static createWalletNotInstalledError(
    walletId: string,
    context?: Partial<ErrorContext>,
  ): WalletNotInstalledError {
    return new WalletNotInstalledError(walletId, {
      userAgent:
        typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      ...context,
    });
  }

  /**
   * 创建连接错误
   */
  static createConnectionError(
    walletId: string,
    message: string,
    originalError?: Error,
    context?: Partial<ErrorContext>,
  ): WalletConnectionError {
    return new WalletConnectionError(walletId, message, context, originalError);
  }

  /**
   * 创建断开连接错误
   */
  static createDisconnectedError(
    walletId: string,
    context?: Partial<ErrorContext>,
  ): WalletDisconnectedError {
    return new WalletDisconnectedError(walletId, context);
  }

  /**
   * 创建网络错误
   */
  static createNetworkError(
    message: string,
    network?: Network,
    originalError?: Error,
    context?: Partial<ErrorContext>,
  ): NetworkError {
    return new NetworkError(message, network, context, originalError);
  }

  /**
   * 创建签名错误
   */
  static createSignatureError(
    message: string,
    originalError?: Error,
    context?: Partial<ErrorContext>,
  ): SignatureError {
    return new SignatureError(message, context, originalError);
  }

  /**
   * 创建交易错误
   */
  static createTransactionError(
    message: string,
    txid?: string,
    originalError?: Error,
    context?: Partial<ErrorContext>,
  ): TransactionError {
    return new TransactionError(message, txid, context, originalError);
  }

  /**
   * 创建超时错误
   */
  static createTimeoutError(
    operation: string,
    timeout: number,
    context?: Partial<ErrorContext>,
  ): TimeoutError {
    return new TimeoutError(operation, timeout, context);
  }

  /**
   * 创建配置错误
   */
  static createConfigurationError(
    message: string,
    context?: Partial<ErrorContext>,
  ): ConfigurationError {
    return new ConfigurationError(message, context);
  }

  /**
   * 包装异步操作，添加超时处理
   */
  static async withTimeout<T>(
    operation: Promise<T>,
    timeoutMs: number,
    operationName: string,
    context?: Partial<ErrorContext>,
  ): Promise<T> {
    return Promise.race([
      operation,
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(
            WalletErrorHandler.createTimeoutError(
              operationName,
              timeoutMs,
              context,
            ),
          );
        }, timeoutMs);
      }),
    ]) as Promise<T>;
  }

  /**
   * 安全执行操作，统一错误处理
   */
  static async safeExecute<T>(
    operation: () => Promise<T>,
    errorFactory: (error: Error) => WalletError,
    _context?: Partial<ErrorContext>,
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const walletError =
        error instanceof WalletError
          ? error
          : errorFactory(
              error instanceof Error ? error : new Error(String(error)),
            );

      // 获取错误处理器实例并处理错误
      WalletErrorHandler.getInstance().errorManager.handleError(walletError);

      throw walletError;
    }
  }

  /**
   * 注册自定义错误处理器
   */
  static registerErrorHandler(
    errorCode: string,
    handler: (error: WalletError) => void,
  ): void {
    WalletErrorHandler.getInstance().errorManager.register(errorCode, handler);
  }

  /**
   * 移除错误处理器
   */
  static unregisterErrorHandler(
    errorCode: string,
    handler: (error: WalletError) => void,
  ): void {
    WalletErrorHandler.getInstance().errorManager.unregister(
      errorCode,
      handler,
    );
  }

  /**
   * 处理错误
   */
  static handleError(error: WalletError): void {
    WalletErrorHandler.getInstance().errorManager.handleError(error);
  }

  /**
   * 获取错误管理器
   */
  static getErrorHandlerManager(): ErrorHandlerManager {
    return WalletErrorHandler.getInstance().errorManager;
  }
}

// 错误恢复策略
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ErrorRecoveryStrategy {
  /**
   * 重试策略
   */
  static async retry<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3,
    delay: number = 1000,
    shouldRetry?: (error: WalletError) => boolean,
  ): Promise<T> {
    let lastError: WalletError;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError =
          error instanceof WalletError
            ? error
            : new WalletError(
                error instanceof Error ? error.message : String(error),
                ErrorCode.UNKNOWN_ERROR,
              );

        // 检查是否应该重试
        const canRetry = shouldRetry
          ? shouldRetry(lastError)
          : lastError.context.retryable;

        if (!canRetry || attempt === maxAttempts) {
          break;
        }

        // 等待后重试
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    throw lastError!;
  }

  /**
   * 降级策略
   */
  static async fallback<T>(
    primaryOperation: () => Promise<T>,
    fallbackOperation: () => Promise<T>,
    context?: Partial<ErrorContext>,
  ): Promise<T> {
    try {
      return await primaryOperation();
    } catch (error) {
      console.warn('Primary operation failed, trying fallback:', error);

      try {
        return await fallbackOperation();
      } catch (fallbackError) {
        // 如果降级操作也失败，抛出原始错误
        throw error instanceof WalletError
          ? error
          : new WalletError(
              fallbackError instanceof Error
                ? fallbackError.message
                : String(fallbackError),
              ErrorCode.UNKNOWN_ERROR,
              context,
            );
      }
    }
  }

  /**
   * 断路器模式
   */
  static async circuitBreaker<T>(
    operation: () => Promise<T>,
    failureThreshold: number = 3,
    _timeout: number = 60000, // 1分钟
    _context?: Partial<ErrorContext>,
  ): Promise<T> {
    // 这里可以实现更复杂的断路器逻辑
    // 为了简化，我们先使用基本的重试策略
    return ErrorRecoveryStrategy.retry(
      operation,
      failureThreshold,
      1000,
      (error) => {
        return error.severity === ErrorSeverity.CRITICAL;
      },
    );
  }
}

// 错误报告工具
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ErrorReporter {
  /**
   * 报告错误到监控服务
   */
  static reportError(
    error: WalletError,
    additionalInfo?: Record<string, any>,
  ): void {
    // 这里可以实现错误报告逻辑，如发送到监控服务
    if (process.env.NODE_ENV === 'production') {
      // 生产环境中上报错误
      console.error('Error reported:', {
        error: error.toJSON(),
        additionalInfo,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * 批量报告错误
   */
  static reportErrors(
    errors: WalletError[],
    additionalInfo?: Record<string, any>,
  ): void {
    errors.forEach((error) => ErrorReporter.reportError(error, additionalInfo));
  }
}
