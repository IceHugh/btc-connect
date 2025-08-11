## @btc-connect/vue

Vue 3 适配库，提供组件与组合式 API，基于 Vite 7 仅输出 ES Module。

### 安装

使用工作区依赖，无需单独安装。外部仅需安装 `vue@^3.5.18`。

### 使用示例

```ts
// main.ts (SPA/CSR)
import { createApp } from 'vue'
import App from './App.vue'
import { installBTCWallet, BTCWalletPlugin } from '@btc-connect/vue'

const app = createApp(App)
// 方式一：函数式安装（保持向后兼容）
installBTCWallet(app, { autoConnect: true })

// 方式二：SSR 友好的插件写法
// app.use(BTCWalletPlugin, { autoConnect: true })

app.mount('#app')
```

```vue
<!-- App.vue -->
<template>
  <BTCConnectButton theme="light" />
  <WalletModal />
  
  <!-- 或者使用组合式 API -->
  <!-- const { connect } = useConnectWallet() -->
  <!-- const { address } = useAccount() -->
  <!-- const { signMessage } = useSignature() -->
  <!-- const { sendBitcoin } = useTransactions() -->
  <!-- const { isModalOpen, openModal, closeModal } = useWalletModal() -->
</template>

<script setup lang="ts">
import { BTCConnectButton, WalletModal } from '@btc-connect/vue'
</script>
```

### 导出

- 组件：`BTCConnectButton`、`WalletModal`
- 组合式：`useAccount`、`useAutoConnect`、`useBalance`、`useSignature`、`useTransactions`、`useWalletModal`
- 上下文：`createWalletProvider`、`useWalletContext`、`installBTCWallet`、`BTCWalletPlugin`
