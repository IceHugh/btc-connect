# @btc-connect/vue

[中文文档](./README.zh-CN.md) | English

<p align="center">
  <strong>Vue 3 适配器 - 提供组合式API和组件的BTC Connect绑定</strong>
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

## 概述

`@btc-connect/vue` 为BTC Connect提供Vue 3特定的绑定，提供响应式的比特币钱包功能集成方式。它包含组合式函数、组件和插件系统，实现无缝的钱包集成。

## 特性

- 🎯 **Vue 3 组合式函数**: 为每个功能提供独立的composables，统一访问点
- 📦 **插件系统**: 便于应用集成的Vue插件
- 🎨 **预构建组件**: 即可用的钱包连接UI组件
- ⚡ **响应性**: 为Vue 3的响应式系统构建
- 🔄 **自动重连**: 应用重新加载时自动恢复钱包连接
- 🛡️ **类型安全**: 完整的TypeScript支持和类型定义
- 📱 **SSR兼容**: 支持Nuxt 3的服务器端渲染
- 🎯 **框架优化**: 专为Vue模式设计
- 🛠️ **工具函数**: 内置格式化和验证工具

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
    <ConnectButton />
  </div>
</template>

<script setup lang="ts">
import { ConnectButton } from '@btc-connect/vue'
</script>
```

## 核心组件

### ConnectButton

可自定义样式的钱包连接预构建按钮组件。

**Props:**
- `size?: 'sm' | 'md' | 'lg'` - 按钮大小（默认: 'md'）
- `variant?: 'select' | 'button' | 'compact'` - 显示样式（默认: 'select'）
- `label?: string` - 自定义按钮标签
- `disabled?: boolean` - 禁用按钮（默认: false）
- `theme?: 'light' | 'dark' | 'auto'` - 按钮主题（默认: 'auto'）

### WalletModal

钱包选择和连接管理的模态框组件。

**Props:**
- `theme?: 'light' | 'dark' | 'auto'` - 模态框主题（默认: 'auto'）
- `isOpen?: boolean` - 模态框打开状态（受控模式）
- `onClose?: () => void` - 关闭回调
- `onConnect?: (walletId: string) => void` - 连接回调

## Vue Composables

### useWallet - 统一Composable

主要composable，提供所有钱包功能的访问。

**返回值:**
```typescript
interface UseWalletReturn {
  // 状态（响应式）
  status: Ref<ConnectionStatus>;
  isConnected: Ref<boolean>;
  isConnecting: Ref<boolean>;
  address: Ref<string | undefined>;
  balance: Ref<number | undefined>;
  network: Ref<Network>;
  error: Ref<Error | undefined>;

  // 操作
  connect: (walletId: string) => Promise<AccountInfo[]>;
  disconnect: () => Promise<void>;
  switchWallet: (walletId: string) => Promise<AccountInfo[]>;
  availableWallets: Ref<WalletInfo[]>;

  // 高级
  useWalletEvent: <T extends WalletEvent>(event: T, handler: EventHandler<T>) => UseWalletEventReturn<T>;
  walletModal: UseWalletModalReturn;
  manager: Ref<BTCWalletManager>;
}
```

### useWalletEvent

监听钱包事件的composable，支持自动清理。

**参数:**
- `event: WalletEvent` - 事件类型（'connect', 'disconnect', 'accountChange', 'networkChange', 'error'）
- `handler: EventHandler` - 事件处理函数

**返回值:**
```typescript
interface UseWalletEventReturn<T> {
  on: (handler: EventHandler<T>) => void;
  off: (handler: EventHandler<T>) => void;
  once: (handler: EventHandler<T>) => void;
  clear: () => void;
  eventHistory: Ref<EventHistoryItem[]>;
}
```

### useNetwork

网络管理和切换的composable。

**返回值:**
```typescript
interface UseNetworkReturn {
  network: Ref<Network>;
  switchNetwork: (network: Network) => Promise<void>;
  isSwitching: Ref<boolean>;
}
```

### useTheme

主题管理和切换的composable。

**返回值:**
```typescript
interface UseThemeReturn {
  theme: Ref<ThemeMode>;
  systemTheme: Ref<ThemeMode>;
  effectiveTheme: ComputedRef<ThemeMode>;
  setTheme: (theme: ThemeMode) => void;
  resetTheme: () => void;
}
```

### useWalletModal

全局模态框控制的composable，支持来源追踪。

**返回值:**
```typescript
interface UseWalletModalReturn {
  isOpen: Ref<boolean>;
  theme: ComputedRef<ThemeMode>;
  open: (walletId?: string) => void;
  close: () => void;
  toggle: () => void;
  forceClose: () => void;
  currentWalletId: Ref<string | null>;
  modalSource: Ref<string | null>;
}
```

## API 参考

### 连接管理

```vue
<script setup>
import { useWallet } from '@btc-connect/vue'

const { connect, isConnected, address } = useWallet()

const handleConnect = async () => {
  try {
    await connect('unisat')
    console.log('连接到:', address.value)
  } catch (error) {
    console.error('连接失败:', error)
  }
}
</script>
```

### 事件处理

```vue
<script setup>
import { useWallet } from '@btc-connect/vue'

const { useWalletEvent } = useWallet()

// 监听连接事件
const { on } = useWalletEvent('connect', (accounts) => {
  console.log('钱包已连接:', accounts)
})

// 监听断开连接
const { on: onDisconnect } = useWalletEvent('disconnect', () => {
  console.log('钱包已断开')
})
</script>
```

### 比特币操作

```vue
<script setup>
import { useWallet } from '@btc-connect/vue'

const { signMessage, signPsbt, sendBitcoin } = useWallet()

const handleSignMessage = async () => {
  try {
    const signature = await signMessage('Hello, Bitcoin!')
    console.log('签名:', signature)
  } catch (error) {
    console.error('签名失败:', error)
  }
}
</script>
```

## 高级用法

### Nuxt 3 集成

```typescript
// plugins/btc-connect.client.ts
import { BTCWalletPlugin } from '@btc-connect/vue'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(BTCWalletPlugin, {
    autoConnect: true,
    theme: 'auto'
  })
})
```

```vue
<!-- pages/index.vue -->
<template>
  <div>
    <h1>比特币钱包应用</h1>
    <ClientOnly>
      <ConnectButton />
    </ClientOnly>
  </div>
</template>

<script setup>
import { ConnectButton } from '@btc-connect/vue'
</script>
```

### 自定义主题

```vue
<template>
  <div>
    <ConnectButton theme="dark" />
    <button @click="toggleTheme">切换主题</button>
  </div>
</template>

<script setup>
import { useTheme } from '@btc-connect/vue'

const { theme, setTheme } = useTheme()

const toggleTheme = () => {
  setTheme(theme.value === 'light' ? 'dark' : 'light')
}
</script>
```

### 模态框控制

```vue
<template>
  <div>
    <button @click="openModal">打开钱包模态框</button>
    <button @click="closeModal">关闭模态框</button>
  </div>
</template>

<script setup>
import { useWalletModal } from '@btc-connect/vue'

const { open: openModal, close: closeModal, isOpen } = useWalletModal()
</script>
```

## 最佳实践

1. **插件安装**: 始终在应用初始化时安装BTCWalletPlugin
2. **错误处理**: 将钱包操作包装在try-catch块中
3. **响应性**: 使用响应式refs和computed属性进行UI更新
4. **类型安全**: 利用TypeScript类型获得更好的开发体验
5. **SSR**: 对钱包特定UI使用ClientOnly组件

## 迁移指南

### 从v0.3.x迁移到v0.4.0+

```vue
<!-- 旧方式 -->
<script setup>
import { useCore, useWallet, useWalletEvent } from '@btc-connect/vue'
const { connect } = useCore()
const { address } = useWallet()
useWalletEvent('connect', handler)
</script>

<!-- 新方式 -->
<script setup>
import { useWallet } from '@btc-connect/vue'
const { connect, address, useWalletEvent } = useWallet()
useWalletEvent('connect', handler)
</script>
```

## 贡献

请阅读我们的[贡献指南](../../CONTRIBUTING.md)了解我们的行为准则和提交拉取请求的流程。

## 许可证

本项目采用MIT许可证 - 查看[LICENSE](../../LICENSE)文件了解详情。

## 支持

- 📧 邮箱: support@btc-connect.dev
- 💬 [Discord](https://discord.gg/btc-connect)
- 🐛 [问题反馈](https://github.com/IceHugh/btc-connect/issues)