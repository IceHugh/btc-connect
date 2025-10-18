import { useWallet } from './hooks';

export function useAccount() {
  const { address, publicKey, currentAccount, accounts } = useWallet();
  return {
    address,
    publicKey,
    currentAccount,
    accounts,
    hasAccounts: accounts.length > 0,
    hasPublicKey: !!publicKey,
    hasAddress: !!address,
  };
}
