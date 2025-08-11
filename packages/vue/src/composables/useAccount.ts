import { computed } from 'vue'
import { useWalletContext } from '../walletContext'

export function useAccount() {
  const ctx = useWalletContext()
  const address = computed(() => ctx.state.currentAccount?.address || null)
  const publicKey = computed(() => ctx.state.currentAccount?.publicKey)
  return { address, publicKey }
}



