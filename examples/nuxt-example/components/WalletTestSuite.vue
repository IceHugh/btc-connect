<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
    <!-- 页头 -->
    <header class="bitcoin-gradient text-white shadow-lg mb-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="text-center">
          <h1 class="text-3xl font-bold mb-2">🔗 BTC Connect 完整测试套件</h1>
          <p class="text-orange-100">Nuxt 3 + Vue 3 钱包功能完整测试</p>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto">
      <!-- 状态概览卡片 -->
      <div class="wallet-card mb-8">
        <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          📊 钱包状态概览
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {{ isConnected ? '✅' : '❌' }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              连接状态
            </div>
          </div>
          <div class="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div class="text-2xl font-bold text-green-600 dark:text-green-400">
              {{ accounts.length }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              账户数量
            </div>
          </div>
          <div class="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {{ currentNetwork || '未知' }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              当前网络
            </div>
          </div>
        </div>

        <!-- 详细状态信息 -->
        <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-3 bg-gray-50 dark:bg-gray-800 rounded">
            <span class="font-semibold">当前地址:</span>
            <span class="ml-2 text-sm">{{ address || '无' }}</span>
          </div>
          <div class="p-3 bg-gray-50 dark:bg-gray-800 rounded">
            <span class="font-semibold">余额:</span>
            <span class="ml-2">{{ balanceInfo ? `${balanceInfo.total || 0} BTC` : '未知' }}</span>
          </div>
        </div>

        <div v-if="error" class="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded text-red-600 dark:text-red-400">
          <span class="font-semibold">错误:</span> {{ error.message }}
        </div>
      </div>

      <!-- AutoConnect 状态监控 -->
      <AutoConnectStatusCard class="mb-8" />

      <!-- 测试控制 -->
      <div class="wallet-card mb-8">
        <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          🎮 测试控制
        </h2>
        <div class="flex flex-wrap gap-3">
          <button
            @click="runAllTests"
            :disabled="isRunning"
            class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="isRunning">⏳ 运行中...</span>
            <span v-else>🚀 运行所有测试</span>
          </button>
          <button
            @click="clearLogs"
            class="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            🗑️ 清除日志
          </button>
          <button
            @click="openModal()"
            class="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            🔗 打开钱包选择器
          </button>
        </div>
      </div>

      <!-- 单项测试按钮 -->
      <div class="wallet-card mb-8">
        <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          🧪 单项测试
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            @click="testConnection"
            :disabled="isRunning"
            class="test-button"
          >
            🔗 连接测试
          </button>
          <button
            @click="testAccounts"
            :disabled="isRunning"
            class="test-button"
          >
            👤 账户信息测试
          </button>
          <button
            @click="testBalance"
            :disabled="isRunning"
            class="test-button"
          >
            💰 余额测试
          </button>
          <button
            @click="testNetwork"
            :disabled="isRunning"
            class="test-button"
          >
            🌐 网络测试
          </button>
          <button
            @click="testSignature"
            :disabled="isRunning"
            class="test-button"
          >
            ✍️ 消息签名测试
          </button>
          <button
            @click="testPsbtSignature"
            :disabled="isRunning"
            class="test-button"
          >
            📝 PSBT签名测试
          </button>
          <button
            @click="testTransaction"
            :disabled="isRunning"
            class="test-button"
          >
            📤 交易测试
          </button>
          <button
            @click="testModal"
            :disabled="isRunning"
            class="test-button"
          >
            🪟 模态框测试
          </button>
          <button
            @click="testWalletSwitch"
            :disabled="isRunning"
            class="test-button"
          >
            🔄 钱包切换测试
          </button>
          <button
            @click="testDisconnection"
            :disabled="isRunning"
            class="test-button"
          >
            ❌ 断开连接测试
          </button>
        </div>
      </div>

      <!-- 测试结果 -->
      <div v-if="Object.keys(testResults).length > 0" class="wallet-card mb-8">
        <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          📈 测试结果
        </h2>
        <div class="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
          <div
            v-for="[test, result] in Object.entries(testResults)"
            :key="test"
            class="mb-2"
          >
            <span class="text-yellow-400">{{ test }}:</span> {{ result }}
          </div>
        </div>
      </div>

      <!-- 实时日志 -->
      <div class="wallet-card">
        <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          📝 实时日志
        </h2>
        <div class="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-64 overflow-y-auto">
          <div v-if="logs.length === 0" class="text-gray-500 italic">
            等待测试开始...
          </div>
          <div
            v-else
            v-for="(log, index) in logs"
            :key="index"
            class="mb-1"
          >
            {{ log }}
          </div>
        </div>
      </div>

      <!-- 说明信息 -->
      <div class="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 class="text-lg font-semibold mb-3 text-blue-800 dark:text-blue-200">
          ℹ️ 测试说明
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p class="font-semibold text-blue-700 dark:text-blue-300">基础功能:</p>
            <ul class="ml-4 space-y-1 text-gray-700 dark:text-gray-300">
              <li>🔗 <strong>连接测试:</strong> 测试钱包连接功能</li>
              <li>👤 <strong>账户测试:</strong> 获取账户信息和公钥</li>
              <li>💰 <strong>余额测试:</strong> 获取已确认和未确认余额</li>
              <li>🌐 <strong>网络测试:</strong> 获取当前网络并尝试切换</li>
            </ul>
          </div>
          <div>
            <p class="font-semibold text-blue-700 dark:text-blue-300">高级功能:</p>
            <ul class="ml-4 space-y-1 text-gray-700 dark:text-gray-300">
              <li>✍️ <strong>消息签名:</strong> 测试消息签名功能</li>
              <li>📝 <strong>PSBT签名:</strong> 测试PSBT功能</li>
              <li>📤 <strong>交易测试:</strong> 演示比特币发送功能</li>
              <li>🔄 <strong>钱包切换:</strong> 测试在不同钱包间切换</li>
            </ul>
          </div>
        </div>
        <p class="mt-4 text-xs text-gray-600 dark:text-gray-400">
          <strong>注意:</strong> 某些功能可能需要特定的钱包支持。测试前请确保已安装并启用相应的比特币钱包扩展。
        </p>
      </div>

    </main>

    <!-- 全局模态框 -->
    <ClientOnly>
      <WalletModal />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
// 导入所需的 composables
import {
  useWallet,
  useCore,
  useAccount,
  useConnectWallet,
  useBalance,
  useWalletModal,
  useSignature,
  useTransactions,
  useNetwork,
  useWalletInfo
} from '@btc-connect/vue'

// 页面元数据
useHead({
  title: 'BTC Connect - 完整测试套件',
  meta: [
    { name: 'description', content: 'Bitcoin wallet connection complete test suite using Nuxt 3' }
  ]
})

// 状态管理
const logs = ref<string[]>([])
const testResults = ref<Record<string, string>>({})
const isRunning = ref(false)

// 钱包状态
const { status, accounts, currentAccount, network, error, isConnected, isConnecting, address, balance, publicKey } = useWallet()
const { connect, disconnect, switchWallet, availableWallets } = useConnectWallet()
const { open: openModal, isOpen: isModalOpen } = useWalletModal()
const { network: currentNetwork, switchNetwork } = useNetwork()
const { accounts: accountList } = useAccount()
const { balance: balanceInfo } = useBalance()
const { signMessage, signPsbt } = useSignature()
const { sendBitcoin } = useTransactions()

// 工具函数
const addLog = (message: string) => {
  const timestamp = new Date().toLocaleTimeString()
  logs.value = [...logs.value.slice(-9), `${timestamp}: ${message}`]
}

const addTestResult = (test: string, result: string) => {
  testResults.value = { ...testResults.value, [test]: result }
  addLog(`${test}: ${result}`)
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// 测试函数
const testConnection = async () => {
  try {
    addTestResult('连接测试', '开始连接...')
    if (!isConnected.value) {
      await connect('unisat')
      addTestResult('连接测试', '✅ 连接成功')
    } else {
      addTestResult('连接测试', 'ℹ️ 已经连接')
    }
  } catch (error) {
    addTestResult('连接测试', `❌ 连接失败: ${error instanceof Error ? error.message : String(error)}`)
  }
}

const testAccounts = async () => {
  try {
    addTestResult('账户测试', '获取账户信息...')
    if (!isConnected.value) {
      addTestResult('账户测试', '❌ 请先连接钱包')
      return
    }

    addTestResult('账户测试', `✅ 账户数量: ${accounts.value.length}`)
    addTestResult('当前账户', `✅ 地址: ${address.value || '无'}`)
    addTestResult('公钥测试', `✅ 公钥: ${publicKey.value ? '已获取' : '未获取'}`)
  } catch (error) {
    addTestResult('账户测试', `❌ 账户测试失败: ${error instanceof Error ? error.message : String(error)}`)
  }
}

const testBalance = async () => {
  try {
    addTestResult('余额测试', '获取余额信息...')
    if (!isConnected.value) {
      addTestResult('余额测试', '❌ 请先连接钱包')
      return
    }

    if (balanceInfo.value) {
      addTestResult('余额测试', `✅ 已确认: ${balanceInfo.value.confirmed || 0} BTC`)
      addTestResult('未确认余额', `✅ 未确认: ${balanceInfo.value.unconfirmed || 0} BTC`)
      addTestResult('总余额', `✅ 总计: ${balanceInfo.value.total || 0} BTC`)
    } else {
      addTestResult('余额测试', 'ℹ️ 余额信息为空')
    }
  } catch (error) {
    addTestResult('余额测试', `❌ 余额测试失败: ${error instanceof Error ? error.message : String(error)}`)
  }
}

const testNetwork = async () => {
  try {
    addTestResult('网络测试', '获取网络信息...')
    if (!isConnected.value) {
      addTestResult('网络测试', '❌ 请先连接钱包')
      return
    }

    const networkName = currentNetwork.value?.name || currentNetwork.value || '未知'
    addTestResult('当前网络', `✅ 当前网络: ${networkName}`)

    // 尝试切换到测试网
    if (networkName && networkName !== 'testnet') {
      try {
        await switchNetwork('testnet')
        addTestResult('网络切换', '✅ 已切换到测试网')
      } catch (error) {
        addTestResult('网络切换', `ℹ️ 切换失败（可能不支持）: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
  } catch (error) {
    addTestResult('网络测试', `❌ 网络测试失败: ${error instanceof Error ? error.message : String(error)}`)
  }
}

const testSignature = async () => {
  try {
    addTestResult('签名测试', '开始消息签名测试...')
    if (!isConnected.value) {
      addTestResult('签名测试', '❌ 请先连接钱包')
      return
    }

    const testMessage = 'BTC Connect 测试消息 - ' + new Date().toISOString()
    const signature = await signMessage(testMessage)
    addTestResult('消息签名', `✅ 签名成功，长度: ${signature.length}`)
    addTestResult('签名内容', `✅ 签名: ${signature.substring(0, 20)}...`)
  } catch (error) {
    addTestResult('消息签名', `❌ 签名失败: ${error instanceof Error ? error.message : String(error)}`)
  }
}

const testPsbtSignature = async () => {
  try {
    addTestResult('PSBT签名测试', '开始PSBT签名测试...')
    if (!isConnected.value) {
      addTestResult('PSBT签名测试', '❌ 请先连接钱包')
      return
    }

    // 示例PSBT
    const testPsbt = 'cHNldP8BAHUCAAAAASaBcTce3u7JuyxvGB1J9nGQk8jKtzQZpq7a8C7m3COAAAAAAD/////////aLKkAAAAAABYAFOvsZAAAAGXapLMCqJDB9CGVMhKbTRV4F5bGpBAAAAAP7///8CYFvKAAAAFgAUk7d6Jq6FqAQVIRsJhvLZd8vnLWbAAAAABYAFOvsZAAAAGXapLMCqJDB9CGVMhKbTRV4F5bGpBAAAAAAAAAAAAAQAEAQIAAAAAACIAIBIkCrVlAVrLAmK0opVb6L7aZujhY1h0cW00Uz9lqJ8AAAAAABYAFMr+kKqT4QGZjwQdS0R3g7Aq1yvVbIgMEQIEAhgAgL7YQAAAAAAiAgL5Q7VdWRa4Q7rTKQOxIVaYjqmzZ1JR7c8qJpgA4AAAAAAAABgUT'

    const signedPsbt = await signPsbt(testPsbt)
    addTestResult('PSBT签名', `✅ PSBT签名成功，长度: ${signedPsbt.length}`)
  } catch (error) {
    addTestResult('PSBT签名', `❌ PSBT签名失败: ${error instanceof Error ? error.message : String(error)}`)
  }
}

const testTransaction = async () => {
  try {
    addTestResult('交易测试', '开始发送比特币测试...')
    if (!isConnected.value) {
      addTestResult('交易测试', '❌ 请先连接钱包')
      return
    }

    const testAddress = 'tb1qxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
    const testAmount = 0.00001

    addTestResult('交易测试', `ℹ️ 准备发送 ${testAmount} BTC 到 ${testAddress}`)
    addTestResult('交易测试', '⚠️ 这是一个演示，不会实际发送交易')
  } catch (error) {
    addTestResult('交易测试', `❌ 交易测试失败: ${error instanceof Error ? error.message : String(error)}`)
  }
}

const testModal = () => {
  try {
    if (isModalOpen.value) {
      addTestResult('模态框测试', 'ℹ️ 模态框已打开')
    } else {
      openModal()
      addTestResult('模态框测试', '✅ 模态框已打开')
    }
  } catch (error) {
    addTestResult('模态框测试', `❌ 模态框测试失败: ${error instanceof Error ? error.message : String(error)}`)
  }
}

const testWalletSwitch = async () => {
  try {
    addTestResult('钱包切换测试', '获取可用钱包...')

    const otherWallets = availableWallets.value.filter((w: any) => !w.id.includes(currentAccount.value?.address || ''))
    if (otherWallets.length > 0) {
      const targetWallet = otherWallets[0]
      await switchWallet(targetWallet.id)
      addTestResult('钱包切换', `✅ 已切换到: ${targetWallet.name}`)
    } else {
      addTestResult('钱包切换', 'ℹ️ 没有其他可用的钱包')
    }
  } catch (error) {
    addTestResult('钱包切换测试', `❌ 钱包切换失败: ${error instanceof Error ? error.message : String(error)}`)
  }
}

const testDisconnection = async () => {
  try {
    addTestResult('断开测试', '开始断开连接...')
    if (isConnected.value) {
      await disconnect()
      addTestResult('断开测试', '✅ 已断开连接')
    } else {
      addTestResult('断开测试', 'ℹ️ 钱包未连接')
    }
  } catch (error) {
    addTestResult('断开测试', `❌ 断开连接失败: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// 运行所有测试
const runAllTests = async () => {
  isRunning.value = true
  addLog('🚀 开始运行完整测试套件...')

  try {
    // 按顺序执行测试
    await testConnection()
    await delay(1000)

    await testAccounts()
    await delay(500)

    await testBalance()
    await delay(500)

    await testNetwork()
    await delay(500)

    await testSignature()
    await delay(500)

    await testPsbtSignature()
    await delay(500)

    await testTransaction()
    await delay(500)

    testModal()
    await delay(500)

    await testWalletSwitch()

    addLog('✅ 测试套件执行完成！')
  } catch (error) {
    addLog(`❌ 测试套件执行失败: ${error instanceof Error ? error.message : String(error)}`)
  } finally {
    isRunning.value = false
  }
}

// 清除日志
const clearLogs = () => {
  logs.value = []
  testResults.value = {}
  addLog('📝 日志已清除')
}

// 事件监听
onMounted(() => {
  // 监听钱包事件
  const { manager } = useCore()

  if (manager.value) {
    manager.value.on('connect', (params) => {
      addLog(`钱包已连接，账户数量: ${params.accounts.length}`)
    })

    manager.value.on('disconnect', () => {
      addLog('钱包已断开连接')
    })

    manager.value.on('accountChange', (params) => {
      addLog(`账户已变更，新账户数量: ${params.accounts.length}`)
    })

    manager.value.on('networkChange', (params) => {
      addLog(`网络已切换到: ${params.network}`)
    })
  }
})
</script>

<style scoped>
.test-button {
  @apply px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors;
}

.bitcoin-gradient {
  background: linear-gradient(135deg, #f7931a 0%, #ff6b35 100%);
}

.wallet-card {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700;
}

/* 自定义滚动条样式 */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.5);
}
</style>