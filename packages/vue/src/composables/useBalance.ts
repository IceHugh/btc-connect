import { computed } from 'vue'
import { useWallet } from './useCore'
import type { BalanceDetail } from '../types'

export function useBalance() {
  const { state } = useWallet()
  return computed(() => {
    const bal: any = state.value.currentAccount?.balance
    if (bal && typeof bal === 'object' && typeof bal.total === 'number') {
      return bal as BalanceDetail
    }
    return null
  })
}



