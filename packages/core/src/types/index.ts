export enum BitcoinScriptType {
  P2PKH = 'P2PKH',
  P2SH_P2WPKH = 'P2SH-P2WPKH',
  P2WPKH = 'P2WPKH',
}

export enum Network {
  LIVENET = 'livenet',
  TESTNET = 'testnet',
  REGTEST = 'regtest',
  TESTNET4 = 'testnet4',
}

export type Balance = { confirmed: number; unconfirmed: number; total: number };

export interface BtcWalletConnectOptions {
  network?: Network;
}

export type BtcConnectorId = 'unisat' | 'okx' | 'sat20';

// 如果需要为 BtcConnector 添加类型定义，可以在此处添加
export interface IBtcConnector {
  connect(): Promise<boolean>;
  disconnect(): Promise<void>;
  getAccounts(): Promise<string[]>;
  sendToAddress(toAddress: string, amount: number): Promise<string>;
  signPsbt(psbtHex: string, options?: any): Promise<string>;
  getCurrentInfo(): Promise<void>;
  // ...其他方法...
}

export type AccountsChangedEvent = (
  event: 'accountsChanged',
  handler: (accounts: Array<string>) => void,
) => void;

export type AccountChangedEvent = (
  event: 'accountChanged',
  handler: (account: string) => void,
) => void;

export type NetworkChangedEvent = (
  event: 'networkChanged',
  handler: (network: Network) => void,
) => void;

export type MessageType = 'ecdsa' | 'bip322-simple';
