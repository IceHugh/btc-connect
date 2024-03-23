export interface BtcWalletConnectOptions {
  network?: BrcWalletNetwork;
  defaultConnectorId?: BtcConnectorId;
}
export type BrcWalletNetwork = 'livenet' | 'testnet';
export type BtcConnectorId = 'unisat' | 'okx';

export type AccountsChangedEvent = (
  event: 'networkChanged',
  handler: (accounts: Array<string>) => void
) => void;

export type NetworkChangedEvent = (
  event: 'networkChanged',
  handler: (network: BrcWalletNetwork) => void
) => void;

export type MessageType = 'ecdsa' | 'bip322-simple';
