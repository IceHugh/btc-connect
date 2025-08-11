import { useWalletContext } from '../walletContext'

export function useTransactions() {
  const { manager } = useWalletContext()

  const sendBitcoin = async (to: string, amount: number): Promise<string> => {
    const adapter = manager.getCurrentAdapter()
    if (!adapter || !adapter.sendBitcoin) {
      throw new Error('Send Bitcoin is not supported by current wallet')
    }
    return await adapter.sendBitcoin(to, amount)
  }

  return { sendBitcoin }
}



