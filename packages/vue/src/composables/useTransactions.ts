import { ref } from 'vue';
import { useWalletContext } from '../walletContext';

/**
 * 使用交易功能的Composable
 */
export function useTransactions() {
  const { manager } = useWalletContext();
  const isSending = ref(false);

  const sendBitcoin = async (toAddress: string, amount: number): Promise<string> => {
    console.log('🚀 [Vue useTransactions] sendBitcoin called', { toAddress, amount });

    if (!manager.value) {
      console.error('❌ [Vue useTransactions] Manager not initialized');
      throw new Error('Wallet manager not initialized');
    }

    const adapter = manager.value.getCurrentAdapter();
    console.log('🔍 [Vue useTransactions] Current adapter:', adapter?.name, 'has sendBitcoin:', !!adapter?.sendBitcoin);

    if (!adapter || !adapter.sendBitcoin) {
      console.error('❌ [Vue useTransactions] Adapter or sendBitcoin method not available');
      throw new Error('Send Bitcoin is not supported by current wallet');
    }

    try {
      console.log('📤 [Vue useTransactions] Calling adapter.sendBitcoin...');
      isSending.value = true;
      const result = await adapter.sendBitcoin(toAddress, amount);
      console.log('✅ [Vue useTransactions] sendBitcoin success:', result);
      return result;
    } catch (error) {
      console.error('❌ [Vue useTransactions] sendBitcoin failed:', error);
      throw error;
    } finally {
      isSending.value = false;
    }
  };

  const sendTransaction = async (psbt: string): Promise<string> => {
    if (!manager.value) {
      throw new Error('Wallet manager not initialized');
    }

    const adapter = manager.value.getCurrentAdapter();
    if (!adapter || !adapter.signPsbt) {
      throw new Error('Send transaction is not supported by current wallet');
    }

    try {
      isSending.value = true;
      return await adapter.signPsbt(psbt);
    } finally {
      isSending.value = false;
    }
  };

  return {
    sendBitcoin,
    sendTransaction,
    isSending
  };
}