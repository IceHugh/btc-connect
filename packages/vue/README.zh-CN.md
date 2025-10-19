# @btc-connect/vue

English | [中文文档](./README.zh-CN.md)

<p align="center">
  <strong>Vue 3 适配器 - 提供组合式API和组件的BTC Connect绑定</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@btc-connect/vue">
    <img src="https://img.shields.io/npm/v/@btc-connect/vue.svg" alt="NPM 版本">
  </a>
  <a href="https://github.com/IceHugh/btc-connect/actions">
    <img src="https://github.com/IceHugh/btc-connect/workflows/CI/badge.svg" alt="CI">
  </a>
  <a href="https://codecov.io/gh/IceHugh/btc-connect">
    <img src="https://codecov.io/gh/IceHugh/btc-connect/branch/main/graph/badge.svg" alt="覆盖率">
  </a>
  <a href="https://bundlephobia.com/result?p=@btc-connect/vue">
    <img src="https://img.shields.io/bundlephobia/minzip/@btc-connect/vue.svg" alt="包大小">
  </a>
</p>

## 概述

`@btc-connect/vue` 为BTC Connect提供Vue 3特定的绑定，提供响应式的比特币钱包功能集成方式。它包含组合式函数、组件和插件系统，实现无缝的钱包集成。

## 特性

- 🎯 **Vue 3 组合式函数**: 使用Composition API进行响应式钱包状态管理
- 📦 **插件系统**: 便于应用集成的Vue插件
- 🎨 **预构建组件**: 即可用的钱包连接UI组件
- ⚡ **响应性**: 为Vue 3的响应式系统构建
- 🔄 **自动重连**: 应用重新加载时自动恢复钱包连接
- 🛡️ **类型安全**: 完整的TypeScript支持和类型定义
- 📱 **SSR兼容**: 支持Nuxt 3的服务器端渲染
- 🎯 **框架优化**: 专为Vue模式设计

## 安装

```bash
npm install @btc-connect/vue
```

**对等依赖**: 确保已安装Vue 3.2+:

```bash
npm install vue
```

## 快速开始

### 插件安装

```typescript
// main.ts
import { createApp } from 'vue'
import { BTCWalletPlugin } from '@btc-connect/vue'
import App from './App.vue'

const app = createApp(App)

// 安装插件
app.use(BTCWalletPlugin, {
  autoConnect: true,
  connectTimeout: 10000,
  theme: 'light'
})

app.mount('#app')
```

### 组件使用

```vue
<template>
  <div>
    <h1>我的比特币应用</h1>
    <ConnectButton theme="light" />
    <WalletModal />

    <!-- 或直接使用组合式函数 -->
    <AccountDisplay />
    <BalanceDisplay />
  </div>
</template>

<script setup lang="ts">
import { ConnectButton, WalletModal } from '@btc-connect/vue'
import AccountDisplay from './components/AccountDisplay.vue'
import BalanceDisplay from './components/BalanceDisplay.vue'
</script>
```

## 核心组件

### ConnectButton

可自定义样式的钱包连接预构建按钮组件。

```vue
<template>
  <ConnectButton
    theme="light"
    size="md"
    variant="select"
    label="连接钱包"
    @connect="handleConnect"
    @disconnect="handleDisconnect"
  />
</template>

<script setup lang="ts">
import { ConnectButton } from '@btc-connect/vue'

const handleConnect = (walletId: string) => {
  console.log('已连接到:', walletId)
}

const handleDisconnect = () => {
  console.log('已断开连接')
}
</script>
```

### VueWalletModal

钱包选择和连接管理的模态框组件。

```vue
<template>
  <div>
    <ConnectButton @click="openModal" />
    <VueWalletModal
      :is-open="isModalOpen"
      theme="light"
      @close="closeModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ConnectButton, VueWalletModal } from '@btc-connect/vue'
import { useWalletModal } from '@btc-connect/vue'

const { isOpen: isModalOpen, open: openModal, close: closeModal } = useWalletModal()
</script>
```

## 组合式函数 API

### useCore

访问核心钱包管理功能。

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

// 监听连接状态
watch(isConnected, (connected) => {
  if (connected) {
    console.log('钱包已连接')
  }
})
</script>
```

### useAccount

获取详细账户和余额信息。

```vue
<template>
  <div v-if="hasAccounts">
    <h3>账户信息</h3>
    <p><strong>地址:</strong> {{ address }}</p>
    <p><strong>公钥:</strong> {{ publicKey }}</p>
    <p><strong>余额:</strong> {{ formattedBalance }}</p>
  </div>
  <div v-else>
    <p>没有可用账户</p>
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

// 每30秒自动刷新
onMounted(() => {
  const interval = setInterval(refreshAccountInfo, 30000)
  onUnmounted(() => clearInterval(interval))
})
</script>
```

### useBalance

专注的余额管理和格式化。

```vue
<template>
  <div>
    <h3>余额信息</h3>
    <div v-if="isLoading">
      加载余额中...
    </div>
    <div v-else-if="error">
      错误: {{ error.message }}
    </div>
    <div v-else>
      <p><strong>总计:</strong> {{ formattedTotal }}</p>
      <p><strong>已确认:</strong> {{ formattedConfirmed }}</p>
      <p><strong>未确认:</strong> {{ formattedUnconfirmed }}</p>
      <button @click="refreshBalance">刷新</button>
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

处理钱包连接操作。

```vue
<template>
  <div>
    <h3>钱包控制</h3>
    <div v-if="availableWallets.length === 0">
      <p>没有可用钱包</p>
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
      断开连接
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
    console.log('已连接到:', walletId)
  } catch (error) {
    console.error('连接失败:', error)
  }
}

const handleDisconnect = async () => {
  try {
    await disconnect()
    console.log('已断开连接')
  } catch (error) {
    console.error('断开连接失败:', error)
  }
}
</script>
```

### useSignature

处理消息和交易签名。

```vue
<template>
  <div>
    <h3>签名操作</h3>
    <div>
      <input
        v-model="message"
        placeholder="输入要签名的消息"
        type="text"
      />
      <button @click="handleSignMessage" :disabled="isSigning || !message">
        {{ isSigning ? '签名中...' : '签名消息' }}
      </button>
    </div>
    <div v-if="signature">
      <p><strong>签名:</strong></p>
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
    console.log('消息已签名:', signature.value)
  } catch (error) {
    console.error('消息签名失败:', error)
  }
}
</script>
```

### useTransactions

处理比特币交易操作。

```vue
<template>
  <div>
    <h3>交易操作</h3>
    <div>
      <input
        v-model="recipientAddress"
        placeholder="接收地址"
        type="text"
      />
      <input
        v-model="amount"
        placeholder="金额（聪）"
        type="number"
      />
      <button
        @click="handleSendBitcoin"
        :disabled="isSending || !recipientAddress || !amount"
      >
        {{ isSending ? '发送中...' : '发送比特币' }}
      </button>
    </div>
    <div v-if="transactionId">
      <p><strong>交易ID:</strong></p>
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
    console.log('交易已发送:', transactionId.value)
  } catch (error) {
    console.error('交易失败:', error)
  }
}
</script>
```

### useWalletModal

控制钱包选择模态框。

```vue
<template>
  <div>
    <button @click="openModal">打开钱包模态框</button>
    <button @click="closeModal">关闭钱包模态框</button>
    <button @click="toggleModal">切换模态框</button>
    <p>模态框 {{ isOpen ? '已打开' : '已关闭' }}</p>
  </div>
</template>

<script setup lang="ts">
import { useWalletModal } from '@btc-connect/vue'

const { isOpen, open, close, toggle } = useWalletModal()
</script>
```

## 高级用法

### 自定义插件配置

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

### 响应式状态管理

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

### 错误处理

```vue
<template>
  <div>
    <WalletActions />
    <div v-if="error" class="error-message">
      <h3>错误</h3>
      <p>{{ error.message }}</p>
      <button @click="clearError">清除错误</button>
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
    console.error('钱包错误:', error.value)
    // 实现错误报告
  }
}

// 监听错误
watch(error, (newError) => {
  if (newError) {
    // 向错误跟踪服务报告
    trackError(newError, {
      component: 'WalletActions',
      timestamp: new Date().toISOString()
    })
  }
})
</script>
```

## 服务器端渲染 (SSR)

Vue适配器完全兼容Nuxt 3等SSR框架。

### Nuxt 3 插件配置

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

### 仅客户端组件

```vue
<!-- components/WalletConnectButton.vue -->
<template>
  <ClientOnly>
    <ConnectButton theme="light" />
  </ClientOnly>
</template>

<script setup lang="ts">
import { ConnectButton } from '@btc-connect/vue'
</script>
```

## 性能优化

### 懒加载组件

```vue
<template>
  <div>
    <h2>钱包功能</h2>
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

### 组合式函数记忆化

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

## 最佳实践

1. **插件位置**: 在Vue应用的根目录安装插件
2. **响应式模式**: 利用Vue的响应式系统进行状态管理
3. **错误处理**: 始终将钱包操作包装在try-catch块中
4. **加载状态**: 操作期间显示适当的加载状态
5. **SSR考虑**: 对钱包依赖的UI使用ClientOnly包装器
6. **性能**: 使用懒加载和计算属性获得最佳性能

## 测试

库提供了测试钱包集成的工具。

```typescript
// tests/components/WalletButton.spec.ts
import { mount } from '@vue/test-utils'
import { createApp } from 'vue'
import { BTCWalletPlugin, createMockManager } from '@btc-connect/vue'

// 模拟钱包管理器
jest.mock('@btc-connect/core', () => ({
  ...jest.requireActual('@btc-connect/core'),
  createWalletManager: jest.fn(() => createMockManager())
}))

describe('ConnectButton', () => {
  it('未连接时渲染连接按钮', () => {
    const app = createApp(ConnectButton)
    const wrapper = mount(app)

    expect(wrapper.text()).toContain('连接钱包')
  })
})
```

## 迁移指南

### 从版本 0.1.x 迁移到 0.2.x

```typescript
// 旧方式（已弃用）
import { installBTCWallet } from '@btc-connect/vue'

installBTCWallet(app, { autoConnect: true })

// 新方式
import { BTCWalletPlugin } from '@btc-connect/vue'

app.use(BTCWalletPlugin, { autoConnect: true })
```

## 贡献

请阅读我们的[贡献指南](../../CONTRIBUTING.zh-CN.md)了解我们的行为准则和提交拉取请求的流程。

## 许可证

本项目采用MIT许可证 - 查看[LICENSE](../../LICENSE)文件了解详情。

## 支持

- 📧 邮箱: support@btc-connect.dev
- 💬 [Discord](https://discord.gg/btc-connect)
- 🐛 [问题反馈](https://github.com/IceHugh/btc-connect/issues)