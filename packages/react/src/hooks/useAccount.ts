import { useWallet } from '../context';

export function useAccount() {
  const { address, currentAccount } = useWallet();
  return { address, publicKey: currentAccount?.publicKey };
}


