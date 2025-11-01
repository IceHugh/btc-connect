import type {
  ModalConfig,
  ModalState,
  UseWalletModalReturn,
} from '@btc-connect/core';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useWalletContext } from '../context/provider';

// 扩展 ModalConfig 以包含增强功能
interface EnhancedModalConfig extends ModalConfig {
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  showCloseButton?: boolean;
  preventBodyScroll?: boolean;
  animationDuration?: number;
}

/**
 * 默认模态框配置
 */
const DEFAULT_MODAL_CONFIG: EnhancedModalConfig = {
  closeOnEscape: true,
  closeOnOutsideClick: true,
  showCloseButton: true,
  preventBodyScroll: true,
  animationDuration: 300,
};

/**
 * 增强的钱包模态框管理 Hook
 *
 * 提供完整的模态框状态管理，包括来源追踪、配置管理和高级操作
 *
 * @example
 * ```tsx
 * function ModalExample() {
 *   const {
 *     isOpen,
 *     open,
 *     close,
 *     toggle,
 *     openWithSource,
 *     forceClose,
 *     openSource,
 *     openCount,
 *     config,
 *     setConfig,
 *     modalState
 *   } = useWalletModalEnhanced();
 *
 *   return (
 *     <div>
 *       <p>Modal is {isOpen ? 'open' : 'closed'}</p>
 *       <p>Opened from: {openSource || 'unknown'}</p>
 *       <p>Open count: {openCount}</p>
 *
 *       <button onClick={() => openWithSource('header-button')}>
 *         Open from Header
 *       </button>
 *
 *       <button onClick={open}>
 *         Open (default source)
 *       </button>
 *
 *       <button onClick={close}>
 *         Close
 *       </button>
 *
 *       <button onClick={forceClose}>
 *         Force Close
 *       </button>
 *
 *       <button onClick={toggle}>
 *         Toggle
 *       </button>
 *
 *       <button onClick={() => setConfig({
 *         closeOnEscape: false,
 *         animationDuration: 500
 *       })}>
 *         Update Config
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useWalletModalEnhanced(): UseWalletModalReturn {
  const { isModalOpen, openModal, closeModal } = useWalletContext();

  // 状态管理
  const [openSource, setOpenSource] = useState<string | null>(null);
  const [openCount, setOpenCount] = useState(0);
  const [openTimestamp, setOpenTimestamp] = useState<number | null>(null);
  const [currentWalletId, setCurrentWalletId] = useState<string | null>(null);
  const [customConfig, setCustomConfig] = useState<
    Partial<EnhancedModalConfig>
  >({});

  // 引用，用于清理副作用
  const bodyScrollRef = useRef<{ original: string; overflow: string } | null>(
    null,
  );

  // 合并配置
  const config = useMemo<EnhancedModalConfig>(
    () => ({
      ...DEFAULT_MODAL_CONFIG,
      ...customConfig,
    }),
    [customConfig],
  );

  // 模态框状态
  const modalState = useMemo<ModalState>(
    () => ({
      isOpen: isModalOpen,
      source: openSource,
      openCount,
      currentWalletId,
      openTimestamp,
    }),
    [isModalOpen, openSource, openCount, currentWalletId, openTimestamp],
  );

  // 防止页面滚动
  const preventBodyScroll = useCallback(() => {
    if (typeof window === 'undefined' || !config.preventBodyScroll) return;

    if (!bodyScrollRef.current) {
      bodyScrollRef.current = {
        original: document.body.style.overflow,
        overflow: document.body.style.overflow,
      };
    }

    document.body.style.overflow = 'hidden';
  }, [config.preventBodyScroll]);

  // 恢复页面滚动
  const restoreBodyScroll = useCallback(() => {
    if (typeof window === 'undefined' || !bodyScrollRef.current) return;

    document.body.style.overflow = bodyScrollRef.current.original;
    bodyScrollRef.current = null;
  }, []);

  // 打开模态框
  const open = useCallback(() => {
    openModal();
    setOpenSource('default');
    setOpenCount((prev) => prev + 1);
    setOpenTimestamp(Date.now());
  }, [openModal]);

  // 从特定来源打开模态框
  const openWithSource = useCallback(
    (source: string) => {
      openModal();
      setOpenSource(source);
      setOpenCount((prev) => prev + 1);
      setOpenTimestamp(Date.now());
    },
    [openModal],
  );

  // 关闭模态框
  const close = useCallback(() => {
    closeModal();
    setOpenSource(null);
    setCurrentWalletId(null);
  }, [closeModal]);

  // 强制关闭模态框（忽略配置）
  const forceClose = useCallback(() => {
    closeModal();
    setOpenSource(null);
    setCurrentWalletId(null);
  }, [closeModal]);

  // 切换模态框状态
  const toggle = useCallback(() => {
    if (isModalOpen) {
      close();
    } else {
      open();
    }
  }, [isModalOpen, open, close]);

  // 设置配置
  const setConfig = useCallback((newConfig: Partial<ModalConfig>) => {
    setCustomConfig((prev: any) => ({ ...prev, ...newConfig }));
  }, []);

  // 处理 ESC 键关闭
  useEffect(() => {
    if (!config.closeOnEscape || typeof window === 'undefined') return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isModalOpen) {
        close();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [config.closeOnEscape, isModalOpen, close]);

  // 处理点击外部关闭
  useEffect(() => {
    if (!config.closeOnOutsideClick || typeof window === 'undefined') return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      // 检查点击是否在模态框外部
      if (isModalOpen && target && !target.closest('.btc-modal-container')) {
        close();
      }
    };

    if (isModalOpen) {
      // 延迟添加监听器，避免立即触发
      const timeoutId = setTimeout(() => {
        window.addEventListener('mousedown', handleClickOutside);
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [config.closeOnOutsideClick, isModalOpen, close]);

  // 处理页面滚动
  useEffect(() => {
    if (isModalOpen) {
      preventBodyScroll();
    } else {
      restoreBodyScroll();
    }

    return restoreBodyScroll;
  }, [isModalOpen, preventBodyScroll, restoreBodyScroll]);

  return {
    isOpen: isModalOpen,
    open,
    close,
    toggle,
    openWithSource,
    forceClose,
    openSource,
    openCount,
    config,
    setConfig,
    modalState,
  };
}
