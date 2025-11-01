/**
 * @btc-connect/vue
 *
 * Vue 3 钱包连接库 - 提供完整的比特币钱包连接功能
 *
 * Features:
 * - 🔄 响应式状态管理
 * - 🎨 主题系统支持
 * - 📱 移动端适配
 * - ⚡ 性能优化
 * - 🛡️ TypeScript 类型安全
 * - 🌐 SSR 兼容
 *
 * CSS 样式引入:
 * import '@btc-connect/vue/style.css' // 推荐方式
 *
 * 或按需引入:
 * import '@btc-connect/vue/styles/connect-button.css'
 */

// Components
export {
  AddressDisplay,
  BalanceDisplay,
  ConnectButton,
  WalletStatus,
} from './components';
// 核心 Composables
// 现有的 Composables（保留，但会移除性能优化相关）
export {
  useAccount,
  useBalance,
  useConnectWallet,
  useCore,
  useNetwork,
  useSignature,
  useTransactions,
  useWallet,
  useWalletDetection, // 钱包检测
  useWalletInfo, // 钱包信息
  useWalletModal, // 保持：增强模态框控制
} from './composables';
export { useTheme, useThemeAdvanced } from './composables/useTheme'; // 新增：主题管理
// 统一 Composables
export { useWalletEvent } from './composables/useWalletEvent'; // 新增：事件监听
export {
  useWalletManager,
  useWalletManagerAdvanced,
} from './composables/useWalletManager'; // 新增：访问当前 adapter
// 配置导出 (排除重复类型)
export type {
  DevConfig,
  FeatureConfig,
  PerformanceConfig,
  ThemeConfig,
  UIConfig,
  VueConfig,
  WalletConfig,
} from './config';
export { createConfigManager } from './config';

// 类型导出
export * from './types';
// Utils
export {
  formatAddress,
  formatBalance,
} from './utils';
// Plugin & Context
export {
  BTCWalletPlugin,
  useWalletContext, // 移除 createWalletContext，只保留一个 context
} from './walletContext';

// 版本信息
export const version = '0.3.14';

// SSR 检查工具
export const isClient = typeof window !== 'undefined';
export const isServer = !isClient;

// 默认配置
export const defaultConfig = {
  walletOrder: ['unisat', 'okx', 'xverse'],
  featuredWallets: ['unisat', 'okx'],
  theme: 'light' as const,
  animation: 'scale' as const,
  showTestnet: false,
  showRegtest: false,
  size: 'md' as const,
  variant: 'select' as const,
};

// 默认导出（支持多种导入方式）
import { BTCWalletPlugin } from './walletContext';
export default {
  install: BTCWalletPlugin.install,
  version,
  defaultConfig,
  isClient,
  isServer,
};

// 开发模式下的调试信息
if (process.env.NODE_ENV === 'development' && isClient) {
  console.log(
    `%c @btc-connect/vue v${version} `,
    'background: #f7931a; color: white; padding: 2px 6px; border-radius: 3px;',
    '🚀 Vue 3 Bitcoin Wallet Connect Library',
  );
}
