# BTC-Connect API 参考文档 v0.4.0

> 专为比特币 Web3 应用设计的钱包连接工具包完整API参考，包含最新的网络切换功能、Vue v0.4.0+ 架构优化和完整的SSR兼容支持。

## 📦 包结构概览

### @btc-connect/core (v0.4.0+)
框架无关的核心钱包适配层和管理系统，提供统一的比特币钱包接口协议。
**安装策略**: 自动安装最新版本，确保最低版本要求为 v0.4.0+

### @btc-connect/react (v0.4.0+)
React 专用的钱包连接库，提供 Context Provider 和 Hooks。
**安装策略**: 自动安装最新版本，确保最低版本要求为 v0.4.0+

### @btc-connect/vue (v0.4.0+)
Vue 3 专用的钱包连接库，提供插件系统和 Composables，🆕 架构优化版本。
**安装策略**: 自动安装最新版本，确保最低版本要求为 v0.4.0+

## 🏗️ 核心包 (@btc-connect/core)

### 主要类和接口

#### BTCWalletManager
钱包管理器，负责管理所有钱包适配器。

```typescript
import { BTCWalletManager } from '@btc-connect/core'

const manager = new BTCWalletManager({
  onError: (error) => console.error('Wallet error:', error),
  onStateChange: (state) => console.log('State changed:', state)
})
```

**主要方法:**
- `connect(walletId: string)` - 连接指定钱包
- `disconnect()` - 断开当前连接
- `switchNetwork(network: Network)` - 🆕 切换网络 (v0.3.11+)
- `getAvailableWallets()` - 获取可用钱包列表
- `getCurrentWallet()` - 获取当前连接的钱包
- `assumeConnected(walletId: string)` - 假设已连接，尝试恢复状态
- `detectAvailableWallets()` - 🆕 增强钱包检测机制

#### 网络类型
```typescript
type Network = 'livenet' | 'testnet' | 'regtest' | 'mainnet'
```

**🆕 网络切换功能 (v0.3.11+):**
- **livenet/mainnet**: 比特币主网
- **testnet**: 比特币测试网
- **regtest**: 回归测试网

#### 钱包适配器接口
```typescript
interface BTCWalletAdapter {
  readonly id: string
  readonly name: string
  readonly icon: string

  isReady(): boolean
  getState(): WalletState

  connect(): Promise<AccountInfo[]>
  disconnect(): Promise<void>

  getAccounts(): Promise<AccountInfo[]>
  getCurrentAccount(): Promise<AccountInfo | null>

  getNetwork(): Promise<Network>
  switchNetwork(network: Network): Promise<void> // 🆕 网络切换

  on<T extends WalletEvent>(event: T, handler: EventHandler<T>): void
  off<T extends WalletEvent>(event: T, handler: EventHandler<T>): void

  signMessage(message: string): Promise<string>
  signPsbt(psbt: string): Promise<string>
  sendBitcoin(toAddress: string, amount: number): Promise<string>
}
```

#### 账户信息
```typescript
interface AccountInfo {
  address: string
  publicKey?: string
  balance?: number
  network?: Network
}
```

#### 钱包状态
```typescript
interface WalletState {
  status: ConnectionStatus
  accounts: AccountInfo[]
  currentAccount?: AccountInfo
  network?: Network
  error?: Error
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'
```

### 钱包适配器

#### UniSat 适配器
```typescript
import { UniSatAdapter } from '@btc-connect/core'

const unisat = new UniSatAdapter()
await unisat.connect()
```

**UniSat 特有方法:**
- 支持完全的程序化网络切换
- 支持Ordinals和BRC-20代币
- 支持PSBT签名和广播

#### OKX 适配器
```typescript
import { OKXAdapter } from '@btc-connect/core'

const okx = new OKXAdapter()
await okx.connect()
```

**OKX 特有限制:**
- 网络切换通常需要用户手动操作
- 部分高级功能可能受限

### 事件系统

#### 事件类型
```typescript
type WalletEvent =
  | 'connect'
  | 'disconnect'
  | 'accountChange'
  | 'networkChange'
  | 'error'
```

#### 事件监听
```typescript
// 连接事件
manager.on('connect', (accounts: AccountInfo[]) => {
  console.log('钱包已连接:', accounts)
})

// 断开连接事件
manager.on('disconnect', () => {
  console.log('钱包已断开')
})

// 账户变更事件
manager.on('accountChange', (accounts: AccountInfo[]) => {
  console.log('账户已变更:', accounts)
})

// 网络变更事件
manager.on('networkChange', ({ network }: { network: Network }) => {
  console.log('网络已变更:', network)
})

// 错误事件
manager.on('error', (error: Error) => {
  console.error('钱包错误:', error)
})
```

## React 包 (@btc-connect/react)

### Hooks

#### useWallet
主要的钱包管理Hook。

```typescript
import { useWallet } from '@btc-connect/react'

interface UseWalletReturn {
  wallet: AccountInfo | null
  isConnected: boolean
  isConnecting: boolean
  error: Error | null
  availableWallets: WalletInfo[]
  connect: (walletId: string) => Promise<AccountInfo[]>
  disconnect: () => Promise<void>
  switchWallet: (walletId: string) => Promise<AccountInfo[]>
}

function WalletComponent() {
  const {
    wallet,
    isConnected,
    isConnecting,
    connect,
    disconnect
  } = useWallet()

  const handleConnect = async () => {
    try {
      await connect('unisat')
    } catch (error) {
      console.error('连接失败:', error)
    }
  }

  return (
    <div>
      {isConnected ? (
        <div>
          <p>已连接: {wallet?.address}</p>
          <button onClick={disconnect}>断开连接</button>
        </div>
      ) : (
        <button onClick={handleConnect} disabled={isConnecting}>
          {isConnecting ? '连接中...' : '连接钱包'}
        </button>
      )}
    </div>
  )
}
```

#### useNetwork
网络管理Hook。

```typescript
import { useNetwork } from '@btc-connect/react'

interface UseNetworkReturn {
  network: Network
  isSwitching: boolean
  switchNetwork: (network: Network) => Promise<void>
}

function NetworkSwitcher() {
  const { network, switchNetwork } = useNetwork()

  const handleSwitch = async (newNetwork: Network) => {
    try {
      await switchNetwork(newNetwork)
      console.log('网络切换成功')
    } catch (error) {
      console.error('切换失败:', error)
    }
  }

  return (
    <div>
      <p>当前网络: {network}</p>
      <button onClick={() => handleSwitch('testnet')}>切换到测试网</button>
      <button onClick={() => handleSwitch('livenet')}>切换到主网</button>
    </div>
  )
}
```

#### useAccount
账户信息Hook。

```typescript
import { useAccount } from '@btc-connect/react'

interface UseAccountReturn {
  account: AccountInfo | null
  getBalance: () => Promise<number>
  refreshBalance: () => Promise<void>
}

function AccountInfo() {
  const { account, getBalance } = useAccount()

  useEffect(() => {
    if (account) {
      getBalance().then(balance => {
        console.log('账户余额:', balance)
      })
    }
  }, [account, getBalance])

  return (
    <div>
      {account && (
        <div>
          <p>地址: {account.address}</p>
          <p>公钥: {account.publicKey}</p>
          <p>余额: {account.balance} satoshis</p>
        </div>
      )}
    </div>
  )
}
```

#### useSignature
签名功能Hook。

```typescript
import { useSignature } from '@btc-connect/react'

interface UseSignatureReturn {
  signMessage: (message: string) => Promise<string>
  signPsbt: (psbtHex: string) => Promise<string>
}

function MessageSigner() {
  const { signMessage } = useSignature()

  const handleSign = async () => {
    const message = 'Hello, Bitcoin!'
    try {
      const signature = await signMessage(message)
      console.log('签名结果:', signature)
    } catch (error) {
      console.error('签名失败:', error)
    }
  }

  return <button onClick={handleSign}>签名消息</button>
}
```

#### useTransactions
交易功能Hook。

```typescript
import { useTransactions } from '@btc-connect/react'

interface UseTransactionsReturn {
  sendBitcoin: (toAddress: string, satoshis: number) => Promise<string>
  signPsbt: (psbtHex: string) => Promise<string>
  pushTransaction: (rawTx: string) => Promise<string>
}

function BitcoinSender() {
  const { sendBitcoin } = useTransactions()

  const handleSend = async () => {
    const toAddress = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
    const satoshis = 1000 // 0.00001 BTC

    try {
      const txid = await sendBitcoin(toAddress, satoshis)
      console.log('交易哈希:', txid)
    } catch (error) {
      console.error('发送失败:', error)
    }
  }

  return <button onClick={handleSend}>发送 1000 satoshis</button>
}
```

### Context Provider

#### BTCWalletProvider
为应用提供钱包上下文。

```typescript
import { BTCWalletProvider } from '@btc-connect/react'

interface BTCWalletProviderProps {
  children: React.ReactNode
  config?: WalletManagerConfig
}

function App() {
  return (
    <BTCWalletProvider>
      <YourComponents />
    </BTCWalletProvider>
  )
}

// 带配置的Provider
function AppWithConfig() {
  const config = {
    onError: (error) => console.error('Wallet error:', error),
    onStateChange: (state) => console.log('State changed:', state)
  }

  return (
    <BTCWalletProvider config={config}>
      <YourComponents />
    </BTCWalletProvider>
  )
}
```

## Vue 包 (@btc-connect/vue)

### Composables

#### useWallet
钱包管理Composable。

```typescript
import { useWallet } from '@btc-connect/vue'

interface UseWalletReturn {
  wallet: Ref<AccountInfo | null>
  isConnected: Ref<boolean>
  isConnecting: Ref<boolean>
  error: Ref<Error | null>
  availableWallets: Ref<WalletInfo[]>
  connect: (walletId: string) => Promise<AccountInfo[]>
  disconnect: () => Promise<void>
  switchWallet: (walletId: string) => Promise<AccountInfo[]>
}
```

```vue
<template>
  <div>
    <div v-if="!isConnected">
      <button @click="handleConnect('unisat')" :disabled="isConnecting">
        {{ isConnecting ? '连接中...' : '连接 UniSat' }}
      </button>
    </div>
    <div v-else>
      <p>已连接: {{ wallet?.address }}</p>
      <button @click="disconnect">断开连接</button>
    </div>
  </div>
</template>

<script setup>
import { useWallet } from '@btc-connect/vue'

const {
  wallet,
  isConnected,
  isConnecting,
  connect,
  disconnect
} = useWallet()

const handleConnect = async (walletId: string) => {
  try {
    await connect(walletId)
  } catch (error) {
    console.error('连接失败:', error)
  }
}
</script>
```

#### useNetwork
网络管理Composable。

```typescript
import { useNetwork } from '@btc-connect/vue'

interface UseNetworkReturn {
  network: Ref<Network>
  isSwitching: Ref<boolean>
  switchNetwork: (network: Network) => Promise<void>
}
```

```vue
<template>
  <div class="network-switcher">
    <p>当前网络: {{ network }}</p>
    <button @click="switchToTestnet" :disabled="isSwitching">
      切换到测试网
    </button>
    <button @click="switchToMainnet" :disabled="isSwitching">
      切换到主网
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useNetwork } from '@btc-connect/vue'

const { network, switchNetwork } = useNetwork()

const switchToTestnet = async () => {
  try {
    await switchNetwork('testnet')
  } catch (error) {
    console.error('切换失败:', error)
  }
}

const switchToMainnet = async () => {
  try {
    await switchNetwork('livenet')
  } catch (error) {
    console.error('切换失败:', error)
  }
}
</script>
```

#### useAccount
账户信息Composable。

```typescript
import { useAccount } from '@btc-connect/vue'

interface UseAccountReturn {
  account: Ref<AccountInfo | null>
  getBalance: () => Promise<number>
  refreshBalance: () => Promise<void>
}
```

### 插件系统

#### BTCWalletPlugin
Vue插件安装。

```typescript
import { createApp } from 'vue'
import { BTCWalletPlugin } from '@btc-connect/vue'
import App from './App.vue'

const app = createApp(App)
app.use(BTCWalletPlugin, {
  onError: (error) => console.error('Wallet error:', error),
  onStateChange: (state) => console.log('State changed:', state)
})
app.mount('#app')
```

## 工具函数

### 钱包检测
```typescript
import {
  detectAvailableWallets,
  getAvailableWallets,
  getAllAdapters
} from '@btc-connect/core'

// 检测可用钱包
const wallets = await detectAvailableWallets({
  timeout: 20000,
  interval: 300,
  onProgress: (wallets, time) => {
    console.log(`检测到钱包: ${wallets.join(', ')} (${time}ms)`)
  }
})

// 获取可用钱包列表
const availableWallets = getAvailableWallets()

// 获取所有适配器
const allAdapters = getAllAdapters()
```

### 缓存管理
```typescript
import {
  getCacheManager,
  invalidateCache,
  cached
} from '@btc-connect/core'

// 获取缓存管理器
const cache = getCacheManager()

// 清除缓存
invalidateCache('some-key')

// 使用缓存装饰器
class SomeService {
  @cached('wallet-balance', 300000) // 5分钟缓存
  async getBalance(address: string): Promise<number> {
    // 获取余额逻辑
  }
}
```

### 错误处理
```typescript
import {
  WalletError,
  WalletNotInstalledError,
  WalletConnectionError,
  WalletDisconnectedError
} from '@btc-connect/core'

try {
  await manager.connect('unisat')
} catch (error) {
  if (error instanceof WalletNotInstalledError) {
    console.error('钱包未安装')
  } else if (error instanceof WalletConnectionError) {
    console.error('连接失败')
  } else if (error instanceof WalletDisconnectedError) {
    console.error('钱包已断开')
  } else {
    console.error('未知错误:', error)
  }
}
```

## 类型定义

### 完整类型导出
```typescript
// 导出所有类型
import type {
  // 核心类型
  BTCWalletAdapter,
  WalletManager,
  AccountInfo,
  WalletInfo,
  WalletState,
  Network,
  ConnectionStatus,
  WalletEvent,

  // React 类型
  UseWalletReturn,
  UseNetworkReturn,
  UseAccountReturn,
  UseSignatureReturn,
  UseTransactionsReturn,

  // Vue 类型
  UseWalletReturn as UseWalletReturnVue,
  UseNetworkReturn as UseNetworkReturnVue,

  // 错误类型
  WalletError,
  WalletNotInstalledError,
  WalletConnectionError,
  WalletDisconnectedError
} from '@btc-connect/core'
```

## 常用模式

### 1. 基础连接模式
```typescript
// React
const { connect, isConnected, wallet } = useWallet()

const handleConnect = async () => {
  try {
    await connect('unisat')
  } catch (error) {
    if (error.message.includes('User rejected')) {
      // 用户取消连接
    } else {
      // 其他错误
    }
  }
}

// Vue
const { connect, isConnected, wallet } = useWallet()

const handleConnect = async () => {
  try {
    await connect('unisat')
  } catch (error) {
    // 错误处理
  }
}
```

### 2. 网络切换模式
```typescript
// 检查网络兼容性
const switchNetworkSafely = async (targetNetwork: Network) => {
  const currentNetwork = await manager.getNetwork()

  if (currentNetwork === targetNetwork) {
    return // 已经是目标网络
  }

  try {
    await manager.switchNetwork(targetNetwork)
  } catch (error) {
    if (error.message.includes('not supported')) {
      // 钱包不支持程序化切换
      showManualSwitchGuide(targetNetwork)
    } else {
      throw error
    }
  }
}
```

### 3. 状态持久化
```typescript
// 自动重连
const autoConnect = async () => {
  const savedWalletId = localStorage.getItem('btc-connect-wallet')

  if (savedWalletId) {
    try {
      await manager.assumeConnected(savedWalletId)
    } catch (error) {
      // 清除无效的保存状态
      localStorage.removeItem('btc-connect-wallet')
    }
  }
}
```

## 最佳实践

1. **错误处理**: 始终包含完整的错误处理逻辑
2. **状态管理**: 正确处理连接状态和加载状态
3. **用户体验**: 提供清晰的状态指示和用户反馈
4. **网络检查**: 在操作前检查网络兼容性
5. **事件清理**: 在组件卸载时清理事件监听器
6. **类型安全**: 充分利用TypeScript类型系统
7. **缓存策略**: 合理使用缓存提升性能