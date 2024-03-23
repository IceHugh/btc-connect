import { unisatLogo } from '../assets';
import { WalletNetwork, Balance } from '../types';
import { BtcConnector } from './base';

const getUnisatNetwork = (network: WalletNetwork): WalletNetwork => {
  switch (network) {
    case 'testnet':
      return 'testnet';
    default:
      return 'livenet';
  }
};

export namespace UnisatWalletTypes {
  export type AccountsChangedEvent = (
    event: 'accountsChanged' | 'networkChanged',
    handler: (accounts: Array<string> | string) => void
  ) => void;

  export type Inscription = {
    inscriptionId: string;
    inscriptionNumber: string;
    address: string;
    outputValue: string;
    content: string;
    contentLength: string;
    contentType: string;
    preview: string;
    timestamp: number;
    offset: number;
    genesisTransaction: string;
    location: string;
  };

  export type GetInscriptionsResult = { total: number; list: Inscription[] };

  export type SendInscriptionsResult = { txid: string };

  export type Network = 'livenet' | 'testnet';
}
export type Unisat = {
  requestAccounts: () => Promise<string[]>;
  getAccounts: () => Promise<string[]>;
  on: UnisatWalletTypes.AccountsChangedEvent;
  removeListener: UnisatWalletTypes.AccountsChangedEvent;
  getInscriptions: (
    cursor: number,
    size: number
  ) => Promise<UnisatWalletTypes.GetInscriptionsResult>;
  sendInscription: (
    address: string,
    inscriptionId: string,
    options?: { feeRate: number }
  ) => Promise<UnisatWalletTypes.SendInscriptionsResult>;
  switchNetwork: (network: 'livenet' | 'testnet') => Promise<void>;
  getNetwork: () => Promise<UnisatWalletTypes.Network>;
  getPublicKey: () => Promise<string>;
  getBalance: () => Promise<Balance>;
  sendBitcoin: (
    address: string,
    atomicAmount: number,
    options?: { feeRate: number }
  ) => Promise<string>;
  pushTx: ({ rawtx }: { rawtx: string }) => Promise<string>;
  pushPsbt: (psbtHex: string) => Promise<string>;
  signMessage: (
    message: string,
    type?: 'ecdsa' | 'bip322-simple'
  ) => Promise<string>;
  signPsbt: (
    psbtHex: string,
    options?: {
      autoFinalized?: boolean;
      toSignInputs: {
        index: number;
        address?: string;
        publicKey?: string;
        sighashTypes?: number[];
        disableTweakSigner?: boolean;
      }[];
    }
  ) => Promise<string>;

  signPsbts: (
    psbtHexs: string[],
    options?: {
      autoFinalized?: boolean;
      toSignInputs: {
        index: number;
        address?: string;
        publicKey?: string;
        sighashTypes?: number[];
        disableTweakSigner?: boolean;
      };
    }[]
  ) => Promise<string[]>;
};

declare global {
  interface Window {
    unisat: Unisat;
  }
}

export class UnisatConnector extends BtcConnector {
  readonly id = 'unisat';
  readonly name = 'Unisat';
  readonly logo = unisatLogo;
  public homepage = 'https://unisat.io';
  public banance: Balance = { confirmed: 0, unconfirmed: 0, total: 0 };
  public unisat: Unisat;

  constructor(network: WalletNetwork) {
    super(network);
    this.unisat = window.unisat;
  }
  on(event: 'accountsChanged' | 'networkChanged', handler: any) {
    this.unisat.on(event, handler);
  }
  removeListener(event: 'accountsChanged' | 'networkChanged', handler: any) {
    this.unisat.removeListener(event, handler);
  }
  async connect(): Promise<boolean> {
    this.connected = false;
    try {
      if (!this.unisat) {
        throw new Error('Unisat not installed');
      }
      await this.getCurrentInfo();
    } catch (error) {
      throw error;
    }
    return this.connected;
  }
  async getCurrentInfo() {
    const accounts = await this.unisat.getAccounts();
    if (accounts.length) {
      this.address = accounts[0];
      const [publicKey, network, banance] = await Promise.all([
        this.unisat.getPublicKey(),
        this.unisat.getNetwork(),
        this.unisat.getBalance(),
      ]);
      this.publicKey = publicKey;
      this.network = network;
      this.banance = banance;
      this.connected = true;
    }
  }
  async disconnect(): Promise<void> {
    this.address = undefined;
    this.publicKey = undefined;
    this.connected = false;
    this.banance = { confirmed: 0, unconfirmed: 0, total: 0 };
  }
  async getAccounts(): Promise<string[]> {
    return this.unisat.getAccounts();
  }
  async sendToAddress(toAddress: string, amount: number) {
    return this.unisat?.sendBitcoin(toAddress, amount);
  }

  async switchNetwork(network: WalletNetwork) {
    await this.unisat.switchNetwork(
      getUnisatNetwork(network) as UnisatWalletTypes.Network
    );
  }

  async getPublicKey() {
    return this.unisat.getPublicKey();
  }

  async getBalance() {
    return this.unisat.getBalance();
  }
  async signPsbt(psbtHex: string, options?: any) {
    return this.unisat.signPsbt(psbtHex, options);
  }
  async signMessage(message: string) {
    return this.unisat.signMessage(message);
  }
  async signPsbts(psbtHexs: string[], options?: any) {
    return this.unisat.signPsbts(psbtHexs, options);
  }
  async pushTx(rawTx: string) {
    return this.unisat.pushTx({ rawtx: rawTx });
  }
  async pushPsbt(psbtHex: string) {
    return this.unisat.pushPsbt(psbtHex);
  }
}
