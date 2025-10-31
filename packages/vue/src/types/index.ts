/**
 * Vue 特定类型定义
 *
 * 扩展核心类型，添加 Vue 3 特有的类型定义
 */

import type {
  AccountInfo,
  BalanceDetail,
  BTCWalletManager,
  ConnectionStatus,
  Network,
  WalletEvent,
  WalletInfo,
  WalletManagerConfig,
  WalletState,
} from '@btc-connect/core';
import type { App, ComputedRef, Ref, StyleValue } from 'vue';

// 事件处理器类型
export type WalletEventHandler<T extends WalletEvent> = (data: any) => void;

// === 重新导出核心类型 ===
export type {
  AccountInfo,
  BalanceDetail,
  ConnectionStatus,
  Network,
  WalletEvent,
  WalletInfo,
  WalletManagerConfig,
  WalletState,
} from '@btc-connect/core';

export { BTCWalletManager } from '@btc-connect/core';

// === Vue 特定类型 ===

// 主题类型
export type ThemeMode = 'light' | 'dark' | 'auto';

// 组件尺寸
export type ComponentSize = 'sm' | 'md' | 'lg';

// 组件变体
export type ComponentVariant = 'select' | 'button' | 'compact';

// 动画类型
export type AnimationType = 'scale' | 'fade' | 'slide' | 'none';

// === 组件 Props 类型 ===

// ConnectButton 组件 Props
export interface ConnectButtonProps {
  /** 组件尺寸 */
  size?: ComponentSize;
  /** 组件变体 */
  variant?: ComponentVariant;
  /** 按钮文本 */
  label?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 主题模式 */
  theme?: ThemeMode;
  /** 自定义类名 */
  class?: string;
  /** 自定义样式 */
  style?: StyleValue;
  /** 是否显示余额 */
  showBalance?: boolean;
  /** 是否显示地址 */
  showAddress?: boolean;
  /** 余额显示精度 */
  balancePrecision?: number;
}

// WalletModal 组件 Props
export interface WalletModalProps {
  /** 是否打开 */
  isOpen?: boolean;
  /** 主题模式 */
  theme?: ThemeMode;
  /** 钱包列表 */
  wallets?: WalletInfo[];
  /** 连接回调 */
  onConnect?: (walletId: string) => void | Promise<void>;
  /** 关闭回调 */
  onClose?: () => void;
  /** 自定义标题 */
  title?: string;
  /** 自定义描述 */
  description?: string;
}

// BalanceDisplay 组件 Props
export interface BalanceDisplayProps {
  /** 余额信息 */
  balance?: BalanceDetail;
  /** 错误信息 */
  error?: Error | null;
  /** 显示精度 */
  precision?: number;
  /** 是否显示单位 */
  showUnit?: boolean;
  /** 主题模式 */
  theme?: ThemeMode;
  /** 自定义类名 */
  class?: string;
  /** 自定义样式 */
  style?: StyleValue;
}

// AddressDisplay 组件 Props
export interface AddressDisplayProps {
  /** 地址 */
  address?: string;
  /** 显示长度 */
  maxLength?: number;
  /** 是否可复制 */
  copyable?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 主题模式 */
  theme?: ThemeMode;
  /** 自定义类名 */
  class?: string;
  /** 自定义样式 */
  style?: StyleValue;
}

// === Composables 返回类型 ===

// useCore 返回类型
export interface UseCoreReturn {
  /** 钱包管理器 */
  manager: Ref<BTCWalletManager | null>;
  /** 钱包状态 */
  state: ComputedRef<WalletState>;
  /** 是否已连接 */
  isConnected: ComputedRef<boolean>;
  /** 是否正在连接 */
  isConnecting: ComputedRef<boolean>;
  /** 当前钱包 */
  currentWallet: ComputedRef<WalletInfo | null>;
  /** 可用钱包列表 */
  availableWallets: Ref<WalletInfo[]>;
  /** 主题模式 */
  theme: ComputedRef<ThemeMode>;

  // 操作方法
  /** 连接钱包 */
  connect: (walletId: string) => Promise<AccountInfo[]>;
  /** 断开连接 */
  disconnect: () => Promise<void>;
  /** 切换钱包 */
  switchWallet: (walletId: string) => Promise<AccountInfo[]>;
}

// useAccount 返回类型
export interface UseAccountReturn {
  /** 账户列表 */
  accounts: Ref<AccountInfo[]>;
  /** 当前账户 */
  currentAccount: Ref<AccountInfo | null>;
  /** 当前地址 */
  address: ComputedRef<string | null>;
  /** 当前公钥 */
  publicKey: ComputedRef<string | null>;
  /** 余额信息 */
  balance: Ref<BalanceDetail | null>;

  // 操作方法
  /** 刷新账户信息 */
  refreshAccount: () => Promise<void>;
  /** 获取账户详情 */
  getAccountDetails: () => Promise<AccountInfo | null>;
}

// useBalance 返回类型
export interface UseBalanceReturn {
  /** 余额信息 */
  balance: Ref<BalanceDetail | null>;
  /** 是否正在加载 */
  isLoading: Ref<boolean>;
  /** 错误信息 */
  error: Ref<Error | null>;

  // 操作方法
  /** 刷新余额 */
  refreshBalance: () => Promise<void>;
  /** 格式化余额 */
  formatBalance: (balance?: number, precision?: number) => string;
}

// useNetwork 返回类型
export interface UseNetworkReturn {
  /** 当前网络 */
  network: ComputedRef<Network>;
  /** 是否正在切换 */
  isSwitching: Ref<boolean>;
  /** 支持的网络列表 */
  supportedNetworks: ComputedRef<Network[]>;

  // 操作方法
  /** 切换网络 */
  switchNetwork: (network: Network) => Promise<void>;
  /** 获取网络信息 */
  getNetworkInfo: (network: Network) => { name: string; type: string };
}

// useWalletModal 返回类型
export interface UseWalletModalReturn {
  /** 是否打开 */
  isOpen: Ref<boolean>;
  /** 主题模式 */
  theme: ComputedRef<ThemeMode>;
  /** 当前选择的钱包ID */
  currentWalletId: Ref<string | null>;
  /** 模态框打开来源 */
  modalSource: Ref<string | null>;

  // 操作方法
  /** 打开模态框 */
  open: (walletId?: string) => void;
  /** 关闭模态框 */
  close: () => void;
  /** 切换模态框状态 */
  toggle: () => void;
  /** 强制关闭模态框 */
  forceClose: () => void;
}

// useTransactions 返回类型
export interface UseTransactionsReturn {
  /** 是否正在发送 */
  isSending: Ref<boolean>;
  /** 错误信息 */
  error: Ref<Error | null>;

  // 操作方法
  /** 发送比特币 */
  sendBitcoin: (toAddress: string, amount: number) => Promise<string>;
  /** 发送交易 */
  sendTransaction: (psbt: string) => Promise<string>;
}

// useSignature 返回类型
export interface UseSignatureReturn {
  /** 是否正在签名 */
  isSigning: Ref<boolean>;
  /** 错误信息 */
  error: Ref<Error | null>;

  // 操作方法
  /** 签名消息 */
  signMessage: (message: string) => Promise<string>;
  /** 签名 PSBT */
  signPsbt: (psbt: string) => Promise<string>;
}

// === 钱包上下文类型 ===

// 钱包上下文接口
export interface WalletContext {
  /** 钱包管理器 */
  manager: Ref<BTCWalletManager | null>;
  /** 钱包状态 */
  state: ComputedRef<WalletState>;
  /** 当前钱包 */
  currentWallet: ComputedRef<WalletInfo | null>;
  /** 可用钱包列表 */
  availableWallets: Ref<WalletInfo[]>;
  /** 是否已连接 */
  isConnected: ComputedRef<boolean>;
  /** 是否正在连接 */
  isConnecting: ComputedRef<boolean>;
  /** 模态框是否打开 */
  isModalOpen: Ref<boolean>;
  /** 主题模式 */
  theme: ComputedRef<ThemeMode>;

  // 操作方法
  /** 连接钱包 */
  connect: (walletId: string) => Promise<AccountInfo[]>;
  /** 断开连接 */
  disconnect: () => Promise<void>;
  /** 切换钱包 */
  switchWallet: (walletId: string) => Promise<AccountInfo[]>;
  /** 打开模态框 */
  openModal: () => void;
  /** 关闭模态框 */
  closeModal: () => void;
  /** 切换模态框 */
  toggleModal: () => void;

  // 内部状态更新触发器
  _stateUpdateTrigger: Ref<number>;
}

// Vue 钱包上下文（扩展版本）
export interface VueWalletContext extends WalletContext {
  /** Vue 应用实例 */
  readonly app: App | null;
  /** 是否为 SSR 环境 */
  readonly isSSR: boolean;
}

// === 插件类型 ===

// Vue 插件选项
export interface BTCWalletPluginOptions {
  /** 是否自动连接 */
  autoConnect?: boolean;
  /** 连接超时时间 */
  connectTimeout?: number;
  /** 主题模式 */
  theme?: ThemeMode;
  /** 模态框配置 */
  modalConfig?: WalletManagerConfig['modalConfig'];
  /** 钱包管理器配置 */
  config?: Omit<WalletManagerConfig, 'modalConfig'> & {
    modalConfig?: WalletManagerConfig['modalConfig'];
  };
}

// === 事件类型 ===

// 组件事件类型
export interface ComponentEvents {
  /** 连接事件 */
  connect: [accounts: AccountInfo[]];
  /** 断开连接事件 */
  disconnect: [];
  /** 账户变化事件 */
  accountChange: [account: AccountInfo];
  /** 网络变化事件 */
  networkChange: [network: Network];
  /** 错误事件 */
  error: [error: Error];
}

// === 工具类型 ===

// 深度 Partial 类型
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// 条件类型：提取函数参数
export type ArgsType<T> = T extends (...args: infer A) => any ? A : never;

// 条件类型：提取函数返回值
export type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;

// 条件类型：提取 Promise 的值类型
export type PromiseValue<T> = T extends Promise<infer P> ? P : T;

// === 性能相关类型 ===

// 缓存项类型
export interface CacheItem<T = any> {
  /** 缓存值 */
  value: T;
  /** 过期时间 */
  expireTime: number;
  /** 创建时间 */
  createdAt: number;
}

// 性能指标类型
export interface PerformanceMetrics {
  /** 钱包检测时间 */
  walletDetectionTime: number;
  /** 连接时间 */
  connectionTime: number;
  /** 缓存命中率 */
  cacheHitRate: number;
  /** 内存使用情况 */
  memoryUsage: number;
  /** 状态更新次数 */
  stateUpdateCount: number;
}

// === 错误类型 ===

// 自定义错误类型
export class BTCConnectError extends Error {
  constructor(
    message: string,
    public code: string,
    public walletId?: string,
  ) {
    super(message);
    this.name = 'BTCConnectError';
  }
}

// 连接错误
export class ConnectionError extends BTCConnectError {
  constructor(message: string, walletId?: string) {
    super(message, 'CONNECTION_ERROR', walletId);
    this.name = 'ConnectionError';
  }
}

// 网络错误
export class NetworkError extends BTCConnectError {
  constructor(message: string, network?: Network) {
    super(message, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

// 配置错误
export class ConfigError extends BTCConnectError {
  constructor(message: string) {
    super(message, 'CONFIG_ERROR');
    this.name = 'ConfigError';
  }
}

// === 导出所有类型 ===
export type { App, Ref, ComputedRef, StyleValue };
