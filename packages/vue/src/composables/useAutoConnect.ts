import { onMounted } from 'vue'
import { useConnectWallet, useWallet } from './useCore'

export function useAutoConnect(walletId: string) {
  const { connect } = useConnectWallet()
  const { isConnected } = useWallet()

  onMounted(() => {
    if (!isConnected.value) {
      ;(async () => { try { await connect(walletId) } catch { /* silent */ } })()
    }
  })
}



