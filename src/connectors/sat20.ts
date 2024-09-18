import { sat20Logo } from '../assets';
import { WalletNetwork, Balance } from '../types';
import { BtcConnector } from './base';

const getSat20Network = (network: WalletNetwork): WalletNetwork => {
  switch (network) {
    case 'testnet':
      return 'testnet';
    default:
      return 'livenet';
  }
};

export namespace Sat20WalletTypes {
  export type AccountsChangedEvent = (
    event: 'accountsChanged' | 'networkChanged',
    handler: (accounts: Array<string> | string) => void,
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
export type Sat20 = {
  requestAccounts: () => Promise<string[]>;
  getAccounts: () => Promise<string[]>;
  on: Sat20WalletTypes.AccountsChangedEvent;
  removeListener: Sat20WalletTypes.AccountsChangedEvent;
  getInscriptions: (
    cursor: number,
    size: number,
  ) => Promise<Sat20WalletTypes.GetInscriptionsResult>;
  sendInscription: (
    address: string,
    inscriptionId: string,
    options?: { feeRate: number },
  ) => Promise<Sat20WalletTypes.SendInscriptionsResult>;
  switchNetwork: (network: 'livenet' | 'testnet') => Promise<void>;
  getNetwork: () => Promise<Sat20WalletTypes.Network>;
  getPublicKey: () => Promise<string>;
  getBalance: () => Promise<Balance>;
  sendBitcoin: (
    address: string,
    atomicAmount: number,
    options?: { feeRate: number },
  ) => Promise<string>;
  pushTx: ({ rawtx }: { rawtx: string }) => Promise<string>;
  pushPsbt: (psbtHex: string) => Promise<string>;
  signMessage: (
    message: string,
    type?: 'ecdsa' | 'bip322-simple',
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
    },
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
    }[],
  ) => Promise<string[]>;
};

declare global {
  interface Window {
    sat20: Sat20;
  }
}

export class Sat20Connector extends BtcConnector {
  readonly id = 'Sat20';
  readonly name: string = 'Sat20';
  readonly logo: string = sat20Logo;
  readonly networks: WalletNetwork[] = ['livenet', 'testnet'];
  public homepage = 'https://sat20.io';
  public banance: Balance = { confirmed: 0, unconfirmed: 0, total: 0 };
  public sat20: Sat20;

  constructor(network: WalletNetwork) {
    super(network);
    this.sat20 = window.sat20;
  }
  on(event: 'accountsChanged' | 'networkChanged', handler: any) {
    if (!this.sat20) {
      throw new Error('Sat20 not installed');
    }
    this.sat20.on(event, handler);
  }
  removeListener(event: 'accountsChanged' | 'networkChanged', handler: any) {
    if (!this.sat20) {
      throw new Error('Sat20 not installed');
    }
    this.sat20.removeListener(event, handler);
  }
  async connect(): Promise<boolean> {
    this.connected = false;
    try {
      if (!this.sat20) {
        throw new Error('Sat20 not installed');
      }
      await this.requestAccounts();
      await this.getCurrentInfo();
      this.connected = true;
      return true;
    } catch (error) {
      throw error;
    }
  }
  async requestAccounts() {
    if (!this.sat20) {
      throw new Error('Sat20 not installed');
    }
    return this.sat20.requestAccounts();
  }
  async getCurrentInfo() {
    if (!this.sat20) {
      throw new Error('Sat20 not installed');
    }
    const accounts = await this.sat20.getAccounts();
    if (accounts.length) {
      this.address = accounts[0];
      const [publicKey, network, banance] = await Promise.all([
        this.sat20.getPublicKey(),
        this.sat20.getNetwork(),
        this.sat20.getBalance(),
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
    if (!this.sat20) {
      throw new Error('Sat20 not installed');
    }
    return this.sat20.getAccounts();
  }
  async sendToAddress(toAddress: string, amount: number) {
    if (!this.sat20) {
      throw new Error('Sat20 not installed');
    }
    return this.sat20?.sendBitcoin(toAddress, amount);
  }

  async switchNetwork(network: WalletNetwork) {
    if (!this.sat20) {
      throw new Error('Sat20 not installed');
    }
    await this.sat20.switchNetwork(
      getSat20Network(network) as Sat20WalletTypes.Network,
    );
  }

  async getPublicKey() {
    if (!this.sat20) {
      throw new Error('Sat20 not installed');
    }
    return this.sat20.getPublicKey();
  }

  async getBalance() {
    if (!this.sat20) {
      throw new Error('Sat20 not installed');
    }
    return this.sat20.getBalance();
  }
  async signPsbt(psbtHex: string, options?: any) {
    if (!this.sat20) {
      throw new Error('Sat20 not installed');
    }
    return this.sat20.signPsbt(psbtHex, options);
  }
  async signMessage(message: string) {
    if (!this.sat20) {
      throw new Error('Sat20 not installed');
    }
    return this.sat20.signMessage(message);
  }
  async signPsbts(psbtHexs: string[], options?: any) {
    if (!this.sat20) {
      throw new Error('Sat20 not installed');
    }
    return this.sat20.signPsbts(psbtHexs, options);
  }
  async pushTx(rawTx: string) {
    if (!this.sat20) {
      throw new Error('Sat20 not installed');
    }
    return this.sat20.pushTx({ rawtx: rawTx });
  }
  async pushPsbt(psbtHex: string) {
    if (!this.sat20) {
      throw new Error('Sat20 not installed');
    }
    return this.sat20.pushPsbt(psbtHex);
  }
}
