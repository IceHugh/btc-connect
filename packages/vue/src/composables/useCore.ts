import { computed } from 'vue'
import { useWalletContext } from '../walletContext'

export function useWallet() {
  const ctx = useWalletContext()
  return {
    state: computed(() => ctx.state),
    currentWallet: computed(() => ctx.currentWallet),
    isConnected: computed(() => ctx.isConnected),
    isConnecting: computed(() => ctx.isConnecting),
  }
}

export function useConnectWallet() {
  const { connect, disconnect, switchWallet, availableWallets } = useWalletContext()
  return {
    connect,
    disconnect,
    switchWallet,
    availableWallets,
  }
}



