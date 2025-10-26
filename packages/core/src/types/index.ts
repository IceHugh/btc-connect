export type Network = 'livenet' | 'testnet' | 'regtest' | 'mainnet';

export type WalletEvent =
  | 'connect'
  | 'disconnect'
  | 'accountChange'
  | 'networkChange'
  | 'error';

// 事件参数类型定义
export interface ConnectEventParams {
  walletId: string;
  accounts: AccountInfo[];
}

export interface DisconnectEventParams {
  walletId: string;
}

export interface AccountChangeEventParams {
  walletId: string;
  accounts: AccountInfo[];
}

export interface NetworkChangeEventParams {
  walletId: string;
  network: Network;
}

export interface ErrorEventParams {
  walletId?: string;
  error: WalletError;
}

// 事件处理器类型映射
export interface EventHandlerMap {
  connect: (params: ConnectEventParams) => void;
  disconnect: (params: DisconnectEventParams) => void;
  accountChange: (params: AccountChangeEventParams) => void;
  networkChange: (params: NetworkChangeEventParams) => void;
  error: (params: ErrorEventParams) => void;
}

// 统一的事件处理器类型
export type EventHandler<T extends WalletEvent> = EventHandlerMap[T];

// 钱包连接状态
export type ConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error';

// 钱包信息
export interface WalletInfo {
  id: string;
  name: string;
  icon: string;
  description?: string;
  homepage?: string;
}

// 余额详情
export interface BalanceDetail {
  confirmed: number; // 已确认余额（聪）
  unconfirmed: number; // 未确认余额（聪）
  total: number; // 总余额（聪）
}

// 钱包账户信息
export interface AccountInfo {
  address: string;
  publicKey?: string;
  balance?: BalanceDetail; // 统一使用详细余额
  network?: Network;
}

// 钱包状态
export interface WalletState {
  status: ConnectionStatus;
  accounts: AccountInfo[];
  currentAccount?: AccountInfo;
  network?: Network;
  error?: Error;
}

// 钱包适配器接口
export interface BTCWalletAdapter {
  // 基本信息
  readonly id: string;
  readonly name: string;
  readonly icon: string;

  // 状态检查
  isReady(): boolean;
  getState(): WalletState;

  // 连接管理
  connect(): Promise<AccountInfo[]>;
  disconnect(): Promise<void>;

  // 账户管理
  getAccounts(): Promise<AccountInfo[]>;
  getCurrentAccount(): Promise<AccountInfo | null>;

  // 网络管理
  getNetwork(): Promise<Network>;
  switchNetwork(network: Network): Promise<void>;

  // 事件监听 - 使用泛型确保类型安全
  on<T extends WalletEvent>(event: T, handler: EventHandler<T>): void;
  off<T extends WalletEvent>(event: T, handler: EventHandler<T>): void;

  // 签名相关
  signMessage(message: string): Promise<string>;
  signPsbt(psbt: string): Promise<string>;
  sendBitcoin(toAddress: string, amount: number): Promise<string>;
}

// 缓存配置
export interface CacheConfig {
  enabled: boolean;
  ttl: number; // 缓存时间（毫秒）
  maxSize: number; // 最大缓存条目数
}

// 默认缓存配置
export const DEFAULT_CACHE_CONFIG: Record<
  string,
  Omit<CacheConfig, 'enabled'>
> = {
  balance: { ttl: 10000, maxSize: 100 }, // 10秒
  network: { ttl: 60000, maxSize: 50 }, // 1分钟
  accounts: { ttl: 30000, maxSize: 50 }, // 30秒
  walletState: { ttl: 5000, maxSize: 20 }, // 5秒
};

// Modal配置接口
export interface ModalConfig {
  // z-index值配置
  zIndex?: number | 'auto' | 'max';
  // z-index策略
  strategy?: 'fixed' | 'dynamic' | 'custom';
}

// z-index策略类型
export type ZIndexStrategy = 'fixed' | 'dynamic' | 'custom';
export type ZIndexValue = number | 'auto' | 'max';

// 钱包管理器配置
export interface WalletManagerConfig {
  // 错误处理
  onError?: (error: Error) => void;
  // 状态变化回调
  onStateChange?: (state: WalletState) => void;
  // 缓存配置
  cache?: Partial<
    Record<
      keyof typeof DEFAULT_CACHE_CONFIG,
      Partial<Omit<CacheConfig, 'enabled'>>
    >
  >;
  // 是否启用缓存
  enableCache?: boolean;
  // Modal配置
  modalConfig?: ModalConfig;
}

// 钱包管理器接口
export interface WalletManager {
  // 配置
  config: WalletManagerConfig;

  // 钱包管理
  register(adapter: BTCWalletAdapter): void;
  unregister(walletId: string): void;
  getAdapter(walletId: string): BTCWalletAdapter | null;
  getAllAdapters(): BTCWalletAdapter[];
  getAvailableWallets(): WalletInfo[];

  // 连接管理
  connect(walletId: string): Promise<AccountInfo[]>;
  disconnect(): Promise<void>;
  switchWallet(walletId: string): Promise<AccountInfo[]>;
  // 网络管理
  switchNetwork(network: string): Promise<void>;
  // 采纳已授权会话为已连接（不触发授权弹窗）
  assumeConnected(walletId: string): Promise<AccountInfo[] | null>;

  // 状态获取
  getState(): WalletState;
  getCurrentAdapter(): BTCWalletAdapter | null;
  getCurrentWallet(): WalletInfo | null;

  // 事件监听 - 使用泛型确保类型安全
  on<T extends WalletEvent>(event: T, handler: EventHandler<T>): void;
  off<T extends WalletEvent>(event: T, handler: EventHandler<T>): void;

  // 销毁
  destroy(): void;
}

// 具体的事件处理器接口（保持向后兼容）
export type LegacyEventHandler = (...args: any[]) => void;

// 事件监听器接口
export interface EventListener {
  event: WalletEvent;
  handler: LegacyEventHandler;
}

// 错误严重级别
export enum ErrorSeverity {
  LOW = 'low', // 低级别错误，不影响核心功能
  MEDIUM = 'medium', // 中等级别错误，影响部分功能
  HIGH = 'high', // 高级别错误，影响核心功能
  CRITICAL = 'critical', // 严重错误，导致应用无法正常工作
}

// 错误上下文信息
export interface ErrorContext {
  walletId?: string;
  operation?: string;
  network?: Network;
  address?: string;
  timestamp: number;
  userAgent?: string;
  retryable?: boolean;
  suggestion?: string;
}

// 增强的钱包错误基类
export class WalletError extends Error {
  public readonly severity: ErrorSeverity;
  public readonly context: ErrorContext;
  public readonly originalError?: Error;

  constructor(
    message: string,
    public code: string,
    context?: Partial<ErrorContext>,
    originalError?: Error,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
  ) {
    super(message);
    this.name = 'WalletError';
    this.severity = severity;
    this.context = {
      timestamp: Date.now(),
      retryable: false,
      ...context,
    };
    this.originalError = originalError;
  }

  /**
   * 获取完整的错误信息
   */
  getFullMessage(): string {
    const parts = [this.message];

    if (this.context.walletId) {
      parts.push(`Wallet: ${this.context.walletId}`);
    }

    if (this.context.operation) {
      parts.push(`Operation: ${this.context.operation}`);
    }

    if (this.context.network) {
      parts.push(`Network: ${this.context.network}`);
    }

    if (this.context.suggestion) {
      parts.push(`Suggestion: ${this.context.suggestion}`);
    }

    return parts.join(' | ');
  }

  /**
   * 获取JSON序列化的错误信息
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      severity: this.severity,
      context: this.context,
      stack: this.stack,
      originalError: this.originalError
        ? {
            name: this.originalError.name,
            message: this.originalError.message,
            stack: this.originalError.stack,
          }
        : undefined,
    };
  }
}

// 钱包未安装错误
export class WalletNotInstalledError extends WalletError {
  constructor(walletId: string, context?: Partial<ErrorContext>) {
    super(
      `Wallet ${walletId} is not installed or not available`,
      'WALLET_NOT_INSTALLED',
      {
        walletId,
        operation: 'wallet_check',
        retryable: false,
        suggestion: `Please install ${walletId} wallet extension and refresh the page`,
        ...context,
      },
      undefined,
      ErrorSeverity.HIGH,
    );
    this.name = 'WalletNotInstalledError';
  }
}

// 钱包连接错误
export class WalletConnectionError extends WalletError {
  constructor(
    walletId: string,
    message: string,
    context?: Partial<ErrorContext>,
    originalError?: Error,
  ) {
    super(
      `Failed to connect to ${walletId}: ${message}`,
      'WALLET_CONNECTION_ERROR',
      {
        walletId,
        operation: 'connect',
        retryable: true,
        suggestion: 'Please try connecting again or check your wallet settings',
        ...context,
      },
      originalError,
      ErrorSeverity.HIGH,
    );
    this.name = 'WalletConnectionError';
  }
}

// 钱包断开连接错误
export class WalletDisconnectedError extends WalletError {
  constructor(walletId: string, context?: Partial<ErrorContext>) {
    super(
      `Wallet ${walletId} is disconnected`,
      'WALLET_DISCONNECTED',
      {
        walletId,
        operation: 'disconnect',
        retryable: false,
        suggestion: 'Please reconnect your wallet to continue',
        ...context,
      },
      undefined,
      ErrorSeverity.MEDIUM,
    );
    this.name = 'WalletDisconnectedError';
  }
}

// 网络错误
export class NetworkError extends WalletError {
  constructor(
    message: string,
    network?: Network,
    context?: Partial<ErrorContext>,
    originalError?: Error,
  ) {
    super(
      `Network error: ${message}`,
      'NETWORK_ERROR',
      {
        network,
        operation: 'network',
        retryable: true,
        suggestion:
          'Please check your network connection or try switching networks',
        ...context,
      },
      originalError,
      ErrorSeverity.MEDIUM,
    );
    this.name = 'NetworkError';
  }
}

// 签名错误
export class SignatureError extends WalletError {
  constructor(
    message: string,
    context?: Partial<ErrorContext>,
    originalError?: Error,
  ) {
    super(
      `Signature error: ${message}`,
      'SIGNATURE_ERROR',
      {
        operation: 'sign',
        retryable: false,
        suggestion: 'Please check the message format and try again',
        ...context,
      },
      originalError,
      ErrorSeverity.HIGH,
    );
    this.name = 'SignatureError';
  }
}

// 交易错误
export class TransactionError extends WalletError {
  constructor(
    message: string,
    _txid?: string,
    context?: Partial<ErrorContext>,
    originalError?: Error,
  ) {
    super(
      `Transaction error: ${message}`,
      'TRANSACTION_ERROR',
      {
        operation: 'transaction',
        retryable: true,
        suggestion: 'Please check the transaction details and try again',
        ...context,
      },
      originalError,
      ErrorSeverity.HIGH,
    );
    this.name = 'TransactionError';
  }
}

// 超时错误
export class TimeoutError extends WalletError {
  constructor(
    operation: string,
    timeout: number,
    context?: Partial<ErrorContext>,
  ) {
    super(
      `Operation timeout: ${operation} took longer than ${timeout}ms`,
      'TIMEOUT_ERROR',
      {
        operation,
        retryable: true,
        suggestion: `Please try again or check your network connection`,
        ...context,
      },
      undefined,
      ErrorSeverity.MEDIUM,
    );
    this.name = 'TimeoutError';
  }
}

// 配置错误
export class ConfigurationError extends WalletError {
  constructor(message: string, context?: Partial<ErrorContext>) {
    super(
      `Configuration error: ${message}`,
      'CONFIGURATION_ERROR',
      {
        operation: 'configuration',
        retryable: false,
        suggestion: 'Please check your wallet configuration',
        ...context,
      },
      undefined,
      ErrorSeverity.CRITICAL,
    );
    this.name = 'ConfigurationError';
  }
}

// 错误代码枚举
export enum ErrorCode {
  // 通用错误
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INVALID_ARGUMENT = 'INVALID_ARGUMENT',

  // 钱包相关错误
  WALLET_NOT_INSTALLED = 'WALLET_NOT_INSTALLED',
  WALLET_CONNECTION_ERROR = 'WALLET_CONNECTION_ERROR',
  WALLET_DISCONNECTED = 'WALLET_DISCONNECTED',

  // 网络相关错误
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNSUPPORTED_NETWORK = 'UNSUPPORTED_NETWORK',
  NETWORK_SWITCH_FAILED = 'NETWORK_SWITCH_FAILED',

  // 操作相关错误
  SIGNATURE_ERROR = 'SIGNATURE_ERROR',
  TRANSACTION_ERROR = 'TRANSACTION_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',

  // 配置相关错误
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  INVALID_ADDRESS = 'INVALID_ADDRESS',
}

// 错误处理器接口
export type ErrorHandler = (error: WalletError) => void;

// 错误处理器管理器
export class ErrorHandlerManager {
  private handlers: Map<string, ErrorHandler[]> = new Map();

  /**
   * 注册错误处理器
   */
  register(errorCode: string, handler: ErrorHandler): void {
    if (!this.handlers.has(errorCode)) {
      this.handlers.set(errorCode, []);
    }
    this.handlers.get(errorCode)?.push(handler);
  }

  /**
   * 移除错误处理器
   */
  unregister(errorCode: string, handler: ErrorHandler): void {
    const handlers = this.handlers.get(errorCode);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * 处理错误
   */
  handleError(error: WalletError): void {
    const handlers = this.handlers.get(error.code);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(error);
        } catch (handlerError) {
          console.error('Error in error handler:', handlerError);
        }
      });
    }

    // 默认错误处理
    console.error('Wallet Error:', error.getFullMessage());

    // 在开发环境中输出详细错误信息
    if (process.env.NODE_ENV === 'development') {
      console.error('Error details:', error.toJSON());
    }
  }
}

// 交易输入
export interface TransactionInput {
  txid: string;
  vout: number;
  scriptSig?: string;
  scriptPubKey?: string;
  sequence?: number;
  address?: string;
  value?: number;
}

// 交易输出
export interface TransactionOutput {
  scriptPubKey: string;
  address?: string;
  value: number;
}

// 交易相关类型
export interface BitcoinTransaction {
  txid: string;
  raw: string;
  inputs: TransactionInput[];
  outputs: TransactionOutput[];
  fee: number;
  size?: number;
  version?: number;
  locktime?: number;
}

// PSBT 输入
export interface PSBTInput {
  txid: string;
  vout: number;
  scriptSig?: string;
  redeemScript?: string;
  witnessScript?: string;
  sighashType?: number;
  partialSig?: {
    pubkey: string;
    signature: string;
  }[];
}

// PSBT 输出
export interface PSBTOutput {
  scriptPubKey: string;
  redeemScript?: string;
  witnessScript?: string;
}

// PSBT 相关类型
export interface PSBTInfo {
  psbt: string;
  inputs: PSBTInput[];
  outputs: PSBTOutput[];
  fee: number;
  version?: number;
  locktime?: number;
  txVersion?: number;
}

// Unisat 特定类型
export interface UniSatInscription {
  inscriptionId: string;
  inscriptionNumber: string;
  address: string;
  outputValue: string;
  content: string;
  contentLength: string;
  contentType: string;
  preview: string;
  timestamp: number;
  offset: number;
  genesisTransaction: string;
  location: string;
  output: string;
}

export interface UniSatInscriptionsResponse {
  total: number;
  list: UniSatInscription[];
}

export interface UniSatBalance {
  confirmed: number;
  unconfirmed: number;
  total: number;
}

export interface UniSatChainInfo {
  enum: string;
  name: string;
  network: string;
}

export interface UniSatSignPsbtOptions {
  autoFinalized?: boolean;
  toSignInputs?: UniSatSignInput[];
}

export interface UniSatSignInput {
  index: number;
  address?: string;
  publicKey?: string;
  sighashTypes?: number[];
  disableTweakSigner?: boolean;
  useTweakedSigner?: boolean;
}

export interface UniSatSendBitcoinOptions {
  feeRate?: number;
  memo?: string;
  memos?: string[];
}

export interface UniSatSendRunesOptions {
  feeRate?: number;
}

export interface UniSatSendInscriptionOptions {
  feeRate?: number;
}

// 扩展的钱包适配器接口，包含 Unisat 特定功能
export interface UniSatWalletAdapter extends BTCWalletAdapter {
  // Unisat 特定方法
  getPublicKey(): Promise<string>;
  getBalance(): Promise<UniSatBalance>;
  getInscriptions(
    cursor?: number,
    size?: number,
  ): Promise<UniSatInscriptionsResponse>;
  getChain(): Promise<UniSatChainInfo>;
  switchChain(chain: string): Promise<UniSatChainInfo>;
  sendRunes(
    address: string,
    runeid: string,
    amount: string,
    options?: UniSatSendRunesOptions,
  ): Promise<{ txid: string }>;
  sendInscription(
    address: string,
    inscriptionId: string,
    options?: UniSatSendInscriptionOptions,
  ): Promise<string>;
  inscribeTransfer(ticker: string, amount: string): Promise<void>;
  signPsbtAdvanced(
    psbtHex: string,
    options?: UniSatSignPsbtOptions,
  ): Promise<string>;
  signPsbts(
    psbtHexs: string[],
    options?: UniSatSignPsbtOptions,
  ): Promise<string[]>;
  pushPsbt(psbtHex: string): Promise<string>;
  pushTx(rawtx: string): Promise<string>;
  signMessageAdvanced(
    message: string,
    type?: 'ecdsa' | 'bip322-simple',
  ): Promise<string>;
  sendBitcoinAdvanced(
    toAddress: string,
    satoshis: number,
    options?: UniSatSendBitcoinOptions,
  ): Promise<string>;
}
