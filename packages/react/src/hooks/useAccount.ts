import { useWalletContext } from '../context/provider';

export function useAccount() {
  const { state } = useWalletContext();
  const { accounts, currentAccount } = state;

  const address = currentAccount?.address || null;
  const publicKey = currentAccount?.publicKey || null;

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
