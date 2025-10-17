import { computed } from 'vue'
import { useWalletContext } from '../walletContext'

export function useAccount() {
  const ctx = useWalletContext()
  const address = computed(() => ctx.state.currentAccount?.address || null)
  const publicKey = computed(() => ctx.state.currentAccount?.publicKey)
  const balance = computed(() => ctx.state.currentAccount?.balance || null)
  const currentAccount = computed(() => ctx.state.currentAccount || null)
  const isConnected = computed(() => ctx.state.status === 'connected')
  const disconnect = computed(() => ctx.disconnect)

  return {
    address,
    publicKey,
    balance,
    currentAccount,
    isConnected,
    disconnect
  }
}



