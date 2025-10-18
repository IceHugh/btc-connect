<template>
  <div class="wallet-demo">
    <h1>BTC Connect Vue Demo</h1>

    <!-- Connection Section -->
    <div class="connection-section">
      <ConnectButton theme="light" label="Connect Wallet" />
      <WalletModal />
    </div>

    <!-- Wallet Info -->
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

    <!-- Transaction Test Section -->
    <div v-if="isConnected" class="transaction-section">
      <h2>Transaction Test</h2>

      <!-- Send Bitcoin Test -->
      <div class="test-block">
        <h3>Send Bitcoin Test</h3>
        <div class="form-group">
          <label>To Address:</label>
          <input
            v-model="toAddress"
            placeholder="Enter Bitcoin address"
            class="address-input"
          />
        </div>
        <div class="form-group">
          <label>Amount (satoshis):</label>
          <input
            v-model.number="amount"
            type="number"
            placeholder="Enter amount in satoshis"
            class="amount-input"
          />
        </div>
        <button
          @click="testSendBitcoin"
          :disabled="isSending || !toAddress || !amount"
          class="send-button"
        >
          {{ isSending ? 'Sending...' : 'Send Bitcoin' }}
        </button>
        <div v-if="txHash" class="result">
          <label>Transaction Hash:</label>
          <span class="tx-hash">{{ txHash }}</span>
        </div>
        <div v-if="sendError" class="error">
          <label>Error:</label>
          <span class="error-message">{{ sendError }}</span>
        </div>
      </div>

      <!-- Sign Message Test -->
      <div class="test-block">
        <h3>Sign Message Test</h3>
        <div class="form-group">
          <label>Message:</label>
          <input
            v-model="message"
            placeholder="Enter message to sign"
            class="message-input"
          />
        </div>
        <button
          @click="testSignMessage"
          :disabled="isSigning || !message"
          class="sign-button"
        >
          {{ isSigning ? 'Signing...' : 'Sign Message' }}
        </button>
        <div v-if="signature" class="result">
          <label>Signature:</label>
          <span class="signature">{{ signature }}</span>
        </div>
        <div v-if="signError" class="error">
          <label>Error:</label>
          <span class="error-message">{{ signError }}</span>
        </div>
      </div>
    </div>

    <!-- Debug Info -->
    <div v-if="isConnected" class="debug-section">
      <h3>Debug Information</h3>
      <div class="debug-info">
        <div>Manager exists: {{ !!manager }}</div>
        <div>Current Adapter: {{ manager?.getCurrentAdapter()?.name || 'None' }}</div>
        <div>Adapter supports sendBitcoin: {{ !!manager?.getCurrentAdapter()?.sendBitcoin }}</div>
        <div>Adapter supports signMessage: {{ !!manager?.getCurrentAdapter()?.signMessage }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  ConnectButton,
  WalletModal,
  useCore,
  useAccount,
  useNetwork,
  useBalance,
  useTransactions,
  useSignature
} from '@btc-connect/vue'

// Core wallet hooks
const { manager, isConnected, currentWallet } = useCore()
const { address } = useAccount()
const { network } = useNetwork()
const { balance } = useBalance()

// Transaction hooks
const { sendBitcoin, isSending } = useTransactions()
const { signMessage, isSigning } = useSignature()

// Form data
const toAddress = ref('')
const amount = ref(1000) // Default 1000 satoshis
const message = ref('Hello from BTC Connect!')

// Results
const txHash = ref('')
const signature = ref('')
const sendError = ref('')
const signError = ref('')

// Computed properties
const shortAddress = computed(() => {
  if (!address.value) return ''
  return `${address.value.slice(0, 6)}...${address.value.slice(-4)}`
})

const formattedBalance = computed(() => {
  if (!balance.value) return '0 sat'
  return `${balance.value.total} satoshis`
})

// Test functions
const testSendBitcoin = async () => {
  console.log('🚀 Starting sendBitcoin test')
  console.log('To address:', toAddress.value)
  console.log('Amount:', amount.value)

  if (!manager.value) {
    console.error('❌ Manager is not initialized')
    sendError.value = 'Manager is not initialized'
    return
  }

  const adapter = manager.value.getCurrentAdapter()
  console.log('Current adapter:', adapter?.name)
  console.log('Adapter supports sendBitcoin:', !!adapter?.sendBitcoin)

  if (!adapter) {
    console.error('❌ No adapter found')
    sendError.value = 'No wallet adapter found'
    return
  }

  if (!adapter.sendBitcoin) {
    console.error('❌ Adapter does not support sendBitcoin')
    sendError.value = 'Current wallet does not support sendBitcoin'
    return
  }

  try {
    console.log('📤 Calling sendBitcoin...')
    sendError.value = ''
    txHash.value = ''

    const hash = await sendBitcoin(toAddress.value, amount.value)
    console.log('✅ sendBitcoin successful:', hash)
    txHash.value = hash
  } catch (error) {
    console.error('❌ sendBitcoin failed:', error)
    sendError.value = error instanceof Error ? error.message : 'Unknown error'
  }
}

const testSignMessage = async () => {
  console.log('🚀 Starting signMessage test')
  console.log('Message:', message.value)

  if (!manager.value) {
    console.error('❌ Manager is not initialized')
    signError.value = 'Manager is not initialized'
    return
  }

  const adapter = manager.value.getCurrentAdapter()
  console.log('Current adapter:', adapter?.name)
  console.log('Adapter supports signMessage:', !!adapter?.signMessage)

  if (!adapter) {
    console.error('❌ No adapter found')
    signError.value = 'No wallet adapter found'
    return
  }

  if (!adapter.signMessage) {
    console.error('❌ Adapter does not support signMessage')
    signError.value = 'Current wallet does not support signMessage'
    return
  }

  try {
    console.log('📝 Calling signMessage...')
    signError.value = ''
    signature.value = ''

    const sig = await signMessage(message.value)
    console.log('✅ signMessage successful:', sig)
    signature.value = sig
  } catch (error) {
    console.error('❌ signMessage failed:', error)
    signError.value = error instanceof Error ? error.message : 'Unknown error'
  }
}
</script>

<style scoped>
.wallet-demo {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.connection-section {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
}

.wallet-info, .transaction-section, .debug-section {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.info-grid {
  display: grid;
  gap: 12px;
  margin-top: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.info-item label {
  font-weight: 600;
  color: #666;
}

.address {
  font-family: monospace;
  font-size: 14px;
}

.test-block {
  background: white;
  padding: 16px;
  border-radius: 6px;
  margin-bottom: 16px;
  border: 1px solid #ddd;
}

.form-group {
  margin-bottom: 12px;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
}

.address-input, .amount-input, .message-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

.send-button, .sign-button {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.send-button:hover:not(:disabled), .sign-button:hover:not(:disabled) {
  background: #0056b3;
}

.send-button:disabled, .sign-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.result, .error {
  margin-top: 12px;
  padding: 8px;
  border-radius: 4px;
}

.result {
  background: #d4edda;
  border: 1px solid #c3e6cb;
}

.error {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
}

.tx-hash, .signature {
  font-family: monospace;
  font-size: 12px;
  word-break: break-all;
  color: #155724;
}

.error-message {
  color: #721c24;
}

.debug-info {
  background: #fff3cd;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #ffeaa7;
  font-family: monospace;
  font-size: 12px;
}

.debug-info > div {
  margin-bottom: 4px;
}

h1, h2, h3 {
  color: #333;
}

h2 {
  margin-top: 0;
  border-bottom: 2px solid #eee;
  padding-bottom: 8px;
}
</style>