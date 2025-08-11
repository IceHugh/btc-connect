import { useEffect } from 'react';
import { useConnectWallet, useWallet } from '../context';

export function useAutoConnect(walletId: string) {
  const { connect } = useConnectWallet();
  const { isConnected } = useWallet();

  useEffect(() => {
    if (!isConnected) {
      const tryAutoConnect = async () => {
        try {
          await connect(walletId);
        } catch (error) {
          console.warn('Auto connect failed:', error);
        }
      };
      tryAutoConnect();
    }
  }, [isConnected, connect, walletId]);
}
