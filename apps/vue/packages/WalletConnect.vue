<template>
  <div>
    <button
      @click="handleConnect"
      v-if="!connected"
      :class="['wallet-button', 'connect-button']"
    >
      {{ props.text.connectText }}
    </button>
    <WalletSelectModal
      v-if="!connected"
      :theme="theme"
      :class="props.ui.modalClass"
      :zIndex="props.ui?.modalZIndex"
      :title="props.text.modalTitle"
      @close="handlerClose"
      :visible="modalVisible"
      :wallets="wallets"
      :loading="loading"
      @click="walletSelect"
    />
    <slot v-else>
      <button
        @click="handlerDisconnect"
        :class="['wallet-button', 'disconnect-button']"
      >
        <span class="address">{{ hideStr(address, 4, '***') }}</span>
      </button>
    </slot>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch, withDefaults } from 'vue';
import WalletSelectModal from './WalletSelectModal.vue';
import { hideStr } from './utils';
import BtcWalletConnect from 'btc-connect-core';
import { useWalletStore } from './store';
import { BtcWalletConnectConfig } from './type';
import { BtcConnectorId, Network } from 'btc-connect-core';

interface WalletConnectProps {
  config?: BtcWalletConnectConfig;
  theme?: 'light' | 'dark';
  ui?: {
    connectClass?: string;
    disconnectClass?: string;
    modalClass?: string;
    modalZIndex?: number;
  };
  text?: {
    connectText?: string;
    disconnectText?: string;
    modalTitle?: string;
  };
  message?: string;
  children?: any;
}

const loading = ref(false);
const timer = ref<any>(null);

// Use withDefaults to define default prop values
const props = withDefaults(defineProps<WalletConnectProps>(), {
  config: () => ({
    defaultNetwork: Network.LIVENET,
    message: '',
  }),
  theme: 'dark',
  ui: () => ({ modalClass: '', modalZIndex: 100 }),
  text: () => ({
    connectText: 'Connect',
    disconnectText: 'Disconnect',
    modalTitle: 'Select Wallet',
  }),
});

const emits = defineEmits<{
  (e: 'connect-success', btcWallet: BtcWalletConnect): void;
  (e: 'connect-error', error: any): void;
  (e: 'disconnect-success'): void;
  (e: 'disconnect-error', error: any): void;
}>();

const {
  connect,
  modalVisible,
  setModalVisible,
  connectors,
  connected,
  address,
  init,
  disconnect,
  btcWallet,
  switchConnector,
} = useWalletStore();


const handleConnect = () => {
  setModalVisible(true);
};

const walletSelect = async (id: BtcConnectorId) => {
  switchConnector(id);
  loading.value = true;
  try {
    await connect();
    if (btcWallet) {
      emits('connect-success', btcWallet as any);
      setModalVisible(false);
    }
  } catch (error) {
    emits('connect-error', error);
  } finally {
    loading.value = false;
  }
  if (timer.value) clearTimeout(timer.value);
  timer.value = setTimeout(() => {
    loading.value = false;
  }, 10000);
};

const handlerClose = () => {
  setModalVisible(false);
  loading.value = false;
};

const handlerDisconnect = async () => {
  try {
    emits('disconnect-success');
    await disconnect();
  } catch (error) {
    emits('disconnect-error', error);
  }
};

const wallets = computed(
  () =>
    connectors.value?.map((c) => ({
      id: c.id,
      name: c.name,
      logo: c.logo,
      installed: c.installed,
    })) || [],
);

// Watch for config prop changes
watch(
  () => props.config,
  (newConfig) => {
    init({
      networkForce: newConfig?.networkForce,
      defaultNetwork: newConfig?.defaultNetwork,
      message: newConfig?.message,
    });
  },
  { immediate: true, deep: true },
);
</script>
<style>
:root {
  --border-color: #d1d5db;
  --hover-border-color: #eab308;
  --connect-gradient: linear-gradient(to right, #3b82f6, #10b981);
  --disconnect-gradient: linear-gradient(to right, #3b82f6, #10b981);
}

:root[data-theme='dark'] {
  --border-color: #4b5563;
  --connect-gradient: linear-gradient(to right, #ec4899, #8b5cf6);
  --disconnect-gradient: linear-gradient(to right, #ec4899, #8b5cf6);
}
</style>
<style scoped>
.wallet-button {
  height: 40px;
  padding: 0 16px;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 1px solid var(--border-color);
}

.wallet-button:hover {
  border-color: var(--hover-border-color);
}

.connect-button {
  background: var(--connect-gradient);
  color: transparent;
  background-clip: text;
  -webkit-background-clip: text;
}

.disconnect-button {
  background: var(--disconnect-gradient);
  color: transparent;
  background-clip: text;
  -webkit-background-clip: text;
}

.disconnect-button .address {
  margin-right: 4px;
}
</style>
