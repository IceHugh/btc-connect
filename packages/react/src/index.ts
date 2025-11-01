/// <reference types="./types/jsx" />

// 统一接口类型 - 从 core 包重新导出
export type {
  ComponentBaseProps,
  ConnectButtonProps,
  ErrorContext,
  FormatAddressOptions,
  FormatBalanceOptions,
  ModalState,
  Theme,
  ThemeConfig,
  ThemeMode,
  UnifiedConfig,
  UseAccountReturn,
  UseBalanceReturn,
  UseNetworkReturn,
  UseSignatureReturn,
  UseThemeReturn,
  UseTransactionsReturn,
  UseWalletEnhancedReturn,
  UseWalletEventReturn,
  UseWalletManagerReturn,
  UseWalletModalReturn,
  UtilsInterface,
  WalletDetectionOptions,
  WalletDetectionResult,
  WalletError as UnifiedWalletError,
  WalletModalProps,
} from '@btc-connect/core';
// Components
export {
  ConnectButton,
  WalletModal,
} from './components';
// Provider & Context
export {
  BTCWalletProvider,
  useWalletContext,
} from './context';
// 核心 Hooks
// 新增 Hooks
// 保持向后兼容 - 原有的 useWalletModal 仍然可用
// 保持向后兼容的导出
export {
  useAccount,
  useBalance,
  useConnectWallet,
  useNetwork,
  useRefreshAccountInfo, // 已弃用，功能已集成到 useWallet
  useSignature,
  useTheme,
  useTransactions,
  useWallet,
  useWalletDetection,
  useWalletEvent,
  useWalletManager,
  useWalletModal,
  useWalletModalEnhanced,
} from './hooks';
// React 特定类型
export type {
  ConnectionPolicy,
  ConnectionPolicyTask,
  ConnectionPolicyTaskContext,
  ConnectionPolicyTaskResult,
  WalletContext,
} from './types';
// 类型定义 - 从 core 包重新导出的类型
export type {
  AccountInfo,
  BalanceDetail,
  ConnectionStatus,
  ModalConfig,
  Network,
  WalletEvent,
  WalletInfo,
  WalletManagerConfig,
  WalletState,
  ZIndexStrategy,
  ZIndexValue,
} from './types/core';
// Utils
// 保持现有工具函数导出
export {
  createBalanceDetail,
  formatAddress,
  formatBalance,
  normalizeBalance,
} from './utils';

// 版本信息
export const version = '0.1.4';

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
