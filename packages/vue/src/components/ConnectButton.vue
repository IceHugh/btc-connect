<template>
  <!-- Connected state -->
  <div
    v-if="isConnected && currentAccount?.address"
    ref="containerRef"
    :class="['btc-connected-status', `theme-${theme}`]"
    :style="buttonStyles"
    @click="toggleDropdown"
    role="button"
    tabindex="0"
    @keydown="(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleDropdown();
      }
    }"
  >
    <!-- Balance display section -->
    <div class="btc-balance-section">
      <p class="btc-balance-amount">
        {{ formatBTCBalance(balance?.total || 0) }}<span class="btc-balance-unit">BTC</span>
      </p>
    </div>

    <!-- Address display section -->
    <button
      :class="['btc-address-section', `theme-${theme}`]"
      @click.stop="copyAddress"
      :title="currentAccount.address"
      type="button"
      :aria-label="`Copy address: ${currentAccount.address}`"
    >
      <svg
        v-if="copied"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="btc-copied-icon"
        aria-label="Copied"
      >
        <title>Copied</title>
        <path
          d="M20 6L9 17l-5-5"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <p v-else class="btc-address-text">
        {{ formatAddressShort(currentAccount.address, 4) }}
      </p>
    </button>

    <!-- Dropdown menu -->
    <div
      v-if="showDropdown"
      ref="dropdownRef"
      :class="['btc-dropdown', `theme-${theme}`]"
    >
      <button class="btc-dropdown-item" @click.stop="handleDisconnect">
        Disconnect
      </button>
    </div>
  </div>

  <!-- Connect button -->
  <button
    v-else
    :class="['btc-connect-button', `theme-${theme}`, className]"
    :style="buttonStyles"
    @click="handleConnect"
    :disabled="disabled"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 48 48"
      class="btc-bitcoin-icon"
      aria-label="Bitcoin"
      role="img"
    >
      <title>Bitcoin</title>
      <path fill="none" d="M0 0h48v48H0z" />
      <path
        d="M42 36v2c0 2.21-1.79 4-4 4H10c-2.21 0-4-1.79-4-4V10c0-2.21 1.79-4 4-4h28c2.21 0 4 1.79 4 4v2H24c-2.21 0-4 1.79-4 4v16c0 2.21 1.79 4 4 4h18zm-18-4h20V16H24v16zm8-5c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"
      />
    </svg>
    {{ label }}
  </button>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useWallet, useWalletModal, useBalance } from '../composables';
import { formatAddressShort, formatBTCBalance } from '../utils';

// Props
interface Props {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'select' | 'button' | 'compact';
  label?: string;
  disabled?: boolean;
  class?: string;
  style?: Record<string, any>;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  variant: 'select',
  label: 'Connect',
  disabled: false,
  class: '',
  style: () => ({}),
});

// Composables
const { currentAccount, isConnected, disconnect, theme } = useWallet();
const { balance } = useBalance(); // Use dedicated balance composable
const { openModal } = useWalletModal();

// State
const showDropdown = ref(false);
const copied = ref(false);
const copiedTimer = ref<NodeJS.Timeout | null>(null);
const containerRef = ref<HTMLElement>();
const dropdownRef = ref<HTMLElement>();

// Computed
const buttonStyles = computed(() => {
  const styles: Record<string, any> = { ...props.style };

  if (props.size === 'sm') {
    styles.minHeight = '32px';
    styles.padding = '4px 12px';
    styles.fontSize = '12px';
  } else if (props.size === 'lg') {
    styles.minHeight = '48px';
    styles.padding = '12px 24px';
    styles.fontSize = '16px';
  }

  return styles;
});

const className = computed(() => props.class);

// Methods
const handleConnect = () => {
  if (props.disabled) return;
  openModal();
};

const handleDisconnect = async () => {
  showDropdown.value = false;
  disconnect?.();
};

const copyAddress = async () => {
  if (!currentAccount.value?.address) return;

  try {
    await navigator.clipboard.writeText(currentAccount.value.address);
    copied.value = true;

    // Clear previous timer
    if (copiedTimer.value) {
      clearTimeout(copiedTimer.value);
    }

    // Set new timer
    copiedTimer.value = setTimeout(() => {
      copied.value = false;
    }, 1200);
  } catch (error) {
    console.error('Failed to copy address:', error);
  }
};

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const handleOutsideClick = (event: MouseEvent) => {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    showDropdown.value = false;
  }
};

// Lifecycle
onMounted(() => {
  // Inject styles
  if (typeof document !== 'undefined') {
    const styleId = 'btc-connect-button-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .btc-connect-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 500;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          background-color: #ffffff;
          color: #333333;
          cursor: pointer;
          transition: all 0.15s ease;
          box-sizing: border-box;
          user-select: none;
          min-height: 40px;
        }

        .btc-connect-button:hover:not(:disabled) {
          background-color: #f8f9fa;
          border-color: #adb5bd;
        }

        .btc-connect-button:focus {
          outline: none;
          box-shadow: 0 0 0 2px #f7931a;
        }

        .btc-connect-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btc-connect-button.theme-dark {
          background-color: #1a1a1a;
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.1);
        }

        .btc-connect-button.theme-dark:hover:not(:disabled) {
          background-color: #2a2a2a;
          border-color: rgba(255, 255, 255, 0.2);
        }

        .btc-bitcoin-icon {
          width: 18px;
          height: 18px;
          fill: #f7931a;
          flex-shrink: 0;
        }

        .btc-connected-status {
          display: flex;
          align-items: center;
          position: relative;
          justify-content: space-between;
          gap: 8px;
          padding: 4px;
          min-width: 160px;
          height: 40px;
          border-radius: 8px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          cursor: pointer;
          transition: all 0.15s ease;
          box-sizing: border-box;
          font-size: 12px;
        }

        .btc-connected-status.theme-dark {
          background-color: #2a2a2a;
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .btc-connected-status.theme-light {
          background-color: #ffffff;
          color: #333333;
          border: 1px solid rgba(0, 0, 0, 0.1);
        }

        .btc-connected-status:hover {
          opacity: 0.9;
        }

        .btc-balance-section {
          flex: 1;
          text-align: center;
          min-width: 0;
        }

        .btc-balance-amount {
          font-size: 12px;
          font-weight: 600;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .btc-balance-unit {
          font-weight: 600;
          color: #f7931a;
          margin-left: 2px;
        }

        .btc-address-section {
          width: 48px;
          height: 24px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          background-color: #e9ecef;
          border: 1px solid #dee2e6;
          transition: all 0.15s ease;
          overflow: hidden;
          padding: 0 6px;
          flex-shrink: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 10px;
          font-weight: 500;
          color: #333333;
          box-sizing: border-box;
          user-select: none;
        }

        .btc-address-section:hover {
          background-color: #f8f9fa;
          border-color: #adb5bd;
        }

        .btc-address-section:focus {
          outline: none;
          box-shadow: 0 0 0 2px #f7931a;
        }

        .btc-address-section.theme-dark {
          background-color: #3a3a3a;
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.1);
        }

        .btc-address-section.theme-dark:hover {
          background-color: #4a4a4a;
          border-color: rgba(255, 255, 255, 0.2);
        }

        /* Keep backward compatibility */
        .btc-connected-status.theme-dark .btc-address-section {
          background-color: #3a3a3a;
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.1);
        }

        .btc-connected-status.theme-dark .btc-address-section:hover {
          background-color: #4a4a4a;
          border-color: rgba(255, 255, 255, 0.2);
        }

        .btc-address-text {
          font-size: 10px;
          font-weight: 500;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .btc-copied-icon {
          color: #22c55e;
          pointer-events: none;
        }

        .btc-connected-status .btc-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          z-index: 1000;
          width: auto;
          min-width: 120px;
          max-width: 200px;
          border-radius: 8px;
          padding: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          border: 1px solid #e9ecef;
          background-color: #ffffff;
          user-select: none;
        }

        .btc-connected-status .btc-dropdown.theme-dark {
          background-color: #2a2a2a;
          border-color: #404040;
          color: #ffffff;
        }

        .btc-dropdown-item {
          width: 100%;
          appearance: none;
          border: none;
          border-radius: 4px;
          padding: 8px 12px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.15s ease;
          background-color: transparent;
          color: inherit;
          text-align: left;
          font-family: inherit;
          font-size: inherit;
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
        }

        .btc-dropdown-item:hover {
          background-color: #f8f9fa;
        }

        .btc-connected-status .btc-dropdown.theme-dark .btc-dropdown-item:hover {
          background-color: #3a3a3a;
        }

        @media (max-width: 480px) {
          .btc-connect-button,
          .btc-connected-status {
            width: 100%;
            min-width: auto;
            max-width: 98vw;
          }

          .btc-dropdown {
            max-width: 100%;
            width: auto;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Add outside click listener
  document.addEventListener('click', handleOutsideClick);
});

onUnmounted(() => {
  // Clear timer
  if (copiedTimer.value) {
    clearTimeout(copiedTimer.value);
  }

  // Remove outside click listener
  document.removeEventListener('click', handleOutsideClick);
});

// Watch dropdown state, clear copy status when closed
watch(showDropdown, (newValue) => {
  if (!newValue && copied.value) {
    copied.value = false;
  }
});
</script>

<style scoped>
/* Component styles injected via JavaScript */
</style>
