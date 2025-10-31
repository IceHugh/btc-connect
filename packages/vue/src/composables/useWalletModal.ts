/**
 * 钱包模态框管理 Composable
 *
 * 提供全局唯一的钱包模态框状态管理
 * 确保整个应用中只有一个模态框实例
 */

import { computed, readonly, ref } from 'vue';
import type { UseWalletModalReturn } from '../types';
import { useWalletContext } from '../walletContext';

// 全局模态框状态 - 确保整个应用中只有一个模态框
const globalModalState = ref<{
  isOpen: boolean;
  walletId: string | null;
  source: string | null; // 记录打开来源
}>({
  isOpen: false,
  walletId: null,
  source: null,
});

/**
 * 使用钱包模态框的Composable
 *
 * @param source 可选的来源标识，用于调试
 */
export function useWalletModal(source?: string): UseWalletModalReturn {
  const ctx = useWalletContext();

  // 计算属性 - 基于全局状态
  const isOpen = computed({
    get: () => globalModalState.value.isOpen,
    set: (value: boolean) => {
      globalModalState.value.isOpen = value;
      if (value) {
        globalModalState.value.source = source || 'unknown';
        // 同步到上下文
        ctx.openModal();
      } else {
        globalModalState.value.source = null;
        globalModalState.value.walletId = null;
        // 同步到上下文
        ctx.closeModal();
      }
    },
  });

  // 打开模态框
  const open = (walletId?: string) => {
    globalModalState.value.isOpen = true;
    globalModalState.value.walletId = walletId || null;
    globalModalState.value.source = source || 'unknown';

    if (
      typeof window !== 'undefined' &&
      process.env.NODE_ENV === 'development'
    ) {
      console.log(
        `🔓 [useWalletModal] Opening modal from: ${source || 'unknown'}`,
      );
    }

    // 同步到上下文
    ctx.openModal();
  };

  // 关闭模态框
  const close = () => {
    globalModalState.value.isOpen = false;
    globalModalState.value.walletId = null;
    globalModalState.value.source = null;

    if (
      typeof window !== 'undefined' &&
      process.env.NODE_ENV === 'development'
    ) {
      console.log(
        `🔒 [useWalletModal] Closing modal from: ${source || 'unknown'}`,
      );
    }

    // 同步到上下文
    ctx.closeModal();
  };

  // 切换模态框状态
  const toggle = () => {
    if (isOpen.value) {
      close();
    } else {
      open();
    }
  };

  // 强制关闭所有模态框（用于路由切换等场景）
  const forceClose = () => {
    globalModalState.value.isOpen = false;
    globalModalState.value.walletId = null;
    globalModalState.value.source = null;
    ctx.closeModal();

    if (
      typeof window !== 'undefined' &&
      process.env.NODE_ENV === 'development'
    ) {
      console.log(
        `💥 [useWalletModal] Force closing modal from: ${source || 'unknown'}`,
      );
    }
  };

  // 获取当前打开的钱包ID
  const currentWalletId = computed(() => globalModalState.value.walletId);

  // 获取模态框来源
  const modalSource = computed(() => globalModalState.value.source);

  return {
    isOpen,
    theme: ctx.theme,
    open,
    close,
    toggle,
    forceClose,
    currentWalletId,
    modalSource,
  };
}

/**
 * 全局模态框管理器
 * 用于跨组件操作模态框
 */
export const useGlobalModal = () => {
  const open = (source = 'global') => {
    globalModalState.value.isOpen = true;
    globalModalState.value.source = source;
  };

  const close = () => {
    globalModalState.value.isOpen = false;
    globalModalState.value.walletId = null;
    globalModalState.value.source = null;
  };

  const getState = () => ({ ...globalModalState.value });

  return {
    open,
    close,
    getState,
    state: readonly(globalModalState),
  };
};

// 导出全局状态供其他组件使用
export { globalModalState };
