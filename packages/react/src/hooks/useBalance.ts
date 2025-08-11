import { useWallet } from '../context';
import type { BalanceDetail } from '../types';

export function useBalance(): BalanceDetail | null {
  const { balance } = useWallet();
  return balance as BalanceDetail | null;
}
