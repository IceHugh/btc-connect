# 🔄 网络切换功能详解

> btc-connect v0.4.0+ 完整支持比特币网络切换功能，允许用户在主网、测试网和回归测试网之间无缝切换。

## 🌐 支持的网络类型

### 网络标识符
```typescript
type Network = 'livenet' | 'testnet' | 'regtest' | 'mainnet'
```

### 网络说明
- **livenet/mainnet**: 比特币主网络，真实的比特币交易
- **testnet**: 比特币测试网络，用于开发和测试
- **regtest**: 回归测试网络，用于本地开发

## 🏗️ 核心包网络切换

### BTCWalletManager 网络切换
```typescript
import { BTCWalletManager } from '@btc-connect/core'

const manager = new BTCWalletManager()

// 切换到测试网
try {
  await manager.switchNetwork('testnet')
  console.log('成功切换到测试网')
} catch (error) {
  console.error('网络切换失败:', error.message)
}

// 切换到主网
try {
  await manager.switchNetwork('mainnet')
  console.log('成功切换到主网')
} catch (error) {
  console.error('网络切换失败:', error.message)
}
```

### 网络变化事件监听
```typescript
// 监听网络变化事件
manager.on('networkChange', ({ walletId, network }) => {
  console.log(`钱包 ${walletId} 切换到 ${network} 网络`)

  // 更新UI状态
  updateNetworkStatus(network)
})

// 监听钱包状态变化
manager.on('stateChange', (state) => {
  console.log('钱包状态变化:', state)
  if (state.network) {
    console.log('当前网络:', state.network)
  }
})
```

## ⚛️ React Hook 网络切换

### useNetwork Hook
```typescript
import { useNetwork } from '@btc-connect/react'

function NetworkSwitcher() {
  const {
    network,           // 当前网络
    switchNetwork,     // 网络切换函数
    isSwitching,       // 是否正在切换
    error             // 切换错误信息
  } = useNetwork()

  const handleSwitchNetwork = async (targetNetwork: Network) => {
    try {
      await switchNetwork(targetNetwork)
      console.log(`成功切换到 ${targetNetwork}`)
    } catch (error) {
      console.error('切换失败:', error.message)
    }
  }

  return (
    <div className="network-switcher">
      <p>当前网络: {network}</p>
      <p>状态: {isSwitching ? '切换中...' : '已连接'}</p>

      <div className="network-buttons">
        <button
          onClick={() => handleSwitchNetwork('mainnet')}
          disabled={isSwitching || network === 'mainnet'}
        >
          主网
        </button>

        <button
          onClick={() => handleSwitchNetwork('testnet')}
          disabled={isSwitching || network === 'testnet'}
        >
          测试网
        </button>

        <button
          onClick={() => handleSwitchNetwork('regtest')}
          disabled={isSwitching || network === 'regtest'}
        >
          回归测试网
        </button>
      </div>

      {error && (
        <div className="error-message">
          错误: {error.message}
        </div>
      )}
    </div>
  )
}
```

### 完整的网络切换组件
```typescript
'use client'
import { useNetwork, useWallet } from '@btc-connect/react'

export default function NetworkControl() {
  const { network, switchNetwork, isSwitching } = useNetwork()
  const { isConnected, currentWallet } = useWallet()

  const networks = [
    { id: 'mainnet', name: '主网', description: '比特币主网络' },
    { id: 'testnet', name: '测试网', description: '比特币测试网络' },
    { id: 'regtest', name: '回归测试网', description: '本地开发网络' }
  ]

  if (!isConnected) {
    return <div>请先连接钱包</div>
  }

  return (
    <div className="network-control">
      <h3>网络控制</h3>

      <div className="current-network">
        <span>当前网络: </span>
        <strong>{network}</strong>
        {isSwitching && <span className="switching"> (切换中...)</span>}
      </div>

      <div className="network-list">
        {networks.map((net) => (
          <button
            key={net.id}
            onClick={() => switchNetwork(net.id as Network)}
            disabled={isSwitching || network === net.id}
            className={`network-btn ${network === net.id ? 'active' : ''}`}
          >
            <div className="network-name">{net.name}</div>
            <div className="network-desc">{net.description}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
```

## 🖖 Vue Composable 网络切换

### useNetwork Composable
```vue
<template>
  <div class="network-switcher">
    <p>当前网络: {{ network.name }}</p>
    <p>状态: {{ isSwitching ? '切换中...' : '已连接' }}</p>

    <div class="network-buttons">
      <button
        @click="switchToMainnet"
        :disabled="isSwitching || network.id === 'mainnet'"
      >
        主网
      </button>

      <button
        @click="switchToTestnet"
        :disabled="isSwitching || network.id === 'testnet'"
      >
        测试网
      </button>

      <button
        @click="switchToRegtest"
        :disabled="isSwitching || network.id === 'regtest'"
      >
        回归测试网
      </button>
    </div>

    <div v-if="error" class="error-message">
      错误: {{ error.message }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useNetwork } from '@btc-connect/vue'

const { network, switchNetwork, isSwitching, error } = useNetwork()

const switchToMainnet = async () => {
  try {
    await switchNetwork('mainnet')
    console.log('成功切换到主网')
  } catch (err) {
    console.error('切换失败:', err.message)
  }
}

const switchToTestnet = async () => {
  try {
    await switchNetwork('testnet')
    console.log('成功切换到测试网')
  } catch (err) {
    console.error('切换失败:', err.message)
  }
}

const switchToRegtest = async () => {
  try {
    await switchNetwork('regtest')
    console.log('成功切换到回归测试网')
  } catch (err) {
    console.error('切换失败:', err.message)
  }
}
</script>

<style scoped>
.network-switcher {
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.network-buttons {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.network-buttons button {
  padding: 8px 16px;
  border: 1px solid #007bff;
  background: #007bff;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

.network-buttons button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: red;
  margin-top: 10px;
}
</style>
```

### 🆕 Vue v0.4.0+ 统一API
```vue
<template>
  <div class="wallet-network-control">
    <!-- 使用统一API获取钱包状态 -->
    <div v-if="wallet.isConnected">
      <p>当前钱包: {{ wallet.currentWallet?.name }}</p>
      <p>当前网络: {{ wallet.network }}</p>

      <button
        @click="handleNetworkSwitch('testnet')"
        :disabled="wallet.isNetworkSwitching"
      >
        {{ wallet.isNetworkSwitching ? '切换中...' : '切换到测试网' }}
      </button>
    </div>

    <div v-else>
      <ConnectButton @connect="handleConnect" />
    </div>
  </div>
</template>

<script setup>
import { useWallet } from '@btc-connect/vue'

// 🆕 v0.4.0+ 统一API
const wallet = useWallet()

const handleConnect = (walletId) => {
  console.log('连接到钱包:', walletId)
}

const handleNetworkSwitch = async (network) => {
  try {
    await wallet.switchNetwork(network)
    console.log(`成功切换到 ${network}`)
  } catch (error) {
    console.error('切换失败:', error.message)
  }
}
</script>
```

## 🎯 钱包特定支持

### ✅ UniSat 钱包 (完全支持)
- **程序化网络切换**: 完全支持 `switchNetwork()` 方法
- **网络变化事件**: 支持监听网络变化
- **用户体验**: 即时切换，无需用户手动操作

```typescript
// UniSat 钱包示例
await manager.switchNetwork('testnet') // 立即生效
```

### ⚠️ OKX 钱包 (部分支持)
- **程序化切换**: 有限支持，通常需要用户手动操作
- **用户指导**: 需要提示用户在钱包中手动切换网络
- **错误处理**: 需要特殊的错误处理逻辑

```typescript
// OKX 钱包示例
try {
  await manager.switchNetwork('testnet')
} catch (error) {
  // 提示用户手动操作
  showUserMessage('请在 OKX 钱包中手动切换到测试网')
}
```

### 🔄 网络切换最佳实践

### 1. 状态管理
```typescript
// 网络状态管理
const [networkState, setNetworkState] = useState({
  currentNetwork: 'mainnet',
  isSwitching: false,
  error: null
})

const handleNetworkSwitch = async (targetNetwork) => {
  setNetworkState(prev => ({ ...prev, isSwitching: true, error: null }))

  try {
    await switchNetwork(targetNetwork)
    setNetworkState({
      currentNetwork: targetNetwork,
      isSwitching: false,
      error: null
    })
  } catch (error) {
    setNetworkState(prev => ({
      ...prev,
      isSwitching: false,
      error: error.message
    }))
  }
}
```

### 2. 用户反馈
```typescript
// 提供清晰的用户反馈
const NetworkSwitchButton = ({ targetNetwork }) => {
  const { isSwitching, error } = useNetwork()

  return (
    <button
      onClick={() => switchNetwork(targetNetwork)}
      disabled={isSwitching}
    >
      {isSwitching ? (
        <>
          <Spinner />
          切换中...
        </>
      ) : (
        `切换到 ${getNetworkName(targetNetwork)}`
      )}

      {error && (
        <Tooltip message={error}>
          <Icon type="warning" />
        </Tooltip>
      )}
    </button>
  )
}
```

### 3. 错误处理
```typescript
// 健壮的错误处理
const handleNetworkSwitch = async (targetNetwork) => {
  try {
    await switchNetwork(targetNetwork)
    // 成功处理
  } catch (error) {
    if (error.code === 'USER_REJECTED') {
      // 用户拒绝切换
      showInfo('用户取消了网络切换')
    } else if (error.code === 'WALLET_NOT_SUPPORTED') {
      // 钱包不支持网络切换
      showWarning('当前钱包不支持程序化网络切换，请在钱包中手动操作')
    } else {
      // 其他错误
      showError(`网络切换失败: ${error.message}`)
    }
  }
}
```

### 4. 事件监听
```typescript
// 监听网络变化事件
useEffect(() => {
  const handleNetworkChange = ({ network, walletId }) => {
    console.log(`网络已切换到: ${network}`)
    // 更新应用状态
    updateAppNetwork(network)
    // 显示通知
    showSuccess(`已切换到 ${getNetworkName(network)}`)
  }

  manager.on('networkChange', handleNetworkChange)

  return () => {
    manager.off('networkChange', handleNetworkChange)
  }
}, [])
```

## 🔧 SSR 环境注意事项

### Next.js 配置
```typescript
// components/NetworkSwitcher.tsx
'use client'

import { useNetwork } from '@btc-connect/react'

export default function NetworkSwitcher() {
  const { network, switchNetwork } = useNetwork()
  // 网络切换组件实现
}
```

### Nuxt 3 配置
```vue
<!-- components/NetworkSwitcher.vue -->
<template>
  <ClientOnly>
    <NetworkSwitcherContent />
  </ClientOnly>
</template>

<script setup>
import { useNetwork } from '@btc-connect/vue'

const { network, switchNetwork } = useNetwork()
// 网络切换组件实现
</script>
```

## 📚 相关资源

- [API参考文档](./api_reference.md)
- [框架配置指南](./framework_setup.md)
- [钱包集成指南](./unisat_integration.md)
- [问题排查指南](./troubleshooting.md)