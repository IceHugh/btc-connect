[根目录](../../CLAUDE.md) > [examples](../) > **vue-example**

# Vue 示例项目

## 变更记录 (Changelog)

### 2025-10-16 09:31:52
- 完成 Vue 示例项目文档生成
- 添加项目结构和运行说明
- 补充使用示例和最佳实践

## 项目概述

这是一个展示如何在 Vue 应用中使用 @btc-connect/vue 的示例项目。该示例演示了基本的钱包连接、组合式 API 使用、插件系统等核心功能，并提供了完整的 Vue 3 + TypeScript 开发环境。

## 项目结构

```
examples/vue-example/
├── src/
│   ├── App.vue               # 主应用组件
│   ├── main.ts               # 应用入口
│   ├── components/
│   │   └── HelloWorld.vue    # 示例组件
│   ├── assets/
│   │   └── vue.svg           # Vue 图标
│   ├── style.css             # 全局样式
│   └── vite-env.d.ts         # Vite 类型声明
├── index.html                # HTML 模板
├── package.json              # 项目配置
└── tsconfig.json             # TypeScript 配置
```

## 核心功能演示

### 1. 基本钱包连接
```vue
<template>
  <div style="display:flex; gap: 16px; align-items: center;">
    <ConnectButton label="Connect Wallet" />
    <WalletModal />
  </div>
</template>

<script setup lang="ts">
import { ConnectButton, WalletModal } from '@btc-connect/vue'
</script>
```

### 2. 插件安装和配置
```typescript
// main.ts
import { createApp } from 'vue'
import { BTCWalletPlugin } from '@btc-connect/vue'
import App from './App.vue'

const app = createApp(App)

app.use(BTCWalletPlugin, {
  autoConnect: true,
  theme: 'light',
  config: {
    onStateChange: (state) => {
      console.log('Wallet state changed:', state)
    }
  }
})

app.mount('#app')
```

### 3. 主题切换示例
```vue
<template>
  <div style="padding: 24px;">
    <div style="margin-bottom: 16px;">
      <button @click="toggleTheme">
        切换到 {{ theme === 'light' ? '暗色' : '亮色' }} 主题
      </button>
    </div>
    <div style="display:flex; gap: 16px; align-items: center;">
      <ConnectButton label="Connect Wallet" />
      <WalletModal />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ConnectButton, WalletModal, useCore } from '@btc-connect/vue'

const { setTheme } = useCore()
const theme = ref<'light' | 'dark'>('light')

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  setTheme(theme.value)
}
</script>
```

### 3. 组合式 API 使用
```vue
<template>
  <div>
    <div v-if="isConnected">
      <p>Connected to: {{ currentWallet?.name }}</p>
      <p>Address: {{ address }}</p>
      <p>Balance: {{ balance?.total }} satoshis</p>
    </div>
    <div v-else>
      <p>Not connected</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCore, useAccount, useBalance } from '@btc-connect/vue'

const { isConnected, currentWallet } = useCore()
const { address } = useAccount()
const { balance } = useBalance()
</script>
```

## 运行与开发

### 环境要求
- Node.js >= 18
- npm 或 yarn
- 现代浏览器（支持 ES2020）

### 安装和运行
```bash
# 进入示例目录
cd examples/vue-example

# 安装依赖
bun install

# 启动开发服务器
bun dev

# 构建生产版本
bun build

# 预览构建结果
bun preview
```

### 开发服务器
- 默认端口: 5174
- 热重载: 支持
- TypeScript 类型检查: 实时
- Vue DevTools: 支持

## 使用示例

### 1. 基础用法示例
展示最简单的钱包连接集成：
```vue
<template>
  <div class="app">
    <header>
      <h1>BTC Connect Vue Demo</h1>
    </header>
    <main>
      <WalletConnection />
    </main>
  </div>
</template>

<script setup lang="ts">
import WalletConnection from './components/WalletConnection.vue'
</script>

<style scoped>
.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
</style>
```

### 4. 完整的钱包管理界面
```vue
<template>
  <div class="wallet-manager">
    <div class="connection-section">
      <ConnectButton
        :size="size"
        :label="buttonLabel"
      />
      <WalletModal />
    </div>

    <div v-if="isConnected" class="wallet-info">
      <h2>Wallet Information</h2>
      <div class="info-grid">
        <div class="info-item">
          <label>Wallet:</label>
          <span>{{ currentWallet?.name }}</span>
        </div>
        <div class="info-item">
          <label>Address:</label>
          <span class="address">{{ shortAddress }}</span>
        </div>
        <div class="info-item">
          <label>Balance:</label>
          <span>{{ formattedBalance }}</span>
        </div>
        <div class="info-item">
          <label>Network:</label>
          <span>{{ network }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCore, useAccount, useNetwork, useBalance } from '@btc-connect/vue'
import { ConnectButton, WalletModal } from '@btc-connect/vue'

const { isConnected, currentWallet } = useCore()
const { address } = useAccount()
const { network } = useNetwork()
const { balance } = useBalance()

// 计算属性
const shortAddress = computed(() => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
})

const formattedBalance = computed(() => {
  if (!balance) return '0 sat'
  return `${balance.total} satoshis`
})

// 响应式配置
const size = ref<'sm' | 'md' | 'lg'>('md')
const buttonLabel = computed(() => {
  return isConnected ? 'Connected' : 'Connect Wallet'
})
</script>

<style scoped>
.wallet-manager {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.connection-section {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 24px;
}

.wallet-info {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
}

.info-grid {
  display: grid;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-item label {
  font-weight: 600;
  color: #666;
}

.address {
  font-family: monospace;
  font-size: 14px;
}
</style>
```

## 配置说明

### Vite 配置
```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5174,
    open: true
  }
})
```

### TypeScript 配置
```json
{
  "extends": "@vue/tsconfig/tsconfig.dom.json",
  "include": ["env.d.ts", "src/**/*", "src/**/*.vue"],
  "exclude": ["src/**/__tests__/*"],
  "compilerOptions": {
    "composite": true,
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 依赖配置
```json
{
  "dependencies": {
    "@btc-connect/vue": "workspace:*",
    "vue": "^3.5.18"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^6.0.1",
    "@vue/tsconfig": "^0.7.0",
    "typescript": "~5.8.3",
    "vite": "^7.1.0",
    "vue-tsc": "^3.0.5"
  }
}
```

## 测试指南

### 手动测试步骤
1. **环境准备**
   - 安装 UniSat 或 OKX 钱包扩展
   - 确保钱包已解锁

2. **功能测试**
   - 点击连接按钮，观察钱包选择界面
   - 选择钱包并授权连接
   - 验证地址和余额显示
   - 测试断开连接功能

3. **响应性测试**
   - 连接钱包后观察界面变化
   - 切换网络验证状态更新
   - 测试计算属性的更新

### 自动化测试建议
```bash
# 添加 Vue Test Utils
bun add -D @vue/test-utils vitest

# 运行测试
bun test
```

## 常见问题

### Q: Vue 插件安装失败怎么办？
A: 检查以下几点：
1. 确保 Vue 版本 >= 3.2.0
2. 检查插件安装的时机（在 mount 之前）
3. 查看控制台错误信息

### Q: 组合式 API 无法获取钱包状态？
A: 确保以下条件：
1. 插件已正确安装
2. 组件在插件上下文中使用
3. 使用正确的组合式 API

### Q: 如何在组件间共享钱包状态？
A: 使用组合式 API 的响应性：
```vue
<script setup>
// 父组件
import { useCore } from '@btc-connect/vue'
import { provide } from 'vue'

const { manager, isConnected } = useCore()
provide('walletState', { manager, isConnected })
</script>

<script setup>
// 子组件
import { inject } from 'vue'

const { manager, isConnected } = inject('walletState')
</script>
```

### Q: 如何处理 TypeScript 类型错误？
A: 检查以下配置：
1. 确保使用 `.vue` 或 `.ts` 扩展名
2. 检查 tsconfig.json 配置
3. 使用 `lang="ts"` 属性

## 扩展建议

### 功能扩展
1. **Pinia 集成**: 使用 Pinia 管理钱包状态
2. **路由集成**: 在路由守卫中检查钱包状态
3. **国际化**: 添加 i18n 支持
4. **主题系统**: 完整的主题切换功能

### 组件扩展
1. **钱包详情组件**: 显示详细的钱包信息
2. **交易组件**: 发送比特币界面
3. **历史记录**: 交易历史展示
4. **设置组件**: 钱包配置界面

### 技术改进
1. **错误边界**: 完善的错误处理
2. **性能优化**: 懒加载和代码分割
3. **PWA 支持**: 渐进式 Web 应用
4. **移动端适配**: 响应式设计优化

## 相关文件清单

### 源代码
- `src/App.vue` - 主应用组件
- `src/main.ts` - 应用入口
- `src/components/HelloWorld.vue` - 示例组件

### 样式文件
- `src/style.css` - 全局样式

### 配置文件
- `index.html` - HTML 模板
- `package.json` - 项目配置
- `tsconfig.json` - TypeScript 配置
- `tsconfig.app.json` - 应用 TypeScript 配置
- `tsconfig.node.json` - Node.js TypeScript 配置
- `vite.config.ts` - Vite 配置

### 资源文件
- `src/assets/vue.svg` - Vue 图标

## 变更记录 (Changelog)

### 2025-10-16 09:31:52
- 完成 Vue 示例项目文档生成
- 添加项目结构和运行说明
- 补充使用示例和最佳实践