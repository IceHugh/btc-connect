import { useWalletContext } from '../context/provider';

export function useSignature() {
  const { manager } = useWalletContext();

  const signMessage = async (message: string): Promise<string> => {
    if (!manager) {
      throw new Error('Wallet manager not initialized');
    }
    const adapter = manager.getCurrentAdapter();
    if (!adapter || !adapter.signMessage) {
      throw new Error('Sign message is not supported by current wallet');
    }
    return await adapter.signMessage(message);
  };

  const signPsbt = async (psbt: string): Promise<string> => {
    if (!manager) {
      throw new Error('Wallet manager not initialized');
    }
    const adapter = manager.getCurrentAdapter();
    if (!adapter || !adapter.signPsbt) {
      throw new Error('Sign PSBT is not supported by current wallet');
    }
    return await adapter.signPsbt(psbt);
  };

  return {
    signMessage,
    signPsbt,
  };
}
