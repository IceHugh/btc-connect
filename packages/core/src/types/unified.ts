/**
 * 统一的 React 和 Vue 包接口类型定义
 *
 * 这个文件定义了两个包都需要使用的统一接口，确保功能对等性和类型一致性
 */

import type {
  AccountInfo,
  BalanceDetail,
  BTCWalletAdapter,
  EventHandler,
  ModalConfig,
  Network,
  WalletEvent,
  WalletInfo,
  WalletManager,
  WalletState,
} from './index';

// === 主题相关类型 ===

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface ThemeConfig {
  /** 主题模式 */
  mode: ThemeMode;
  /** 是否跟随系统主题 */
  followSystem: boolean;
  /** 主色调 */
  primary?: string;
  /** 背景色 */
  background?: string;
  /** 文本色 */
  text?: string;
  /** 边框色 */
  border?: string;
  /** 自定义 CSS 变量 */
  cssVariables?: Record<string, string>;
}

export interface Theme {
  /** 当前主题模式 */
  mode: ThemeMode;
  /** 是否为暗色主题 */
  isDark: boolean;
  /** 系统主题 */
  systemTheme: 'light' | 'dark';
  /** 主题配置 */
  config: ThemeConfig;
}

// === 事件监听相关类型 ===

export interface WalletEventRecord {
  /** 事件类型 */
  event: WalletEvent;
  /** 事件数据 */
  data: any;
  /** 时间戳 */
  timestamp: number;
  /** 钱包ID */
  walletId?: string;
}

export interface UseWalletEventReturn {
  /** 监听特定事件 */
  on: <T extends WalletEvent>(event: T, handler: EventHandler<T>) => () => void; // 返回取消监听函数

  /** 一次性监听 */
  once: <T extends WalletEvent>(event: T, handler: EventHandler<T>) => void;

  /** 移除监听 */
  off: <T extends WalletEvent>(event: T, handler?: EventHandler<T>) => void;

  /** 事件历史 */
  eventHistory: WalletEventRecord[];

  /** 清除所有监听 */
  clear: () => void;

  /** 清除事件历史 */
  clearHistory: () => void;
}

// === 钱包管理器相关类型 ===

export interface UseWalletManagerReturn {
  /** 当前适配器 */
  currentAdapter: BTCWalletAdapter | null;

  /** 所有可用适配器 */
  availableAdapters: BTCWalletAdapter[];

  /** 适配器状态 */
  adapterStates: Record<string, WalletState>;

  /** 高级操作 */
  getAdapter: (walletId: string) => BTCWalletAdapter | null;
  addAdapter: (adapter: BTCWalletAdapter) => void;
  removeAdapter: (walletId: string) => void;

  /** 原始管理器访问（高级用法） */
  manager: WalletManager;
}

// === 模态框相关类型 ===

export interface ModalState {
  /** 是否打开 */
  isOpen: boolean;
  /** 打开来源 */
  source: string | null;
  /** 打开次数 */
  openCount: number;
  /** 当前选择的钱包ID */
  currentWalletId: string | null;
  /** 打开时间戳 */
  openTimestamp: number | null;
}

export interface UseWalletModalReturn {
  /** 基础状态 */
  isOpen: boolean;

  /** 基础操作 */
  open: () => void;
  close: () => void;
  toggle: () => void;

  /** 增强功能 */
  openWithSource: (source: string) => void;
  forceClose: () => void;

  /** 状态追踪 */
  openSource: string | null;
  openCount: number;

  /** 配置 */
  config: ModalConfig;
  setConfig: (config: Partial<ModalConfig>) => void;

  /** 高级状态 */
  modalState: ModalState;
}

// === 统一的钱包 Hook 返回类型 ===

export interface UseWalletBaseReturn {
  // 连接状态
  isConnected: boolean;
  isConnecting: boolean;
  walletId: string | null;

  // 账户信息
  account: AccountInfo | null;
  accounts: AccountInfo[];

  // 网络信息
  network: Network;

  // 错误信息
  error: Error | null;

  // 操作方法
  connect: (walletId?: string) => Promise<AccountInfo[]>;
  disconnect: () => Promise<void>;
  switchWallet: (walletId: string) => Promise<void>;
}

export interface UseWalletEnhancedReturn extends UseWalletBaseReturn {
  // 获取其他 hooks 的方法（统一访问点）
  getBalance: () => UseBalanceReturn;
  getNetwork: () => UseNetworkReturn;
  getAccount: () => UseAccountReturn;
  getSignature: () => UseSignatureReturn;
  getTransactions: () => UseTransactionsReturn;
  getEvents: () => UseWalletEventReturn;
  getManager: () => UseWalletManagerReturn;
  getTheme: () => UseThemeReturn;
  getModal: () => UseWalletModalReturn;
}

// === 其他 Hook 返回类型 ===

export interface UseBalanceReturn {
  /** 余额信息 */
  balance: BalanceDetail | null;
  /** 是否正在加载 */
  isLoading: boolean;
  /** 错误信息 */
  error: Error | null;

  // 操作方法
  /** 刷新余额 */
  refresh: () => Promise<void>;
  /** 格式化余额 */
  format: (satoshis: number, options?: FormatBalanceOptions) => string;
}

export interface UseNetworkReturn {
  /** 当前网络 */
  network: Network;
  /** 是否正在切换 */
  isSwitching: boolean;
  /** 支持的网络列表 */
  supportedNetworks: Network[];

  // 操作方法
  /** 切换网络 */
  switchNetwork: (network: Network) => Promise<void>;
  /** 获取网络信息 */
  getNetworkInfo: (network: Network) => { name: string; type: string };
}

export interface UseAccountReturn {
  /** 账户列表 */
  accounts: AccountInfo[];
  /** 当前账户 */
  currentAccount: AccountInfo | null;
  /** 当前地址 */
  address: string | null;
  /** 当前公钥 */
  publicKey: string | null;

  // 操作方法
  /** 刷新账户信息 */
  refresh: () => Promise<void>;
  /** 切换账户 */
  switchAccount: (address: string) => Promise<void>;
  /** 验证地址所有权 */
  verifyOwnership: (message: string) => Promise<string>;
}

export interface UseSignatureReturn {
  /** 是否正在签名 */
  isSigning: boolean;
  /** 错误信息 */
  error: Error | null;

  // 操作方法
  /** 签名消息 */
  signMessage: (message: string) => Promise<string>;
  /** 签名 PSBT */
  signPsbt: (psbt: string) => Promise<string>;
  /** 验证签名 */
  verifySignature: (
    message: string,
    signature: string,
    address: string,
  ) => boolean;
}

export interface UseTransactionsReturn {
  /** 是否正在发送 */
  isSending: boolean;
  /** 错误信息 */
  error: Error | null;

  // 操作方法
  /** 发送比特币 */
  sendBitcoin: (toAddress: string, amount: number) => Promise<string>;
  /** 发送交易 */
  sendTransaction: (psbt: string) => Promise<string>;
  /** 估算费用 */
  estimateFee: (toAddress: string, amount: number) => Promise<number>;
}

export interface UseThemeReturn {
  /** 当前主题 */
  theme: Theme;

  /** 主题配置 */
  themeConfig: ThemeConfig;

  // 切换主题
  setTheme: (theme: Partial<Theme>) => void;

  // 切换模式
  setThemeMode: (mode: ThemeMode) => void;

  // 自定义主题
  setCustomTheme: (config: Partial<ThemeConfig>) => void;

  // 重置主题
  resetTheme: () => void;

  // 主题状态
  isDark: boolean;
  systemTheme: 'light' | 'dark';
}

// === 工具函数类型 ===

export interface FormatAddressOptions {
  /** 开始字符数 */
  startChars?: number;
  /** 结束字符数 */
  endChars?: number;
  /** 分隔符 */
  separator?: string;
  /** 触发简化的最小长度 */
  threshold?: number;
}

export interface FormatBalanceOptions {
  /** 单位 */
  unit?: 'BTC' | 'satoshi' | 'mBTC';
  /** 小数位数 */
  decimals?: number;
  /** 是否显示符号 */
  showSymbol?: boolean;
  /** 本地化设置 */
  locale?: string;
  /** 千分位分隔符 */
  useGrouping?: boolean;
}

// === 钱包检测相关类型 ===

export interface WalletDetectionOptions {
  /** 是否自动连接 */
  autoConnect?: boolean;
  /** 连接超时时间 */
  connectTimeout?: number;
  /** 检测间隔 */
  interval?: number;
  /** 检测超时 */
  timeout?: number;
}

export interface WalletDetectionResult {
  /** 检测到的钱包 */
  wallets: string[];
  /** 可用的适配器 */
  adapters: BTCWalletAdapter[];
  /** 检测耗时 */
  elapsedTime: number;
  /** 是否完成检测 */
  isComplete: boolean;
}

// === 配置相关类型 ===

export interface UnifiedConfig {
  /** 主题配置 */
  theme?: Partial<ThemeConfig>;
  /** 模态框配置 */
  modal?: ModalConfig;
  /** 钱包检测配置 */
  walletDetection?: WalletDetectionOptions;
  /** 性能配置 */
  performance?: {
    /** 是否启用缓存 */
    enableCache?: boolean;
    /** 缓存TTL */
    cacheTTL?: number;
    /** 是否启用性能监控 */
    enableMonitoring?: boolean;
  };
  /** 开发配置 */
  dev?: {
    /** 是否启用调试模式 */
    debug?: boolean;
    /** 是否显示性能指标 */
    showPerformanceMetrics?: boolean;
    /** 是否启用详细日志 */
    verboseLogging?: boolean;
  };
}

// === 错误处理相关类型 ===

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

export interface WalletError extends Error {
  /** 错误代码 */
  code: string;
  /** 错误上下文 */
  context: ErrorContext;
  /** 原始错误 */
  originalError?: Error;
  /** 获取完整错误信息 */
  getFullMessage(): string;
  /** 转换为JSON */
  toJSON(): object;
}

// === 事件类型映射 ===

export interface WalletEventHandlerMap {
  connect: (params: { walletId: string; accounts: AccountInfo[] }) => void;
  disconnect: (params: { walletId: string }) => void;
  accountChange: (params: {
    walletId: string;
    accounts: AccountInfo[];
  }) => void;
  networkChange: (params: { walletId: string; network: Network }) => void;
  error: (params: { walletId?: string; error: WalletError }) => void;
  availableWallets: (params: {
    wallets: WalletInfo[];
    adapters: BTCWalletAdapter[];
  }) => void;
  walletDetected: (params: {
    walletId: string;
    walletInfo: WalletInfo;
  }) => void;
  walletDetectionComplete: (params: { result: WalletDetectionResult }) => void;
}

// === React 和 Vue 通用类型 ===

export interface ComponentBaseProps {
  /** 主题模式 */
  theme?: ThemeMode;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: any;
  /** 是否禁用 */
  disabled?: boolean;
}

export interface ConnectButtonProps extends ComponentBaseProps {
  /** 组件尺寸 */
  size?: 'sm' | 'md' | 'lg';
  /** 组件变体 */
  variant?: 'select' | 'button' | 'compact';
  /** 按钮文本 */
  label?: string;
  /** 是否显示余额 */
  showBalance?: boolean;
  /** 是否显示地址 */
  showAddress?: boolean;
  /** 余额显示精度 */
  balancePrecision?: number;
  /** 连接回调 */
  onConnect?: (walletId: string, accounts: AccountInfo[]) => void;
  /** 断开连接回调 */
  onDisconnect?: (walletId: string) => void;
  /** 错误回调 */
  onError?: (error: WalletError) => void;
}

export interface WalletModalProps extends ComponentBaseProps {
  /** 是否打开 */
  isOpen?: boolean;
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

// === 工具函数导出 ===

export interface UtilsInterface {
  /** 地址格式化 */
  formatAddress: (address: string, options?: FormatAddressOptions) => string;
  /** 余额格式化 */
  formatBalance: (satoshis: number, options?: FormatBalanceOptions) => string;
  /** 复制到剪贴板 */
  copyToClipboard: (text: string) => Promise<boolean>;
  /** 验证地址 */
  validateAddress: (address: string) => boolean;
  /** 验证金额 */
  validateAmount: (amount: number) => boolean;
  /** 获取钱包图标 */
  getWalletIcon: (walletId: string) => string;
  /** 格式化时间戳 */
  formatTimestamp: (timestamp: number) => string;
}
