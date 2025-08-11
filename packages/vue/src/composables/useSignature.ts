import { useWalletContext } from '../walletContext'

export function useSignature() {
  const { manager } = useWalletContext()

  const signMessage = async (message: string): Promise<string> => {
    const adapter = manager.getCurrentAdapter()
    if (!adapter || !adapter.signMessage) {
      throw new Error('Sign message is not supported by current wallet')
    }
    return await adapter.signMessage(message)
  }

  const signPsbt = async (psbt: string): Promise<string> => {
    const adapter = manager.getCurrentAdapter()
    if (!adapter || !adapter.signPsbt) {
      throw new Error('Sign PSBT is not supported by current wallet')
    }
    return await adapter.signPsbt(psbt)
  }

  return { signMessage, signPsbt }
}



