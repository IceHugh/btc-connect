/**
 * Vue 组件导出
 *
 * 提供模块化、可复用的Vue 3组件
 * WalletModal 已集成到 ConnectButton 中，无需单独导出
 */

// 内部组件 - 高级用法时可单独使用
export { default as AddressDisplay } from './AddressDisplay.vue';
export { default as BalanceDisplay } from './BalanceDisplay.vue';
// 主要组件 - 推荐使用
export { default as ConnectButton } from './ConnectButton.vue';
export { default as WalletStatus } from './WalletStatus.vue';

// WalletModal 已集成到 ConnectButton 中，不再单独导出
// 如需自定义模态框行为，请使用 useWalletModal hook

// 重新导出 ConnectButton 作为默认导出
export { default } from './ConnectButton.vue';
