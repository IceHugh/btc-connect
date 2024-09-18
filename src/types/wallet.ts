export interface BtcWalletConnectOptions {
  network?: BtcWalletNetwork;
  defaultConnectorId?: BtcConnectorId;
}
export type BtcWalletNetwork = 'livenet' | 'testnet';
export type BtcConnectorId = 'unisat' | 'okx' | 'sat20';

export type AccountsChangedEvent = (
  event: 'accountsChanged',
  handler: (accounts: Array<string>) => void,
) => void;
export type AccountChangedEvent = (
  event: 'accountChanged',
  handler: (account: any) => void,
) => void;

export type NetworkChangedEvent = (
  event: 'networkChanged',
  handler: (network: BtcWalletNetwork) => void,
) => void;

export type MessageType = 'ecdsa' | 'bip322-simple';
