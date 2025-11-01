# 框架配置指南

## React 项目配置

### 1. 安装依赖
```bash
# 使用npm
npm install @btc-connect/core @btc-connect/react

# 使用yarn
yarn add @btc-connect/core @btc-connect/react

# 使用bun
bun add @btc-connect/core @btc-connect/react
```

### 2. 配置Provider
在应用根组件中配置BTCWalletProvider：

```tsx
// App.tsx
import React from 'react'
import { BTCWalletProvider } from '@btc-connect/react'
import WalletComponent from './WalletComponent'

function App() {
  return (
    <BTCWalletProvider>
      <WalletComponent />
    </BTCWalletProvider>
  )
}

export default App
```

### 3. 创建钱包组件
```tsx
// WalletComponent.tsx
import React from 'react'
import { useWallet, useNetwork } from '@btc-connect/react'

export default function WalletComponent() {
  const {
    wallet,
    isConnected,
    isConnecting,
    connect,
    disconnect
  } = useWallet()

  const { network, switchNetwork } = useNetwork()

  const handleConnect = async (walletId: string) => {
    try {
      await connect(walletId)
    } catch (error) {
      console.error('连接失败:', error)
    }
  }

  return (
    <div>
      <h2>钱包连接</h2>

      {!isConnected ? (
        <div>
          <button
            onClick={() => handleConnect('unisat')}
            disabled={isConnecting}
          >
            {isConnecting ? '连接中...' : '连接 UniSat'}
          </button>
          <button
            onClick={() => handleConnect('okx')}
            disabled={isConnecting}
          >
            {isConnecting ? '连接中...' : '连接 OKX'}
          </button>
        </div>
      ) : (
        <div>
          <p>地址: {wallet?.address}</p>
          <p>网络: {network}</p>
          <button onClick={disconnect}>断开连接</button>

          <div>
            <h3>网络切换</h3>
            <button onClick={() => switchNetwork('mainnet')}>主网</button>
            <button onClick={() => switchNetwork('testnet')}>测试网</button>
          </div>
        </div>
      )}
    </div>
  )
}
```

### 4. TypeScript 配置
确保tsconfig.json包含必要的类型：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["DOM", "DOM.Iterable", "ES6"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": [
    "src"
  ]
}
```

## Vue 项目配置

### 1. 安装依赖
```bash
# 使用npm
npm install @btc-connect/core @btc-connect/vue

# 使用yarn
yarn add @btc-connect/core @btc-connect/vue

# 使用bun
bun add @btc-connect/core @btc-connect/vue
```

### 2. 配置插件
在main.ts中配置BTCWalletPlugin：

```typescript
// main.ts
import { createApp } from 'vue'
import { BTCWalletPlugin } from '@btc-connect/vue'
import App from './App.vue'

const app = createApp(App)
app.use(BTCWalletPlugin)
app.mount('#app')
```

### 3. 创建钱包组件
```vue
<!-- WalletComponent.vue -->
<template>
  <div class="wallet-component">
    <h2>钱包连接</h2>

    <div v-if="!isConnected">
      <button
        @click="handleConnect('unisat')"
        :disabled="isConnecting"
      >
        {{ isConnecting ? '连接中...' : '连接 UniSat' }}
      </button>
      <button
        @click="handleConnect('okx')"
        :disabled="isConnecting"
      >
        {{ isConnecting ? '连接中...' : '连接 OKX' }}
      </button>
    </div>

    <div v-else>
      <p>地址: {{ wallet?.address }}</p>
      <p>网络: {{ network }}</p>
      <button @click="disconnect">断开连接</button>

      <div class="network-switch">
        <h3>网络切换</h3>
        <button @click="switchToMainnet">主网</button>
        <button @click="switchToTestnet">测试网</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useWallet, useNetwork } from '@btc-connect/vue'

const {
  wallet,
  isConnected,
  isConnecting,
  connect,
  disconnect
} = useWallet()

const { network, switchNetwork } = useNetwork()

const handleConnect = async (walletId: string) => {
  try {
    await connect(walletId)
  } catch (error) {
    console.error('连接失败:', error)
  }
}

const switchToMainnet = async () => {
  try {
    await switchNetwork('mainnet')
  } catch (error) {
    console.error('切换失败:', error)
  }
}

const switchToTestnet = async () => {
  try {
    await switchNetwork('testnet')
  } catch (error) {
    console.error('切换失败:', error)
  }
}
</script>

<style scoped>
.wallet-component {
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  max-width: 400px;
  margin: 0 auto;
}

.network-switch {
  margin-top: 15px;
}

button {
  margin: 5px;
  padding: 8px 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #f5f5f5;
  cursor: pointer;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
```

### 4. TypeScript 配置
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
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## 纯JavaScript 项目配置

### 1. 安装依赖
```bash
npm install @btc-connect/core
```

### 2. 基础使用
```javascript
// wallet.js
import { BTCWalletManager } from '@btc-connect/core'

class WalletManager {
  constructor() {
    this.manager = new BTCWalletManager({
      onError: (error) => console.error('Wallet error:', error),
      onStateChange: (state) => console.log('State changed:', state)
    })

    this.setupEventListeners()
  }

  setupEventListeners() {
    this.manager.on('connect', (accounts) => {
      console.log('钱包已连接:', accounts)
      this.updateUI(accounts[0])
    })

    this.manager.on('disconnect', () => {
      console.log('钱包已断开')
      this.updateUI(null)
    })

    this.manager.on('networkChange', ({ network }) => {
      console.log('网络已变更:', network)
      this.updateNetworkUI(network)
    })
  }

  async connect(walletId) {
    try {
      const accounts = await this.manager.connect(walletId)
      return accounts
    } catch (error) {
      console.error('连接失败:', error)
      throw error
    }
  }

  async disconnect() {
    try {
      await this.manager.disconnect()
    } catch (error) {
      console.error('断开连接失败:', error)
    }
  }

  async switchNetwork(network) {
    try {
      await this.manager.switchNetwork(network)
    } catch (error) {
      console.error('网络切换失败:', error)
    }
  }

  getAvailableWallets() {
    return this.manager.getAvailableWallets()
  }

  updateUI(account) {
    // 更新UI的函数
    const connectButton = document.getElementById('connect-button')
    const addressDisplay = document.getElementById('address-display')

    if (account) {
      connectButton.textContent = '断开连接'
      addressDisplay.textContent = `地址: ${account.address}`
    } else {
      connectButton.textContent = '连接钱包'
      addressDisplay.textContent = ''
    }
  }

  updateNetworkUI(network) {
    const networkDisplay = document.getElementById('network-display')
    networkDisplay.textContent = `网络: ${network}`
  }
}

// 使用示例
const walletManager = new WalletManager()

// 连接按钮事件
document.getElementById('connect-button').addEventListener('click', async () => {
  const availableWallets = walletManager.getAvailableWallets()

  if (availableWallets.length === 0) {
    alert('没有检测到可用的钱包')
    return
  }

  // 简单示例：使用第一个可用钱包
  const walletId = availableWallets[0].id

  try {
    await walletManager.connect(walletId)
  } catch (error) {
    alert(`连接失败: ${error.message}`)
  }
})

// 网络切换按钮
document.getElementById('switch-network').addEventListener('click', async () => {
  try {
    await walletManager.switchNetwork('testnet')
  } catch (error) {
    alert(`网络切换失败: ${error.message}`)
  }
})
```

### 3. HTML 页面
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BTC-Connect 示例</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .wallet-info {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 8px;
            margin: 10px 0;
        }
        button {
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            margin: 5px;
        }
        button:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
    </style>
</head>
<body>
    <h1>BTC-Connect 钱包连接示例</h1>

    <div class="wallet-info">
        <div id="address-display"></div>
        <div id="network-display"></div>
    </div>

    <div>
        <button id="connect-button">连接钱包</button>
        <button id="switch-network">切换到测试网</button>
    </div>

    <script type="module" src="./wallet.js"></script>
</body>
</html>
```

## 通用配置要点

### 1. 环境变量配置
创建.env文件：
```env
# 可选：配置默认网络
VITE_DEFAULT_NETWORK=livenet

# 可选：配置支持的钱包
VITE_SUPPORTED_WALLETS=unisat,okx
```

### 2. 构建配置
确保你的构建工具能正确处理ES模块：

#### Vite 配置
```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['@btc-connect/core']
  }
})
```

#### Webpack 配置
```javascript
// webpack.config.js
module.exports = {
  resolve: {
    fallback: {
      "crypto": false,
      "stream": false,
      "assert": false,
      "http": false,
      "https": false,
      "os": false,
      "url": false
    }
  }
}
```

### 3. 浏览器兼容性
确保目标浏览器支持：
- ES2020+ 语法
- WebAssembly (如果钱包需要)
- 现代Promise和async/await

### 4. 安全注意事项
- 验证钱包URL和来源
- 实现适当的错误处理
- 不要在客户端存储私钥
- 使用HTTPS连接

### 5. 开发环境调试
```javascript
// 开发环境调试代码
if (process.env.NODE_ENV === 'development') {
  // 暴露到全局对象便于调试
  window.btcConnectManager = manager

  // 启用详细日志
  manager.on('*', (event, ...args) => {
    console.log(`[BTC-Connect] ${event}:`, args)
  })
}
```

## 常见配置问题解决

### 1. TypeScript 类型错误
```typescript
// 创建 types/wallet.d.ts
declare global {
  interface Window {
    unisat?: any
    okxwallet?: any
  }
}

export {}
```

### 2. Vite 构建问题
```javascript
// vite.config.js
export default defineConfig({
  build: {
    target: 'es2020'
  },
  optimizeDeps: {
    exclude: ['@btc-connect/core'] // 如果有问题可以尝试排除
  }
})
```

### 3. 模块解析问题
```javascript
// webpack.config.js
module.exports = {
  resolve: {
    alias: {
      '@btc-connect/core': path.resolve(__dirname, 'node_modules/@btc-connect/core')
    }
  }
}
```

这些配置为你提供了在不同框架中集成btc-connect的基础。根据你的具体项目需求，可能还需要进行一些调整。