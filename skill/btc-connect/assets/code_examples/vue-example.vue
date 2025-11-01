<template>
  <div class="wallet-example">
    <h2>BTC-Connect Vue 示例</h2>

    <div v-if="!isConnected">
      <button
        @click="handleConnect('unisat')"
        :disabled="isConnecting"
        class="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50 mr-2"
      >
        {{ isConnecting ? '连接中...' : '连接 UniSat' }}
      </button>
      <button
        @click="handleConnect('okx')"
        :disabled="isConnecting"
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {{ isConnecting ? '连接中...' : '连接 OKX' }}
      </button>
    </div>

    <div v-else class="space-y-6">
      <!-- 账户信息 -->
      <div class="account-info">
        <h3>账户信息</h3>
        <p><strong>地址:</strong> <span class="font-mono">{{ wallet?.address }}</span></p>
        <p v-if="account?.publicKey">
          <strong>公钥:</strong> <span class="font-mono text-xs">{{ account.publicKey }}</span>
        </p>
        <div class="balance-info">
          <p><strong>余额:</strong> {{ balance !== null ? `${balance} satoshis` : '加载中...' }}</p>
          <button @click="refreshBalance" class="refresh-btn">
            刷新余额
          </button>
        </div>
      </div>

      <!-- 网络管理 -->
      <div class="network-section">
        <h3>网络管理</h3>
        <p><strong>当前网络:</strong> <span class="current-network">{{ network }}</span></p>
        <div class="network-buttons">
          <button @click="switchToMainnet" class="network-btn mainnet">
            主网
          </button>
          <button @click="switchToTestnet" class="network-btn testnet">
            测试网
          </button>
        </div>
      </div>

      <!-- 消息签名 -->
      <div class="signature-section">
        <h3>消息签名</h3>
        <div class="signature-form">
          <input
            v-model="message"
            type="text"
            class="message-input"
            placeholder="输入要签名的消息"
          />
          <button @click="signMessage" class="sign-btn">
            签名消息
          </button>
        </div>
        <div v-if="signature" class="signature-result">
          <p class="result-label">签名结果:</p>
          <p class="signature-text">{{ signature }}</p>
        </div>
      </div>

      <!-- 断开连接 -->
      <div class="disconnect-section">
        <button @click="disconnect" class="disconnect-btn">
          断开连接
        </button>
      </div>
    </div>

    <!-- 使用说明 -->
    <div class="usage-info">
      <h3>使用说明</h3>
      <ul>
        <li>确保已安装 UniSat 或 OKX 钱包扩展</li>
        <li>点击相应按钮连接钱包</li>
        <li>连接成功后可以查看账户信息和余额</li>
        <li>支持在主网和测试网之间切换</li>
        <li>可以测试消息签名功能</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useWallet, useNetwork, useAccount, useSignature } from '@btc-connect/vue'

// 钱包相关状态
const {
  wallet,
  isConnected,
  isConnecting,
  connect,
  disconnect
} = useWallet()

const { network, switchNetwork } = useNetwork()
const { account, getBalance } = useAccount()
const { signMessage: signMsg } = useSignature()

// 组件内部状态
const balance = ref(null)
const signature = ref('')
const message = ref('Hello, Bitcoin!')

// Props
const props = defineProps({
  onConnected: Function,
  onError: Function
})

// 监听账户变化，自动获取余额
watch(account, async (newAccount) => {
  if (newAccount) {
    try {
      const bal = await getBalance()
      balance.value = bal
      props.onConnected?.(newAccount)
    } catch (error) {
      console.error('获取余额失败:', error)
    }
  }
}, { immediate: true })

// 事件处理函数
const handleConnect = async (walletId) => {
  try {
    const accounts = await connect(walletId)
    console.log('连接成功:', accounts)
  } catch (error) {
    console.error('连接失败:', error)
    props.onError?.(error)
  }
}

const switchToMainnet = async () => {
  try {
    await switchNetwork('livenet')
    console.log('网络切换成功')
  } catch (error) {
    console.error('切换失败:', error)
    props.onError?.(error)
  }
}

const switchToTestnet = async () => {
  try {
    await switchNetwork('testnet')
    console.log('网络切换成功')
  } catch (error) {
    console.error('切换失败:', error)
    props.onError?.(error)
  }
}

const refreshBalance = async () => {
  if (account.value) {
    try {
      const bal = await getBalance()
      balance.value = bal
    } catch (error) {
      console.error('获取余额失败:', error)
    }
  }
}

const signMessage = async () => {
  try {
    const sig = await signMsg(message.value)
    signature.value = sig
    console.log('签名成功:', sig)
  } catch (error) {
    console.error('签名失败:', error)
    props.onError?.(error)
  }
}

// 组件挂载时的初始化
onMounted(() => {
  console.log('Wallet example component mounted')
})
</script>

<style scoped>
.wallet-example {
  max-width: 600px;
  margin: 0 auto;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.wallet-example h2 {
  text-align: center;
  margin-bottom: 24px;
  font-size: 24px;
  font-weight: bold;
  color: #1f2937;
}

.space-y-6 > * + * {
  margin-top: 24px;
}

.account-info, .network-section, .signature-section {
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
  background: #f8fafc;
}

.account-info h3, .network-section h3, .signature-section h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.account-info p {
  margin: 8px 0;
  font-size: 14px;
}

.font-mono {
  font-family: 'Courier New', monospace;
  word-break: break-all;
}

.balance-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.refresh-btn {
  padding: 4px 8px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.refresh-btn:hover {
  background: #2563eb;
}

.network-section {
  border-left-color: #10b981;
}

.current-network {
  font-weight: 600;
  color: #059669;
}

.network-buttons {
  margin-top: 12px;
}

.network-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  margin-right: 8px;
}

.network-btn.mainnet {
  background: #10b981;
  color: white;
}

.network-btn.mainnet:hover {
  background: #059669;
}

.network-btn.testnet {
  background: #f59e0b;
  color: white;
}

.network-btn.testnet:hover {
  background: #d97706;
}

.signature-section {
  border-left-color: #8b5cf6;
}

.signature-form {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.message-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.sign-btn {
  padding: 8px 16px;
  background: #8b5cf6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.sign-btn:hover {
  background: #7c3aed;
}

.signature-result {
  margin-top: 12px;
}

.result-label {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.signature-text {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  background: #f3f4f6;
  padding: 8px;
  border-radius: 4px;
  word-break: break-all;
  line-height: 1.4;
}

.disconnect-section {
  text-align: center;
}

.disconnect-btn {
  padding: 8px 16px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.disconnect-btn:hover {
  background: #dc2626;
}

.usage-info {
  margin-top: 24px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.usage-info h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.usage-info ul {
  margin: 0;
  padding-left: 20px;
}

.usage-info li {
  margin: 6px 0;
  font-size: 14px;
  color: #6b7280;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .wallet-example {
    padding: 16px;
    margin: 16px;
  }

  .signature-form {
    flex-direction: column;
  }

  .balance-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .network-buttons {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .network-btn {
    margin-right: 0;
  }
}
</style>