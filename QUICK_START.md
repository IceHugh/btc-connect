# 🚀 BTC Connect Vue 快速开始指南

> 基于 Vue 3 的比特币钱包连接库 - 5分钟快速集成

## 📋 目录

- [安装](#安装)
- [基础使用](#基础使用)
- [项目配置](#项目配置)
- [示例项目](#示例项目)
- [常见问题](#常见问题)
- [下一步](#下一步)

## 🔧 安装

### 1. 安装包

```bash
# 使用 npm
npm install @btc-connect/vue

# 使用 yarn
yarn add @btc-connect/vue

# 使用 bun
bun add @btc-connect/vue
```

### 2. 环境要求

- **Vue**: >= 3.2.0
- **TypeScript**: >= 5.0 (推荐)
- **Node.js**: >= 18

## 🎯 基础使用

### 1. 插件配置

在 `main.ts` (或你的入口文件) 中配置插件：

```typescript
// main.ts
import { createApp } from 'vue';
import { BTCWalletPlugin } from '@btc-connect/vue';
import App from './App.vue';

const app = createApp(App);

// 安装插件
app.use(BTCWalletPlugin, {
  autoConnect: true,        // 自动重连上次的钱包
  theme: 'auto',           // 跟随系统主题
  connectTimeout: 10000,   // 连接超时时间
  config: {
    // 钱包状态变化回调
    onStateChange: (state) => {
      console.log('Wallet state changed:', state);
    },
    // 错误处理
    onError: (error) => {
      console.error('Wallet error:', error);
    }
  }
});

app.mount('#app');
```

### 2. 在组件中使用

#### 最简单的用法

```vue
<!-- App.vue -->
<template>
  <div>
    <h1>我的比特币应用</h1>
    <ConnectButton @connect="handleConnect" />
  </div>
</template>

<script setup>
import { ConnectButton } from '@btc-connect/vue';

const handleConnect = (walletId) => {
  console.log('✅ 连接成功:', walletId);
};
</script>
```

#### 显示钱包信息

```vue
<template>
  <div>
    <header>
      <h1>BTC Wallet Demo</h1>
      <ConnectButton
        theme="auto"
        @connect="handleConnect"
        @disconnect="handleDisconnect"
      />
    </header>

    <main v-if="isConnected">
      <div class="wallet-info">
        <h2>钱包信息</h2>
        <p><strong>钱包:</strong> {{ currentWallet?.name }}</p>
        <p><strong>地址:</strong> {{ address }}</p>
        <p><strong>余额:</strong> {{ formattedBalance }}</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { ConnectButton, useCore, useWallet, useBalance } from '@btc-connect/vue';
import { formatBTCBalance } from '@btc-connect/vue';

// 使用 Composables
const { isConnected, currentWallet } = useCore();
const { address } = useWallet();
const { balance } = useBalance();

// 计算属性
const formattedBalance = computed(() => {
  if (!balance.value) return '加载中...';
  return formatBTCBalance(balance.value.total);
});

// 事件处理
const handleConnect = (walletId) => {
  console.log('✅ 连接成功:', walletId);
};

const handleDisconnect = () => {
  console.log('🔌 已断开连接');
};
</script>

<style scoped>
.wallet-info {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.wallet-info p {
  margin: 8px 0;
  word-break: break-all;
}
</style>
```

## ⚙️ 项目配置

### TypeScript 配置

确保你的 `tsconfig.json` 包含必要的配置：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["vite/client"]
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Vite 配置

如果你使用 Vite，确保 `vite.config.ts` 包含 Vue 插件：

```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000
  }
});
```

## 🎨 主题定制

### 全局主题

```typescript
app.use(BTCWalletPlugin, {
  theme: 'dark', // 'light' | 'dark' | 'auto'
  config: {
    theme: {
      mode: 'auto',
      followSystem: true,
      colors: {
        primary: '#f7931a', // 比特币橙色
        // 可以自定义更多颜色...
      }
    }
  }
});
```

### 组件级主题

```vue
<template>
  <div>
    <!-- 覆盖全局主题 -->
    <ConnectButton theme="dark" />

    <!-- 自动主题 -->
    <ConnectButton theme="auto" />
  </div>
</template>
```

## 🔧 高级功能

### 1. 程序化控制

```vue
<template>
  <div>
    <button @click="openModal">打开钱包选择</button>
    <button @click="closeModal">关闭模态框</button>

    <p>模态框状态: {{ isOpen ? '打开' : '关闭' }}</p>
  </div>
</template>

<script setup>
import { useWalletModal } from '@btc-connect/vue';

const { open: openModal, close: closeModal, isOpen } = useWalletModal('CustomButton');

// 打开特定钱包
const openUnisat = () => {
  openModal('unisat');
};
</script>
```

### 2. 监听钱包状态

```vue
<script setup>
import { watch } from 'vue';
import { useCore, useWalletStateMonitor } from '@btc-connect/vue';

const { isConnected, currentWallet, manager } = useCore();

// 监听连接状态
watch(isConnected, (connected) => {
  if (connected) {
    console.log('🟢 钱包已连接');
  } else {
    console.log('🔴 钱包已断开');
  }
});

// 监听钱包变化
watch(currentWallet, (wallet) => {
  if (wallet) {
    console.log('🔄 当前钱包:', wallet.name);
  }
});

// 高级状态监控（开发模式）
if (process.env.NODE_ENV === 'development') {
  const stopMonitor = useWalletStateMonitor((newState, prevState) => {
    console.log('状态变化:', { from: prevState, to: newState });
  });
}
</script>
```

### 3. 交易功能

```vue
<template>
  <div v-if="isConnected">
    <input
      v-model="recipientAddress"
      placeholder="接收地址"
    />
    <input
      v-model="amount"
      type="number"
      placeholder="金额 (BTC)"
    />
    <button
      @click="sendBitcoin"
      :disabled="isSending"
    >
      {{ isSending ? '发送中...' : '发送比特币' }}
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useCore, useTransactions } from '@btc-connect/vue';

const { isConnected } = useCore();
const { sendBitcoin, isSending } = useTransactions();

const recipientAddress = ref('');
const amount = ref(0);

const handleSendBitcoin = async () => {
  if (!recipientAddress.value || amount.value <= 0) {
    alert('请填写有效的接收地址和金额');
    return;
  }

  try {
    const txid = await sendBitcoin(recipientAddress.value, amount.value);
    console.log('✅ 交易成功:', txid);
    alert('交易成功！交易ID: ' + txid);
  } catch (error) {
    console.error('❌ 交易失败:', error);
    alert('交易失败: ' + error.message);
  }
};
</script>
```

## 📱 框架集成

### Vue 3 + Vite

```bash
# 创建项目
npm create vue@latest my-btc-app
cd my-btc-app

# 安装依赖
npm install @btc-connect/vue

# 配置如上所述
# 启动开发服务器
npm run dev
```

### Nuxt 3

```typescript
// plugins/btc-connect.client.ts
import { BTCWalletPlugin } from '@btc-connect/vue';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(BTCWalletPlugin, {
    autoConnect: true,
    theme: 'auto'
  });
});
```

```vue
<!-- pages/index.vue -->
<template>
  <div>
    <ClientOnly>
      <ConnectButton />
    </ClientOnly>
  </div>
</template>

<script setup>
import { ConnectButton } from '@btc-connect/vue';
</script>
```

## 🐛 常见问题

### Q: 钱包连接失败怎么办？

**A**: 检查以下几点：

1. 确保钱包扩展已安装并启用
2. 检查控制台错误信息
3. 尝试刷新页面或重启浏览器

```vue
<script setup>
import { useCore } from '@btc-connect/vue';

const { availableWallets } = useCore();

// 检查可用钱包
console.log('可用钱包:', availableWallets.value);
</script>
```

### Q: 在 SSR 环境中使用需要注意什么？

**A**: 使用 `ClientOnly` 组件包装：

```vue
<template>
  <ClientOnly>
    <ConnectButton />
  </ClientOnly>
</template>
```

### Q: 如何自定义样式？

**A**: 通过 CSS 变量覆盖：

```css
/* 覆盖主题色 */
:root {
  --btc-connect-primary: #your-color;
  --btc-connect-background: #your-bg;
  --btc-connect-text: #your-text;
}
```

### Q: 如何处理网络切换？

**A**: 使用 useNetwork composable：

```vue
<script setup>
import { useNetwork } from '@btc-connect/vue';

const { network, switchNetwork, isSwitching } = useNetwork();

const switchToTestnet = async () => {
  try {
    await switchNetwork('testnet');
    console.log('已切换到测试网');
  } catch (error) {
    console.error('切换失败:', error);
  }
};
</script>
```

### Q: 如何获取交易历史？

**A**: 通过核心管理器访问钱包适配器：

```vue
<script setup>
import { useCore } from '@btc-connect/vue';

const { manager } = useCore();

const getTransactionHistory = async () => {
  if (manager.value) {
    // 具体实现取决于钱包适配器
    console.log('获取交易历史...');
  }
};
</script>
```

## 📚 学习资源

- [完整 API 文档](packages/vue/CLAUDE.md)
- [组件使用指南](packages/vue/src/components/README.md)
- [GitHub 仓库](https://github.com/IceHugh/btc-connect)
- [在线演示](https://btc-connect-demo.vercel.app)

## 🚀 下一步

现在你已经成功集成了 BTC Connect Vue！接下来你可以：

1. **探索更多功能**：
   - 交易功能 (sendBitcoin)
   - 签名功能 (signMessage, signPsbt)
   - 网络切换 (useNetwork)

2. **查看示例项目**：
   - [React 示例](examples/react)
   - [Vue 示例](examples/vue-example)
   - [Next.js 示例](examples/nextjs)
   - [Nuxt 3 示例](examples/nuxt-example)

3. **参与贡献**：
   - 报告 Bug
   - 提交 Feature Request
   - 贡献代码

## 💬 获取帮助

如果你遇到问题，可以通过以下方式获取帮助：

- 📖 [查看文档](packages/vue/CLAUDE.md)
- 🐛 [提交 Issue](https://github.com/IceHugh/btc-connect/issues)
- 💬 [社区讨论](https://github.com/IceHugh/btc-connect/discussions)

---

*开始你的比特币 Web3 之旅吧！ 🎉*