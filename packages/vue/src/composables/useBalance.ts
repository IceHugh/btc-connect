import { computed } from 'vue'
import { useWallet } from './useCore'

export interface BalanceDetail { confirmed: number; unconfirmed: number; total: number }

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



