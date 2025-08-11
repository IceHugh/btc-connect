// 钱包相关的类型定义

// 钱包类型
export type WalletType = 'unisat' | 'okx' | 'xverse' | 'magic-eden' | 'phantom' | 'metamask' | 'trust-wallet' | 'coinbase' | 'ledger' | 'trezor';

// 钱包状态
export type WalletState = 'disconnected' | 'connecting' | 'connected' | 'error';

// 钱包事件类型
export type WalletEventType = 'connect' | 'disconnect' | 'accountChange' | 'networkChange' | 'error';

// 钱包基本信息
export interface WalletInfo {
  id: WalletType;
  name: string;
  description: string;
  icon: string;
  website: string;
  downloadUrl?: string;
  version: string;
  isMobile: boolean;
  isDesktop: boolean;
  isBrowser: boolean;
  isHardware: boolean;
  supportedNetworks: string[];
  features: WalletFeature[];
  chains: string[];
  rating: number;
  downloadCount?: number;
  lastUpdated: string;
  category: WalletCategory;
  tags: string[];
}

// 钱包特性
export interface WalletFeature {
  id: string;
  name: string;
  description: string;
  icon?: string;
  enabled: boolean;
}

// 钱包分类
export type WalletCategory = 'hot' | 'hardware' | 'mobile' | 'browser' | 'desktop' | 'web';

// 钱包配置
export interface WalletConfig {
  id: WalletType;
  name: string;
  icon: string;
  isReady: boolean;
  autoConnect: boolean;
  timeout: number;
  retries: number;
  network: string;
  debug: boolean;
}

// 钱包账户
export interface WalletAccount {
  address: string;
  publicKey: string;
  privateKey?: string;
  name?: string;
  balance?: number;
  network: string;
  index: number;
  derivationPath?: string;
  hdPath?: string;
  type: 'segwit' | 'taproot' | 'legacy';
}

// 钱包余额
export interface WalletBalance {
  total: number;
  confirmed: number;
  unconfirmed: number;
  locked: number;
  network: string;
  symbol: string;
  decimals: number;
  lastUpdated: number;
}

// 钱包交易
export interface WalletTransaction {
  txid: string;
  hash: string;
  version: number;
  size: number;
  vsize: number;
  weight: number;
  locktime: number;
  vin: WalletVin[];
  vout: WalletVout[];
  blockhash?: string;
  confirmations: number;
  time: number;
  blocktime: number;
  fee: number;
  status: 'pending' | 'confirmed' | 'failed';
  network: string;
  symbol: string;
  decimals: number;
}

// 交易输入
export interface WalletVin {
  txid: string;
  vout: number;
  scriptSig: {
    asm: string;
    hex: string;
  };
  sequence: number;
  txinwitness?: string[];
  prevout?: {
    scriptpubkey: string;
    value: number;
  };
}

// 交易输出
export interface WalletVout {
  value: number;
  n: number;
  scriptPubKey: {
    asm: string;
    hex: string;
    reqSigs: number;
    type: string;
    addresses?: string[];
  };
}

// 钱包状态信息
export interface WalletStatus {
  state: WalletState;
  isConnected: boolean;
  isConnecting: boolean;
  account?: WalletAccount;
  balance?: WalletBalance;
  network?: string;
  error?: string;
  lastActivity: number;
}

// 钱包连接选项
export interface WalletConnectOptions {
  network?: string;
  timeout?: number;
  retries?: number;
  autoConnect?: boolean;
  silent?: boolean;
  prompt?: boolean;
}

// 钱包断开选项
export interface WalletDisconnectOptions {
  clearCache?: boolean;
  clearStorage?: boolean;
  silent?: boolean;
}

// 钱包签名选项
export interface WalletSignOptions {
  message: string;
  type: 'ecdsa' | 'schnorr';
  network?: string;
  account?: string;
}

// 钱包发送交易选项
export interface WalletSendOptions {
  to: string;
  amount: number;
  feeRate?: number;
  network?: string;
  account?: string;
  memo?: string;
}

// 钱包事件处理器
export type WalletEventHandler = (event: WalletEventType, data: any) => void;

// 钱包事件发射器
export interface WalletEventEmitter {
  on: (event: WalletEventType, handler: WalletEventHandler) => void;
  off: (event: WalletEventType, handler: WalletEventHandler) => void;
  emit: (event: WalletEventType, data: any) => void;
  removeAllListeners: (event?: WalletEventType) => void;
}

// 钱包适配器接口
export interface WalletAdapter {
  id: WalletType;
  name: string;
  icon: string;
  description: string;
  version: string;
  website: string;
  isReady: () => boolean;
  connect: (options?: WalletConnectOptions) => Promise<string[]>;
  disconnect: (options?: WalletDisconnectOptions) => Promise<void>;
  getAccounts: () => Promise<string[]>;
  getNetwork: () => Promise<string>;
  switchNetwork: (network: string) => Promise<void>;
  getBalance: (address?: string) => Promise<WalletBalance>;
  signMessage: (message: string, options?: WalletSignOptions) => Promise<string>;
  sendTransaction: (options: WalletSendOptions) => Promise<string>;
  on: (event: WalletEventType, handler: WalletEventHandler) => void;
  off: (event: WalletEventType, handler: WalletEventHandler) => void;
  removeAllListeners: (event?: WalletEventType) => void;
  request: <T = any>(method: string, params?: any[]) => Promise<T>;
  batchRequest: <T = any>(requests: Array<{ method: string; params?: any[] }>) => Promise<T[]>;
}

// 钱包管理器
export interface WalletManager {
  getWallet: (id: WalletType) => WalletAdapter | null;
  getAllWallets: () => WalletAdapter[];
  getAvailableWallets: () => WalletAdapter[];
  connect: (walletId: WalletType, options?: WalletConnectOptions) => Promise<string[]>;
  disconnect: (walletId?: WalletType, options?: WalletDisconnectOptions) => Promise<void>;
  isConnected: (walletId?: WalletType) => boolean;
  getCurrentWallet: () => WalletAdapter | null;
  getCurrentAccount: () => string | null;
  getCurrentNetwork: () => string | null;
  getCurrentBalance: () => Promise<WalletBalance | null>;
  signMessage: (message: string, options?: WalletSignOptions) => Promise<string>;
  sendTransaction: (options: WalletSendOptions) => Promise<string>;
  addWallet: (wallet: WalletAdapter) => void;
  removeWallet: (walletId: WalletType) => void;
  on: (event: WalletEventType, handler: WalletEventHandler) => void;
  off: (event: WalletEventType, handler: WalletEventHandler) => void;
  emit: (event: WalletEventType, data: any) => void;
}

// 钱包存储接口
export interface WalletStorage {
  getConnectedWallet: () => WalletType | null;
  setConnectedWallet: (walletId: WalletType) => void;
  removeConnectedWallet: () => void;
  getAccounts: (walletId: WalletType) => string[];
  setAccounts: (walletId: WalletType, accounts: string[]) => void;
  removeAccounts: (walletId: WalletType) => void;
  getNetwork: (walletId: WalletType) => string | null;
  setNetwork: (walletId: WalletType, network: string) => void;
  removeNetwork: (walletId: WalletType) => void;
  getSettings: (walletId: WalletType) => Record<string, any>;
  setSettings: (walletId: WalletType, settings: Record<string, any>) => void;
  removeSettings: (walletId: WalletType) => void;
  clear: () => void;
}

// 钱包检测器
export interface WalletDetector {
  detect: () => Promise<WalletType[]>;
  isAvailable: (walletId: WalletType) => boolean;
  getVersion: (walletId: WalletType) => Promise<string>;
  getInfo: (walletId: WalletType) => Promise<WalletInfo>;
  subscribe: (callback: (wallets: WalletType[]) => void) => () => void;
}

// 钱包验证器
export interface WalletValidator {
  validateAddress: (address: string, network: string) => boolean;
  validatePublicKey: (publicKey: string) => boolean;
  validateSignature: (message: string, signature: string, publicKey: string) => boolean;
  validateTransaction: (tx: string) => boolean;
  getNetworkFromAddress: (address: string) => string;
  getAddressType: (address: string) => 'segwit' | 'taproot' | 'legacy';
}

// 钱包工具函数
export interface WalletUtils {
  formatAddress: (address: string, length?: number) => string;
  formatBalance: (balance: number, decimals?: number) => string;
  formatTx: (txid: string, length?: number) => string;
  formatPublicKey: (publicKey: string, length?: number) => string;
  generateQrCode: (data: string, size?: number) => string;
  copyToClipboard: (text: string) => Promise<void>;
  share: (data: string, title?: string) => Promise<void>;
  openInExplorer: (type: 'address' | 'tx' | 'block', value: string, network?: string) => void;
  estimateFee: (network: string, priority: 'low' | 'medium' | 'high') => number;
  estimateGas: (network: string, data: string) => number;
  getWalletIcon: (walletId: WalletType) => string;
  getWalletName: (walletId: WalletType) => string;
  getWalletWebsite: (walletId: WalletType) => string;
}

// 钱包配置选项
export interface WalletOptions {
  defaultWallet?: WalletType;
  autoConnect?: boolean;
  timeout?: number;
  retries?: number;
  storage?: WalletStorage;
  detector?: WalletDetector;
  validator?: WalletValidator;
  supportedWallets?: WalletType[];
  enableTestnet?: boolean;
  enableRegtest?: boolean;
  debug?: boolean;
  network?: string;
}

// 钱包钩子配置
export interface WalletHookConfig {
  walletId?: WalletType;
  autoConnect?: boolean;
  timeout?: number;
  onError?: (error: Error) => void;
  onSuccess?: (result: any) => void;
  onConnecting?: () => void;
  onConnected?: (accounts: string[]) => void;
  onDisconnected?: () => void;
  onAccountChange?: (accounts: string[]) => void;
  onNetworkChange?: (network: string) => void;
}

// 钱包UI配置
export interface WalletUIConfig {
  theme: 'light' | 'dark';
  language: string;
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  width: string;
  height: string;
  borderRadius: string;
  backdrop: boolean;
  animation: boolean;
  showFeatured: boolean;
  showSearch: boolean;
  showBalance: boolean;
  showNetwork: boolean;
  customStyles?: Record<string, any>;
}

// 钱包提供者工厂
export interface WalletProviderFactory {
  create: (walletId: WalletType, config?: any) => Promise<WalletAdapter>;
  supported: () => WalletType[];
  getName: () => string;
  getVersion: () => string;
}

// 钱包事件总线
export interface WalletEventBus {
  emit: (event: WalletEventType, data: any) => void;
  on: (event: WalletEventType, handler: WalletEventHandler) => void;
  off: (event: WalletEventType, handler: WalletEventHandler) => void;
  once: (event: WalletEventType, handler: WalletEventHandler) => void;
  removeAllListeners: (event?: WalletEventType) => void;
  listenerCount: (event: WalletEventType) => number;
}

// 钱包状态管理器
export interface WalletStateManager {
  getState: () => WalletStatus;
  setState: (state: Partial<WalletStatus>) => void;
  subscribe: (callback: (state: WalletStatus) => void) => () => void;
  reset: () => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  setAccount: (account: WalletAccount) => void;
  setBalance: (balance: WalletBalance) => void;
  setNetwork: (network: string) => void;
  setError: (error: string) => void;
}

// 导出所有钱包相关类型
export type WalletTypes = {
  WalletType: WalletType;
  WalletState: WalletState;
  WalletEventType: WalletEventType;
  WalletInfo: WalletInfo;
  WalletFeature: WalletFeature;
  WalletCategory: WalletCategory;
  WalletConfig: WalletConfig;
  WalletAccount: WalletAccount;
  WalletBalance: WalletBalance;
  WalletTransaction: WalletTransaction;
  WalletVin: WalletVin;
  WalletVout: WalletVout;
  WalletStatus: WalletStatus;
  WalletConnectOptions: WalletConnectOptions;
  WalletDisconnectOptions: WalletDisconnectOptions;
  WalletSignOptions: WalletSignOptions;
  WalletSendOptions: WalletSendOptions;
  WalletEventHandler: WalletEventHandler;
  WalletEventEmitter: WalletEventEmitter;
  WalletAdapter: WalletAdapter;
  WalletManager: WalletManager;
  WalletStorage: WalletStorage;
  WalletDetector: WalletDetector;
  WalletValidator: WalletValidator;
  WalletUtils: WalletUtils;
  WalletOptions: WalletOptions;
  WalletHookConfig: WalletHookConfig;
  WalletUIConfig: WalletUIConfig;
  WalletProviderFactory: WalletProviderFactory;
  WalletEventBus: WalletEventBus;
  WalletStateManager: WalletStateManager;
};