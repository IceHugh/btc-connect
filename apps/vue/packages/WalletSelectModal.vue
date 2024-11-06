<template>
  <Teleport to="body" v-if="visible">
    <div class="modal-container" :style="{ zIndex }">
      <div class="modal-overlay" :class="{ 'dark': theme === 'dark' }" @click="handleClose"></div>
      <div class="modal-content" :class="[className, { 'dark': theme === 'dark' }]">
        <div class="modal-header">
          <h2 class="modal-title">Select Wallet</h2>
          <button @click="handleClose" class="close-button" aria-label="Close modal">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="close-icon">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div
            v-for="wallet in wallets"
            :key="wallet.id"
            @click="() => clickHandler(wallet.id, wallet.installed)"
            class="wallet-item"
            :class="{ 'not-installed': !wallet.installed }"
            :tabindex="wallet.installed ? 0 : -1"
            :aria-disabled="!wallet.installed"
          >
            <div v-if="loading" class="loading-overlay" aria-live="polite" aria-atomic="true">
              <span class="sr-only">Loading</span>
              <svg class="loading-icon" viewBox="0 0 50 50" aria-hidden="true">
                <circle cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
              </svg>
            </div>
            <img :src="wallet.logo" :alt="`${wallet.name} logo`" class="wallet-logo" />
            <span class="wallet-name">{{ wallet.name }}</span>
            <span v-if="!wallet.installed" class="not-installed-text">Not Installed</span>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { toRefs } from 'vue';
import { BtcConnectorId } from 'btc-connect-core';

interface Wallet {
  id: BtcConnectorId;
  name: string;
  logo: string;
  installed: boolean;
}

interface Props {
  visible: boolean;
  loading?: boolean;
  className?: string;
  zIndex?: number;
  theme: string;
  wallets: Wallet[];
}

const props = withDefaults(defineProps<Props>(), {
  zIndex: 100,
  theme: 'light',
  loading: false,
  wallets: () => [],
});

const { loading } = toRefs(props);

const emit = defineEmits<{
  (e: 'click', id: BtcConnectorId): void;
  (e: 'close'): void;
}>();

const handleClose = () => {
  emit('close');
};

const clickHandler = async (id: BtcConnectorId, installed: boolean) => {
  if (loading.value || !installed) return;
  try {
    emit('click', id);
  } catch (error) {
    throw error;
  }
};
</script>

<style scoped>
.modal-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
}

.modal-overlay.dark {
  background: rgba(0, 0, 0, 0.6);
}

.modal-content {
  position: relative;
  width: 90%;
  max-width: 360px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transform: translateY(20px);
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
  animation: modalAppear 0.3s forwards;
}

.modal-content.dark {
  background: #1a1a1a;
  color: #f0f0f0;
}

@keyframes modalAppear {
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-content.dark .modal-header {
  border-bottom-color: #333;
}

.modal-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}

.close-button {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  transition: transform 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  transform: scale(1.1);
}

.close-icon {
  width: 20px;
  height: 20px;
  color: #666;
}

.modal-content.dark .close-icon {
  color: #999;
}

.modal-body {
  padding: 20px;
  max-height: calc(70vh - 60px);
  overflow-y: auto;
}

.wallet-item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  background: #f5f5f5;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.modal-content.dark .wallet-item {
  background: #2a2a2a;
}

.wallet-item:hover:not(.not-installed) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.wallet-item:focus-visible {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

.wallet-logo {
  width: 32px;
  height: 32px;
  object-fit: contain;
  margin-right: 12px;
}

.wallet-name {
  font-weight: 500;
  flex-grow: 1;
}

.not-installed-text {
  font-size: 0.75rem;
  color: #ff6b6b;
  margin-left: auto;
}

.not-installed {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content.dark .loading-overlay {
  background: rgba(26, 26, 26, 0.8);
}

.loading-icon {
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
}

.loading-icon circle {
  stroke: #007bff;
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}

@media (max-width: 480px) {
  .modal-content {
    width: 95%;
  }

  .wallet-item {
    padding: 10px;
  }

  .wallet-logo {
    width: 28px;
    height: 28px;
  }
}
</style>
