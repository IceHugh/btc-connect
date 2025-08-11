// 钱包事件类型
export type WalletEvent =
  | 'connect'
  | 'disconnect'
  | 'accountChange'
  | 'networkChange'
  | 'error';

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

// 钱包账户信息
export interface AccountInfo {
  address: string;
  publicKey?: string;
  balance?: number;
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

  // 事件监听
  on(event: WalletEvent, handler: (...args: any[]) => void): void;
  off(event: WalletEvent, handler: (...args: any[]) => void): void;

  // 签名相关
  signMessage(message: string): Promise<string>;
  signPsbt(psbt: string): Promise<string>;
  sendBitcoin(toAddress: string, amount: number): Promise<string>;
}

// 钱包管理器配置
export interface WalletManagerConfig {
  // 错误处理
  onError?: (error: Error) => void;
  // 状态变化回调
  onStateChange?: (state: WalletState) => void;
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
  // 采纳已授权会话为已连接（不触发授权弹窗）
  assumeConnected(walletId: string): Promise<AccountInfo[] | null>;

  // 状态获取
  getState(): WalletState;
  getCurrentAdapter(): BTCWalletAdapter | null;
  getCurrentWallet(): WalletInfo | null;

  // 事件监听
  on(event: WalletEvent, handler: (...args: any[]) => void): void;
  off(event: WalletEvent, handler: (...args: any[]) => void): void;

  // 销毁
  destroy(): void;
}

// 事件处理器接口
export type EventHandler = (...args: any[]) => void;

// 事件监听器接口
export interface EventListener {
  event: WalletEvent;
  handler: EventHandler;
}

// 错误类型
export class WalletError extends Error {
  constructor(
    message: string,
    public code: string,
    public walletId?: string,
  ) {
    super(message);
    this.name = 'WalletError';
  }
}

export class WalletNotInstalledError extends WalletError {
  constructor(walletId: string) {
    super(
      `Wallet ${walletId} is not installed`,
      'WALLET_NOT_INSTALLED',
      walletId,
    );
    this.name = 'WalletNotInstalledError';
  }
}

export class WalletConnectionError extends WalletError {
  constructor(walletId: string, message: string) {
    super(
      `Failed to connect to ${walletId}: ${message}`,
      'WALLET_CONNECTION_ERROR',
      walletId,
    );
    this.name = 'WalletConnectionError';
  }
}

export class WalletDisconnectedError extends WalletError {
  constructor(walletId: string) {
    super(
      `Wallet ${walletId} is disconnected`,
      'WALLET_DISCONNECTED',
      walletId,
    );
    this.name = 'WalletDisconnectedError';
  }
}

import type { Network } from '@btc-connect/shared';

export type { Network };

// 交易相关类型
export interface BitcoinTransaction {
  txid: string;
  raw: string;
  inputs: any[];
  outputs: any[];
  fee: number;
}

// PSBT 相关类型
export interface PSBTInfo {
  psbt: string;
  inputs: any[];
  outputs: any[];
  fee: number;
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
