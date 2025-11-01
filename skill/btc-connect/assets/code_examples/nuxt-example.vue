<script setup>
import { ref, onMounted, watch } from 'vue'

// 🆕 Vue v0.4.0+ 统一 API
const wallet = useWallet()

// 响应式数据
const balance = ref(null)
const account = ref(null)

// 组件挂载后初始化
onMounted(async () => {
  console.log('Nuxt 3 钱包组件已挂载')

  // 如果已连接，获取账户信息
  if (wallet.isConnected && wallet.currentWallet) {
    await refreshAccountInfo()
  }
})

// 刷新账户信息
const refreshAccountInfo = async () => {
  if (wallet.currentWallet) {
    try {
      // 获取余额
      const bal = await wallet.getBalance()
      balance.value = bal

      // 获取账户详情
      const acc = await wallet.getAccount()
      account.value = acc
    } catch (error) {
      console.error('获取账户信息失败:', error)
    }
  }
}

// 连接钱包
const handleConnect = async (walletId) => {
  try {
    const accounts = await wallet.connect(walletId)
    console.log('连接成功:', accounts)

    // 连接成功后刷新账户信息
    await refreshAccountInfo()
  } catch (error) {
    console.error('连接失败:', error)
  }
}

// 🆕 网络切换
const handleSwitchNetwork = async (targetNetwork) => {
  try {
    await wallet.switchNetwork(targetNetwork)
    console.log('网络切换成功')
  } catch (error) {
    console.error('网络切换失败:', error)

    // 针对不同钱包的错误处理
    if (wallet.currentWallet?.id === 'okx') {
      console.log('OKX 钱包需要在钱包中手动切换网络')
    }
  }
}

// 消息签名
const handleSignMessage = async (message) => {
  try {
    const signature = await wallet.signMessage(message)
    console.log('签名成功:', signature)
    return signature
  } catch (error) {
    console.error('签名失败:', error)
  }
}

// 刷新余额
const handleRefreshBalance = async () => {
  if (wallet.currentWallet) {
    try {
      const bal = await wallet.getBalance()
      balance.value = bal
    } catch (error) {
      console.error('获取余额失败:', error)
    }
  }
}

// 监听钱包状态变化
watch(() => wallet.isConnected, async (isConnected) => {
  if (isConnected) {
    await refreshAccountInfo()
  } else {
    // 断开连接时清空数据
    balance.value = null
    account.value = null
  }
})

// 监听网络变化
watch(() => wallet.network, (newNetwork) => {
  if (newNetwork) {
    console.log('网络已切换到:', newNetwork)
  }
})

// 暴露给模板的数据和方法
defineExpose({
  // 状态
  isConnected: wallet.isConnected,
  isConnecting: wallet.isConnecting,
  isNetworkSwitching: wallet.isNetworkSwitching,
  network: wallet.network,
  wallet: wallet.currentWallet,
  account,
  balance,

  // 操作方法
  connect: handleConnect,
  disconnect: wallet.disconnect,
  switchNetwork: handleSwitchNetwork,
  signMessage: handleSignMessage,
  getBalance: wallet.getBalance,
  refreshBalance: handleRefreshBalance
})
</script>

<template>
  <ClientOnly>
    <!-- 在这里使用暴露的数据和方法 -->
    <div v-if="!wallet.isConnected">
      <button @click="() => handleConnect('unisat')">
        连接 UniSat
      </button>
      <button @click="() => handleConnect('okx')">
        连接 OKX
      </button>
    </div>

    <div v-else>
      <div>已连接到: {{ wallet.currentWallet?.name }}</div>
      <div>当前网络: {{ wallet.network }}</div>
      <div v-if="account">
        <div>地址: {{ account.address }}</div>
        <div>余额: {{ balance }} satoshis</div>
      </div>

      <!-- 网络切换 -->
      <div>
        <button @click="() => handleSwitchNetwork('livenet')" :disabled="wallet.isNetworkSwitching">
          主网
        </button>
        <button @click="() => handleSwitchNetwork('testnet')" :disabled="wallet.isNetworkSwitching">
          测试网
        </button>
        <button @click="() => handleSwitchNetwork('regtest')" :disabled="wallet.isNetworkSwitching">
          回归测试网
        </button>
      </div>

      <button @click="wallet.disconnect">
        断开连接
      </button>
    </div>
  </ClientOnly>
</template>