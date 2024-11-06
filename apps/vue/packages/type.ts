import { Network } from 'btc-connect-core';
export interface BtcWalletConnectConfig {
  defaultNetwork?: Network;
  networkForce?: boolean;
  message?: string;
}
export type Balance = { confirmed: number; unconfirmed: number; total: number };
