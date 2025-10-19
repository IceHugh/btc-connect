<template>
  <div
    v-if="isModalOpen"
    ref="backdropRef"
    class="btc-modal-backdrop"
    @click="handleBackdropClick"
    @keydown="handleEscKey"
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <div
      :class="['btc-modal-container', `theme-${theme}`, className]"
      :style="buttonStyles"
      @click.stop
      @keydown="(e) => {
        if (e.key === 'Tab') {
          // 允许Tab键在模态框内导航
          return;
        }
        e.stopPropagation();
      }"
    >
      <!-- Modal header -->
      <div :class="['btc-modal-header', `theme-${theme}`]">
        <h2 class="btc-modal-title">{{ title }}</h2>
        <button
          :class="['btc-modal-close', `theme-${theme}`]"
          @click="closeModal"
          aria-label="Close modal"
        >
          ×
        </button>
      </div>

      <!-- Modal content -->
      <div class="btc-modal-content">
        <ul class="btc-wallet-list">
          <li
            v-for="wallet in walletInfos"
            :key="wallet.id"
            :class="['btc-wallet-item', `theme-${theme}`]"
          >
            <button
              class="btc-wallet-button"
              @click="handleWalletSelect(wallet)"
            >
              <!-- Wallet icon -->
              <div :class="['btc-wallet-icon', `theme-${theme}`]">
                <img
                  v-if="wallet.icon.startsWith('http')"
                  :src="wallet.icon"
                  :alt="wallet.name"
                />
                <span v-else>{{ wallet.name.charAt(0).toUpperCase() }}</span>
              </div>

              <!-- Wallet info -->
              <div class="btc-wallet-info">
                <h3 class="btc-wallet-name">
                  {{ wallet.name }}
                  <span v-if="wallet.recommended"> ⭐</span>
                </h3>
                <p :class="['btc-wallet-description', `theme-${theme}`]">
                  {{ wallet.description }}
                </p>
              </div>

              <!-- Installation status -->
              <div :class="['btc-wallet-status', wallet.installed ? 'installed' : 'not-installed']">
                {{ wallet.installed ? 'Installed' : 'Not Installed' }}
              </div>
            </button>
          </li>
        </ul>
      </div>

      <!-- Modal footer -->
      <div :class="['btc-modal-footer', `theme-${theme}`]">
        <p :class="['btc-disclaimer', `theme-${theme}`]">
          By connecting a wallet, you agree to the Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useConnectWallet, useWalletModal, useWallet } from '../composables';
import { getAllAdapters, ZIndexManager } from '@btc-connect/core';

// Props
interface Props {
  title?: string;
  class?: string;
  style?: Record<string, any>;
  // z-index配置
  zIndex?: number | 'auto' | 'max';
  strategy?: 'fixed' | 'dynamic' | 'custom';
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Select Wallet',
  class: '',
  style: () => ({}),
  zIndex: undefined,
  strategy: undefined,
});

// Composables
const { availableWallets, connect } = useConnectWallet();
const { isModalOpen, closeModal } = useWalletModal();
const { theme, manager } = useWallet();

// State
const backdropRef = ref<HTMLElement>();

// 计算最终的z-index值
const calculatedZIndex = computed(() => {
  // 优先级：组件级配置 > 全局配置 > 默认值
  const componentStrategy = props.strategy || 'fixed';
  const componentZIndex = props.zIndex;

  // 如果组件有配置，直接使用组件配置
  if (props.zIndex !== undefined || props.strategy !== undefined) {
    return ZIndexManager.calculateZIndex(componentStrategy,
      typeof componentZIndex === 'number' ? componentZIndex : undefined);
  }

  // 否则使用全局配置
  const globalConfig = manager?.config.modalConfig;
  if (globalConfig) {
    return ZIndexManager.calculateZIndex(
      globalConfig.strategy || 'fixed',
      typeof globalConfig.zIndex === 'number' ? globalConfig.zIndex : undefined
    );
  }

  // 最后使用默认值
  return ZIndexManager.calculateZIndex();
});

// Computed
const walletInfos = computed(() => {
  const installedSet = new Set(availableWallets.value.map((w: any) => w.id));
  const allAdapters = getAllAdapters();

  return allAdapters.map((adapter) => ({
    id: adapter.id,
    name: adapter.name,
    icon: adapter.icon,
    description: getWalletDescription(adapter.id),
    installed: installedSet.has(adapter.id),
    recommended: ['unisat', 'okx'].includes(adapter.id),
  }));
});

const buttonStyles = computed(() => props.style);

const className = computed(() => props.class);

// Methods
const getWalletDescription = (walletId: string): string => {
  const descriptions: Record<string, string> = {
    unisat: 'Bitcoin wallet for Chrome',
    okx: 'Multi-chain wallet',
    xverse: 'Bitcoin wallet for mobile'
  };
  return descriptions[walletId] || 'Bitcoin wallet';
};

const handleBackdropClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    closeModal();
  }
};

const handleWalletSelect = async (wallet: any) => {
  if (wallet.installed) {
    try {
      await connect(wallet.id);
      closeModal();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  } else {
    // Open wallet download page
    if (wallet.id === 'unisat') {
      window.open('https://unisat.io/download', '_blank');
    } else if (wallet.id === 'okx') {
      window.open('https://www.okx.com/web3', '_blank');
    } else if (wallet.id === 'xverse') {
      window.open('https://www.xverse.app/download', '_blank');
    }
  }
};

const handleEscKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isModalOpen.value) {
    closeModal();
  }
};

// Lifecycle
onMounted(() => {
  // Inject styles with dynamic z-index
  if (typeof document !== 'undefined') {
    const styleId = 'btc-wallet-modal-styles';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    // 基础样式模板
    const baseStyles = `
        .btc-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: ${calculatedZIndex.value} !important;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .btc-modal-container {
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          max-width: 400px;
          max-height: 80vh;
          width: 90vw;
          height: auto;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          color: #333333;
        }

        .btc-modal-container.theme-dark {
          background-color: #1a1a1a;
          color: #ffffff;
        }

        .btc-modal-header {
          padding: 24px 24px 16px;
          border-bottom: 1px solid #e9ecef;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .btc-modal-header.theme-dark {
          border-bottom-color: #333333;
        }

        .btc-modal-title {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
          color: inherit;
        }

        .btc-modal-close {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          padding: 4px;
          color: #666666;
          border-radius: 4px;
          transition: background-color 0.15s ease;
        }

        .btc-modal-close:hover {
          background-color: #f8f9fa;
          color: #333333;
        }

        .btc-modal-close.theme-dark:hover {
          background-color: #2a2a2a;
          color: #ffffff;
        }

        .btc-modal-content {
          flex: 1;
          overflow-y: auto;
          padding: 0 24px;
        }

        .btc-wallet-list {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .btc-wallet-item {
          border: 1px solid #dee2e6;
          border-radius: 8px;
          margin-bottom: 8px;
          transition: all 0.15s ease;
          cursor: pointer;
          background-color: #ffffff;
        }

        .btc-wallet-item:hover {
          border-color: #f7931a;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .btc-wallet-item.theme-dark {
          background-color: #1a1a1a;
          border-color: #404040;
        }

        .btc-wallet-item.theme-dark:hover {
          border-color: #f7931a;
          background-color: #2a2a2a;
        }

        .btc-wallet-item:last-child {
          margin-bottom: 0;
        }

        .btc-wallet-button {
          width: 100%;
          padding: 16px;
          border: none;
          background: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 16px;
          font-family: inherit;
          font-size: 14px;
          color: inherit;
          text-align: left;
        }

        .btc-wallet-icon {
          width: 32px;
          height: 32px;
          border-radius: 4px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f8f9fa;
        }

        .btc-wallet-icon img {
          width: 24px;
          height: 24px;
          object-fit: contain;
        }

        .btc-wallet-icon.theme-dark {
          background-color: #2a2a2a;
        }

        .btc-wallet-info {
          flex: 1;
          min-width: 0;
        }

        .btc-wallet-name {
          font-weight: 500;
          margin: 0 0 4px 0;
          color: inherit;
        }

        .btc-wallet-description {
          font-size: 12px;
          color: #666666;
          margin: 0;
        }

        .btc-wallet-description.theme-dark {
          color: #cccccc;
        }

        .btc-wallet-status {
          font-size: 12px;
          padding: 4px 8px;
          border-radius: 9999px;
          font-weight: 500;
        }

        .btc-wallet-status.installed {
          background-color: #22c55e;
          color: white;
        }

        .btc-wallet-status.not-installed {
          background-color: #e9ecef;
          color: #666666;
        }

        .btc-wallet-status.not-installed.theme-dark {
          background-color: #3a3a3a;
          color: #cccccc;
        }

        .btc-modal-footer {
          padding: 16px 24px 24px;
          border-top: 1px solid #e9ecef;
        }

        .btc-modal-footer.theme-dark {
          border-top-color: #333333;
        }

        .btc-disclaimer {
          font-size: 12px;
          color: #666666;
          text-align: center;
          margin: 0;
          line-height: 1.5;
        }

        .btc-disclaimer.theme-dark {
          color: #cccccc;
        }

        @media (max-width: 480px) {
          .btc-modal-container {
            width: 100vw;
            height: 100vh;
            max-width: none;
            max-height: none;
            border-radius: 0;
          }

          .btc-modal-header {
            padding: 16px;
          }

          .btc-modal-content {
            padding: 0 16px;
          }

          .btc-modal-footer {
            padding: 16px;
          }
        }

        @keyframes btc-modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .btc-modal-container {
          animation: btc-modalFadeIn 0.3s ease-out;
        }
      `;

    styleElement.textContent = baseStyles;
  }

  // Add ESC key listener
  document.addEventListener('keydown', handleEscKey);

  // Prevent background scroll
  document.body.style.overflow = 'hidden';
});

onUnmounted(() => {
  // Remove ESC key listener
  document.removeEventListener('keydown', handleEscKey);

  // Restore background scroll
  document.body.style.overflow = '';
});

// Watch modal state changes
watch(isModalOpen, (newValue) => {
  if (!newValue) {
    document.body.style.overflow = '';
  } else {
    document.body.style.overflow = 'hidden';
  }
});

// Watch z-index changes and update styles
watch(calculatedZIndex, (newZIndex) => {
  if (typeof document !== 'undefined') {
    const styleElement = document.getElementById('btc-wallet-modal-styles') as HTMLStyleElement;
    if (styleElement) {
      const currentStyles = styleElement.textContent || '';
      const updatedStyles = currentStyles.replace(
        /z-index:\s*\d+\s*!important;/g,
        `z-index: ${newZIndex} !important;`
      );
      styleElement.textContent = updatedStyles;
    }
  }
});
</script>

<style scoped>
/* Component styles injected via JavaScript */
</style>