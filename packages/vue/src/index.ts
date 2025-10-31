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

// 组件导出 - WalletModal 已集成到 ConnectButton
export {
  AddressDisplay,
  BalanceDisplay,
  default as ConnectButton,
  WalletStatus,
} from './components';
// Composables 导出
export * from './composables';
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
// 工具函数导出
export * from './utils';
// 核心上下文与插件
export {
  BTCWalletPlugin,
  createWalletContext,
  useWalletContext,
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
