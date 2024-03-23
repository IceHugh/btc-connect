export enum BitcoinScriptType {
  P2PKH = 'P2PKH',
  P2SH_P2WPKH = 'P2SH-P2WPKH',
  P2WPKH = 'P2WPKH',
}

export type WalletNetwork = 'livenet' | 'testnet';

export type Balance = { confirmed: number; unconfirmed: number; total: number };
