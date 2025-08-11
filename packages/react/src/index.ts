// 上下文和提供者
export {
  BTCWalletProvider,
  useConnectWallet,
  useNetwork,
  useWallet,
  useWalletContext,
  useWalletEvent,
} from './context';

// 组件
export {
  BTCConnectButton,
  WalletModal,
} from './components';

// Hooks
export {
  useBalance,
  useSignature,
  useTransactions,
  useWalletModal,
} from './hooks';

// 类型定义
export type {
  // Hook 类型
  BalanceResult,
  // 核心类型
  ConnectWalletContext,
  Network,
  NetworkContext,
  SignatureResult,
  ThemeMode,
  TransactionResult,
  // 上下文类型
  WalletContext,
  WalletModalResult,
  // 连接策略类型
  ConnectionPolicy,
  ConnectionPolicyTask,
  ConnectionPolicyTaskContext,
  ConnectionPolicyTaskResult,
} from './types';

// 工具函数
export {
  cn,
  copyToClipboard,
  formatAddress,
  formatBalance,
  getNetworkDisplayName,
} from './utils';

// 版本信息
export const version = '0.1.0';

// 默认配置
export const defaultConfig = {
  // 钱包配置
  walletOrder: ['unisat', 'okx', 'xverse'],
  featuredWallets: ['unisat', 'okx'],

  // UI 配置
  theme: 'light',
  animation: 'scale' as 'fade' | 'slide' | 'scale',

  // 网络配置
  showTestnet: false,
  showRegtest: false,

  // 样式配置
  size: 'md' as 'sm' | 'md' | 'lg',
  variant: 'select' as 'select' | 'button' | 'compact',
};