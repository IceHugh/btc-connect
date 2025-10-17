/**
 * BTC Connect 共享类型定义
 */


export * from './themes';
export type { Network, OnNetworkChange } from './networks';
export * from './wallets';


// 主题类型
export type ThemeMode = 'light' | 'dark';

// 余额类型（标准化）
export interface BalanceDetail {
  confirmed: number;
  unconfirmed: number;
  total: number;
}

// 基础组件属性类型
export interface BaseComponentProps {
  className?: string;
  disabled?: boolean;
}

// 连接按钮属性类型
export interface ConnectButtonProps extends BaseComponentProps {
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  defaultWalletId?: string;
  showWalletIcon?: boolean;
  showBalance?: boolean;
  showNetworkIndicator?: boolean;
  buttonText?: string;
  connectingText?: string;
  disconnectText?: string;
  loading?: boolean;
}

// 账户信息组件属性
export interface AccountInfoProps extends BaseComponentProps {
  showWallet?: boolean;
  showBalance?: boolean;
  showNetwork?: boolean;
  showPublicKey?: boolean;
  showNetworkSwitch?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

// 网络选项类型
export interface NetworkOption {
  id: string;
  name: string;
  description?: string;
}

// 网络切换组件属性
export interface NetworkSwitchProps extends BaseComponentProps {
  showLabel?: boolean;
  showSwitch?: boolean;
  showDropdown?: boolean;
  showStatus?: boolean;
  networks?: NetworkOption[];
  variant?: 'default' | 'compact' | 'minimal';
}

// 钱包模态框属性
export interface WalletModalProps extends BaseComponentProps {
  isOpen: boolean;
  title?: string;
  showFooter?: boolean;
  featuredWallets?: string[];
}

// 钱包选择组件属性
export interface WalletSelectProps extends BaseComponentProps {
  autoConnect?: boolean;
  showSearch?: boolean;
  featuredWallets?: string[];
  variant?: 'default' | 'compact' | 'minimal';
}

// Vue 组件事件类型
export interface NetworkSwitchEmits {
  (e: 'switch', network: string): void;
  (e: 'select', network: string): void;
}

export interface WalletModalEmits {
  (e: 'close'): void;
  (e: 'connect', wallet: any): void;
  (e: 'help'): void;
}

export interface WalletSelectEmits {
  (e: 'select', wallet: any): void;
  (e: 'connect', wallet: any): void;
  (e: 'error', error: Error): void;
}

// React Context 类型
export interface WalletContext {
  isConnected: boolean;
  isConnecting: boolean;
  account: string | null;
  balance: BalanceDetail | null;
  currentWallet: any; // BTCWalletAdapter 从 core 导入
  network: any; // Network 从 core 导入
  error: Error | null;
}

export interface ConnectWalletContext {
  availableWallets: any[]; // BTCWalletAdapter[] 从 core 导入
  connect: (walletId: string) => Promise<string[]>;
  disconnect: () => Promise<void>;
}

export interface NetworkContext {
  network: any; // Network 从 core 导入
  switchNetwork: (network: any) => Promise<void>; // Network 从 core 导入
}

// Hook 结果类型
export interface BalanceResult {
  balance: BalanceDetail;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export interface SignatureResult {
  signature: string | null;
  isLoading: boolean;
  error: Error | null;
  signMessage: (message: string) => Promise<string>;
}

export interface TransactionResult {
  txId: string | null;
  isLoading: boolean;
  error: Error | null;
  sendTransaction: (to: string, amount: number) => Promise<string>;
}

export interface WalletModalResult {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

// Vue 特定类型
export interface ComponentState {
  loading: boolean;
  error: string | null;
  data: any;
}

export type Ref<T> = {
  value: T;
};

export type Computed<T> = {
  value: T;
};

export type SharedEventHandler<T = any> = (payload: T) => void;

export type ClassName = string | undefined | null | false;

// 通用类型
export type Size = 'sm' | 'md' | 'lg';
export type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type Animation = 'fade' | 'slide' | 'scale' | 'bounce';

// 组件插槽类型
export interface ComponentSlots {
  default?: () => any;
  [key: string]: (() => any) | undefined;
}

// 钱包状态类型 (Vue)
export interface WalletStateRef {
  state: any; // WalletState 从 core 导入
  currentWallet: any; // WalletInfo 从 core 导入
  availableWallets: any[]; // WalletInfo[] 从 core 导入
  isConnected: boolean;
  isConnecting: boolean;
}

// 钱包实例类型 (Vue)
export interface WalletInstance {
  // 状态
  state: any; // WalletState 从 core 导入
  currentWallet: any; // WalletInfo 从 core 导入
  availableWallets: any[]; // WalletInfo[] 从 core 导入
  isConnected: boolean;
  isConnecting: boolean;
  
  // 操作
  connect: (walletId: string) => Promise<any[]>; // AccountInfo[] 从 core 导入
  disconnect: () => Promise<void>;
  switchWallet: (walletId: string) => Promise<any[]>; // AccountInfo[] 从 core 导入
  
  // 管理器
  manager: any; // BTCWalletManager 从 core 导入
}

// 钱包配置类型 (Vue)
export interface WalletConfig {
  config?: any; // WalletManagerConfig 从 core 导入
  autoConnect?: boolean;
}

// 连接策略相关类型
export interface ConnectionPolicyTaskResult { 
  success: boolean; 
  data?: unknown 
}

export interface ConnectionPolicyTaskContext { 
  manager: any 
}

export interface ConnectionPolicyTask {
  run: (ctx: ConnectionPolicyTaskContext) => Promise<ConnectionPolicyTaskResult>
  required?: boolean
  autoBehavior?: 'run' | 'skip'
}

export interface ConnectionPolicy { 
  tasks: ConnectionPolicyTask[]
  emitEventsOnAutoConnect?: boolean 
}