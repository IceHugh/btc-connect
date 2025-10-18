# @btc-connect/vue

[中文文档](./README.zh-CN.md) | English

<p align="center">
  <strong>Vue 3 adapter with Composables and Components</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@btc-connect/vue">
    <img src="https://img.shields.io/npm/v/@btc-connect/vue.svg" alt="NPM Version">
  </a>
  <a href="https://github.com/IceHugh/btc-connect/actions">
    <img src="https://github.com/IceHugh/btc-connect/workflows/CI/badge.svg" alt="CI">
  </a>
  <a href="https://codecov.io/gh/IceHugh/btc-connect">
    <img src="https://codecov.io/gh/IceHugh/btc-connect/branch/main/graph/badge.svg" alt="Coverage">
  </a>
  <a href="https://bundlephobia.com/result?p=@btc-connect/vue">
    <img src="https://img.shields.io/bundlephobia/minzip/@btc-connect/vue.svg" alt="Bundle Size">
  </a>
</p>

## Overview

`@btc-connect/vue` provides Vue 3 specific bindings for BTC Connect, offering a reactive way to integrate Bitcoin wallet functionality into Vue applications. It includes composables, components, and a plugin system for seamless wallet integration with Vue's Composition API.

## Features

- 🎯 **Vue 3 Composables**: Reactive wallet state management with Composition API
- 📦 **Plugin System**: Vue plugin for easy application integration
- 🎨 **Pre-built Components**: Ready-to-use wallet connection UI components
- ⚡ **Reactivity**: Built for Vue 3's reactivity system
- 🔄 **Auto Reconnection**: Automatic wallet reconnection on app reload
- 🛡️ **Type Safe**: Full TypeScript support with proper type definitions
- 📱 **SSR Compatible**: Server-side rendering support with Nuxt 3
- 🎯 **Framework Optimized**: Designed specifically for Vue patterns

## Installation

```bash
npm install @btc-connect/vue
```

**Peer Dependencies**: Ensure you have Vue 3.2+ installed:

```bash
npm install vue
```

## Quick Start

### Plugin Installation

```typescript
// main.ts
import { createApp } from 'vue'
import { BTCWalletPlugin } from '@btc-connect/vue'
import App from './App.vue'

const app = createApp(App)

// Install the plugin
app.use(BTCWalletPlugin, {
  autoConnect: true,
  connectTimeout: 10000,
  theme: 'light'
})

app.mount('#app')
```

### Component Usage

```vue
<template>
  <div>
    <h1>My Bitcoin App</h1>
    <BTCConnectButton theme="light" />
    <WalletModal />

    <!-- Or use composables directly -->
    <AccountDisplay />
    <BalanceDisplay />
  </div>
</template>

<script setup lang="ts">
import { BTCConnectButton, WalletModal } from '@btc-connect/vue'
import AccountDisplay from './components/AccountDisplay.vue'
import BalanceDisplay from './components/BalanceDisplay.vue'
</script>
```

## Core Components

### BTCConnectButton

A pre-built button component for wallet connection with customizable styling.

```vue
<template>
  <BTCConnectButton
    theme="light"
    size="md"
    variant="select"
    label="Connect Wallet"
    @connect="handleConnect"
    @disconnect="handleDisconnect"
  />
</template>

<script setup lang="ts">
import { BTCConnectButton } from '@btc-connect/vue'

const handleConnect = (walletId: string) => {
  console.log('Connected to:', walletId)
}

const handleDisconnect = () => {
  console.log('Disconnected')
}
</script>
```

### VueWalletModal

A modal component for wallet selection and connection management.

```vue
<template>
  <div>
    <BTCConnectButton @click="openModal" />
    <VueWalletModal
      :is-open="isModalOpen"
      theme="light"
      @close="closeModal"
    />
  </div>
</template>

<script setup lang="ts">
import { BTCConnectButton, VueWalletModal } from '@btc-connect/vue'
import { useWalletModal } from '@btc-connect/vue'

const { isOpen: isModalOpen, open: openModal, close: closeModal } = useWalletModal()
</script>
```

## Composables API

### useCore

Access core wallet management functionality.

```typescript
<script setup lang="ts">
import { useCore } from '@btc-connect/vue'

const {
  manager,
  state,
  isConnected,
  isConnecting,
  currentWallet,
  availableWallets,
  theme,
  connect,
  disconnect,
  switchWallet
} = useCore()

// Watch connection status
watch(isConnected, (connected) => {
  if (connected) {
    console.log('Wallet connected')
  }
})
</script>
```

### useAccount

Get detailed account and balance information.

```vue
<template>
  <div v-if="hasAccounts">
    <h3>Account Information</h3>
    <p><strong>Address:</strong> {{ address }}</p>
    <p><strong>Public Key:</strong> {{ publicKey }}</p>
    <p><strong>Balance:</strong> {{ formattedBalance }}</p>
  </div>
  <div v-else>
    <p>No accounts available</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAccount } from '@btc-connect/vue'

const {
  accounts,
  currentAccount,
  hasAccounts,
  address,
  publicKey,
  balance,
  refreshAccountInfo
} = useAccount()

const formattedBalance = computed(() => {
  if (!balance.value) return '0 BTC'
  return `${(balance.value / 100000000).toFixed(8)} BTC`
})

// Auto-refresh every 30 seconds
onMounted(() => {
  const interval = setInterval(refreshAccountInfo, 30000)
  onUnmounted(() => clearInterval(interval))
})
</script>
```

### useBalance

Focused balance management with formatting.

```vue
<template>
  <div>
    <h3>Balance Information</h3>
    <div v-if="isLoading">
      Loading balance...
    </div>
    <div v-else-if="error">
      Error: {{ error.message }}
    </div>
    <div v-else>
      <p><strong>Total:</strong> {{ formattedTotal }}</p>
      <p><strong>Confirmed:</strong> {{ formattedConfirmed }}</p>
      <p><strong>Unconfirmed:</strong> {{ formattedUnconfirmed }}</p>
      <button @click="refreshBalance">Refresh</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBalance } from '@btc-connect/vue'

const {
  balance,
  confirmedBalance,
  unconfirmed,
  totalBalance,
  isLoading,
  error,
  refreshBalance
} = useBalance()

const formatSats = (amount: number | null) => {
  if (!amount) return '0 sats'
  return amount.toLocaleString()
}

const formattedTotal = computed(() => formatSats(totalBalance.value))
const formattedConfirmed = computed(() => formatSats(confirmedBalance.value))
const formattedUnconfirmed = computed(() => formatSats(unconfirmedBalance.value))
</script>
```

### useConnectWallet

Handle wallet connection operations.

```vue
<template>
  <div>
    <h3>Wallet Controls</h3>
    <div v-if="availableWallets.length === 0">
      <p>No wallets available</p>
    </div>
    <div v-else>
      <button
        v-for="wallet in availableWallets"
        :key="wallet.id"
        @click="handleConnect(wallet.id)"
        :disabled="isConnecting"
      >
        {{ wallet.name }}
      </button>
    </div>
    <button
      v-if="isConnected"
      @click="handleDisconnect"
      :disabled="isConnecting"
    >
      Disconnect
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useConnectWallet } from '@btc-connect/vue'

const {
  connect,
  disconnect,
  switchWallet,
  availableWallets,
  isConnected,
  isConnecting
} = useConnectWallet()

const handleConnect = async (walletId: string) => {
  try {
    await connect(walletId)
    console.log('Connected to:', walletId)
  } catch (error) {
    console.error('Connection failed:', error)
  }
}

const handleDisconnect = async () => {
  try {
    await disconnect()
    console.log('Disconnected')
  } catch (error) {
    console.error('Disconnect failed:', error)
  }
}
</script>
```

### useSignature

Handle message and transaction signing.

```vue
<template>
  <div>
    <h3>Signature Actions</h3>
    <div>
      <input
        v-model="message"
        placeholder="Enter message to sign"
        type="text"
      />
      <button @click="handleSignMessage" :disabled="isSigning || !message">
        {{ isSigning ? 'Signing...' : 'Sign Message' }}
      </button>
    </div>
    <div v-if="signature">
      <p><strong>Signature:</strong></p>
      <code>{{ signature }}</code>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSignature } from '@btc-connect/vue'

const {
  signMessage,
  signPsbt,
  isSigning
} = useSignature()

const message = ref('')
const signature = ref('')

const handleSignMessage = async () => {
  try {
    signature.value = await signMessage(message.value)
    console.log('Message signed:', signature.value)
  } catch (error) {
    console.error('Message signing failed:', error)
  }
}
</script>
```

### useTransactions

Handle Bitcoin transaction operations.

```vue
<template>
  <div>
    <h3>Transaction Actions</h3>
    <div>
      <input
        v-model="recipientAddress"
        placeholder="Recipient address"
        type="text"
      />
      <input
        v-model="amount"
        placeholder="Amount (sats)"
        type="number"
      />
      <button
        @click="handleSendBitcoin"
        :disabled="isSending || !recipientAddress || !amount"
      >
        {{ isSending ? 'Sending...' : 'Send Bitcoin' }}
      </button>
    </div>
    <div v-if="transactionId">
      <p><strong>Transaction ID:</strong></p>
      <code>{{ transactionId }}</code>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTransactions } from '@btc-connect/vue'

const {
  sendBitcoin,
  sendTransaction,
  isSending
} = useTransactions()

const recipientAddress = ref('')
const amount = ref(0)
const transactionId = ref('')

const handleSendBitcoin = async () => {
  try {
    transactionId.value = await sendBitcoin(recipientAddress.value, amount.value)
    console.log('Transaction sent:', transactionId.value)
  } catch (error) {
    console.error('Transaction failed:', error)
  }
}
</script>
```

### useWalletModal

Control the wallet selection modal.

```vue
<template>
  <div>
    <button @click="openModal">Open Wallet Modal</button>
    <button @click="closeModal">Close Wallet Modal</button>
    <button @click="toggleModal">Toggle Modal</button>
    <p>Modal is {{ isOpen ? 'open' : 'closed' }}</p>
  </div>
</template>

<script setup lang="ts">
import { useWalletModal } from '@btc-connect/vue'

const { isOpen, open, close, toggle } = useWalletModal()
</script>
```

## Advanced Usage

### Custom Plugin Configuration

```typescript
// main.ts
import { createApp } from 'vue'
import { BTCWalletPlugin } from '@btc-connect/vue'
import App from './App.vue'

const app = createApp(App)

app.use(BTCWalletPlugin, {
  autoConnect: true,
  connectTimeout: 10000,
  theme: 'light',
  config: {
    walletOrder: ['unisat', 'okx', 'xverse'],
    featuredWallets: ['unisat', 'okx'],
    showTestnet: false,
    showRegtest: false
  }
})

app.mount('#app')
```

### Reactive State Management

```vue
<template>
  <div>
    <ConnectionStatus />
    <WalletInfo />
    <NetworkInfo />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCore, useAccount, useNetwork } from '@btc-connect/vue'

const { state, isConnected } = useCore()
const { currentAccount } = useAccount()
const { network, switchNetwork } = useNetwork()

const connectionStatus = computed(() => {
  return {
    status: state.value.status,
    isConnected: isConnected.value,
    isConnecting: state.value.status === 'connecting',
    hasError: !!state.value.error
  }
})

const walletInfo = computed(() => {
  return {
    wallet: currentWallet.value,
    account: currentAccount.value,
    balance: currentAccount.value?.balance || 0
  }
})
</script>
```

### Error Handling

```vue
<template>
  <div>
    <WalletActions />
    <div v-if="error" class="error-message">
      <h3>Error</h3>
      <p>{{ error.message }}</p>
      <button @click="clearError">Clear Error</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCore } from '@btc-connect/vue'

const { state } = useCore()

const error = computed(() => state.value.error)

const clearError = () => {
  if (error.value) {
    console.error('Wallet error:', error.value)
    // Implement error reporting
  }
}

// Watch for errors
watch(error, (newError) => {
  if (newError) {
    // Report to error tracking service
    trackError(newError, {
      component: 'WalletActions',
      timestamp: new Date().toISOString()
    })
  }
})
</script>
```

## Server-Side Rendering (SSR)

The Vue adapter is fully compatible with SSR frameworks like Nuxt 3.

### Nuxt 3 Plugin Configuration

```typescript
// plugins/btc-connect.client.ts
import { BTCWalletPlugin } from '@btc-connect/vue'

export default defineNuxtPlugin((nuxtApp) => {
  if (process.client) {
    nuxtApp.vueApp.use(BTCWalletPlugin, {
      autoConnect: true,
      connectTimeout: 10000,
      theme: 'light',
      config: {
        walletOrder: ['unisat', 'okx', 'xverse'],
        featuredWallets: ['unisat', 'okx']
      }
    })
  }
})
```

### Client-Side Only Components

```vue
<!-- components/WalletConnectButton.vue -->
<template>
  <ClientOnly>
    <BTCConnectButton theme="light" />
  </ClientOnly>
</template>

<script setup lang="ts">
import { BTCConnectButton } from '@btc-connect/vue'
</script>
```

## Performance Optimization

### Lazy Loading Components

```vue
<template>
  <div>
    <h2>Wallet Features</h2>
    <Suspense>
      <LazyWalletModal />
    </Suspense>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

const LazyWalletModal = defineAsyncComponent(() =>
  import('@btc-connect/vue').then(mod => ({
    default: mod.VueWalletModal
  }))
)
</script>
```

### Composable Memoization

```typescript
// composables/useFormattedBalance.ts
import { computed } from 'vue'
import { useBalance } from '@btc-connect/vue'

export function useFormattedBalance() {
  const { balance, confirmedBalance, unconfirmedBalance } = useBalance()

  const formattedBalance = computed(() => {
    if (!balance.value) return '0 BTC'
    return `${(balance.value / 100000000).toFixed(8)} BTC`
  })

  const formattedConfirmed = computed(() => {
    if (!confirmedBalance.value) return '0 BTC'
    return `${(confirmedBalance.value / 100000000).toFixed(8)} BTC`
  })

  const formattedUnconfirmed = computed(() => {
    if (!unconfirmedBalance.value) return '0 BTC'
    return `${(unconfirmedBalance.value / 100000000).toFixed(8)} BTC`
  })

  return {
    balance,
    confirmedBalance,
    unconfirmedBalance,
    formattedBalance,
    formattedConfirmed,
    formattedUnconfirmed
  }
}
```

## Best Practices

1. **Plugin Placement**: Install the plugin at the root of your Vue application
2. **Reactive Patterns**: Leverage Vue's reactivity system for state management
3. **Error Handling**: Always handle wallet operations in try-catch blocks
4. **Loading States**: Show appropriate loading states during operations
5. **SSR Considerations**: Use ClientOnly wrappers for wallet-dependent UI
6. **Performance**: Use lazy loading and computed properties for optimal performance

## Testing

The library provides utilities for testing your wallet integration.

```typescript
// tests/components/WalletButton.spec.ts
import { mount } from '@vue/test-utils'
import { createApp } from 'vue'
import { BTCWalletPlugin, createMockManager } from '@btc-connect/vue'

// Mock the wallet manager
jest.mock('@btc-connect/core', () => ({
  ...jest.requireActual('@btc-connect/core'),
  createWalletManager: jest.fn(() => createMockManager())
}))

describe('BTCConnectButton', () => {
  it('renders connect button when not connected', () => {
    const app = createApp(BTCConnectButton)
    const wrapper = mount(app)

    expect(wrapper.text()).toContain('Connect Wallet')
  })
})
```

## Migration Guide

### From Version 0.1.x to 0.2.x

```typescript
// Old way (deprecated)
import { installBTCWallet } from '@btc-connect/vue'

installBTCWallet(app, { autoConnect: true })

// New way
import { BTCWalletPlugin } from '@btc-connect/vue'

app.use(BTCWalletPlugin, { autoConnect: true })
```

## Contributing

Please read our [Contributing Guide](../../CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.

## Support

- 📧 Email: support@btc-connect.dev
- 💬 [Discord](https://discord.gg/btc-connect)
- 🐛 [Issues](https://github.com/IceHugh/btc-connect/issues)
