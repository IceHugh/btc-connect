import { Network, Balance, MessageType } from '../types';
import { BtcConnector } from './base';

/**
 * Get the corresponding network enum for Sat20
 * @param network Current network
 * @returns Corresponding Network enum
 */
const getSat20Network = (network: Network): Network => {
  switch (network) {
    case Network.TESTNET:
      return Network.TESTNET;
    default:
      return Network.LIVENET;
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
    contentLength: number; // Changed to number to match Unisat
    contentType: number;   // Changed to number to match Unisat
    preview: number;       // Changed to number to match Unisat
    timestamp: number;
    offset: number;
    genesisTransaction: string;
    location: string;
  };

  export type GetInscriptionsResult = {
    total: number;
    list: Inscription[];
    nextCursor?: number;
  };

  export type SendInscriptionsResult = { txid: string };
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
  switchNetwork: (network: Network) => Promise<void>;
  getNetwork: () => Promise<Network>;
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

/**
 * Connector for the Sat20 wallet.
 */
export class Sat20Connector extends BtcConnector {
  readonly id = 'Sat20';
  readonly name: string = 'Sat20';
  readonly networks: Network[] = [Network.LIVENET, Network.TESTNET];
  public homepage = 'https://sat20.io';
  public balance: Balance = { confirmed: 0, unconfirmed: 0, total: 0 };
  public sat20: Sat20;

  constructor(network: Network) {
    super(network);
    this.sat20 = window.sat20;
  }

  /**
   * Connects to the Sat20 wallet and retrieves account information.
   * @returns Promise that resolves to true if connected successfully.
   */
  async connect(): Promise<boolean> {
    this.connected = false;
    try {
      await this.requestAccounts();
      await this.getCurrentInfo();
      this.connected = true;
      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Disconnects from the Sat20 wallet.
   */
  async disconnect(): Promise<void> {
    this.address = undefined;
    this.publicKey = undefined;
    this.connected = false;
    this.balance = { confirmed: 0, unconfirmed: 0, total: 0 };
  }

  /**
   * Subscribes to wallet events.
   * @param event - The event type ('accountsChanged' or 'networkChanged').
   * @param handler - The event handler function.
   */
  on(
    event: 'accountsChanged' | 'networkChanged',
    handler: (data: any) => void,
  ) {
    if (!this.sat20) {
      throw new Error('Sat20 not installed');
    }
    this.sat20.on(event, handler);
  }

  /**
   * Removes an event listener from the Sat20 wallet.
   * @param event - The event type ('accountsChanged' or 'networkChanged').
   * @param handler - The event handler function to remove.
   */
  removeListener(
    event: 'accountsChanged' | 'networkChanged',
    handler: (data: any) => void,
  ) {
    if (!this.sat20) {
      throw new Error('Sat20 not installed');
    }
    this.sat20.removeListener(event, handler);
  }

  /**
   * Requests account information from the Sat20 wallet.
   * @returns Promise that resolves to an array of account addresses.
   */
  async requestAccounts() {
    return this.sat20.requestAccounts();
  }

  /**
   * Retrieves the current account information.
   */
  async getCurrentInfo(): Promise<void> {
    const accounts = await this.sat20.getAccounts();
    if (accounts.length) {
      this.address = accounts[0];
      const [publicKey, network, balance] = await Promise.all([
        this.getPublicKey(),
        this.getNetwork(),
        this.getBalance(),
      ]);
      this.publicKey = publicKey;
      this.network = network;
      this.balance = balance;
      this.connected = true;
    }
  }

  /**
   * Retrieves the account balance from the Sat20 wallet.
   * @returns Promise that resolves to the balance object.
   */
  async getBalance() {
    return this.sat20.getBalance();
  }

  /**
   * Retrieves the current network from the Sat20 wallet.
   * @returns Promise that resolves to the current network.
   */
  async getNetwork(): Promise<Network> {
    return this.sat20.getNetwork();
  }

  /**
   * Retrieves the public key from the Sat20 wallet.
   * @returns Promise that resolves to the public key string.
   */
  async getPublicKey() {
    return this.sat20.getPublicKey();
  }

  /**
   * Retrieves the list of accounts from the Sat20 wallet.
   * @returns Promise that resolves to an array of account addresses.
   */
  async getAccounts(): Promise<string[]> {
    return this.sat20.getAccounts();
  }

  /**
   * Sends Bitcoin to a specified address.
   * @param toAddress - Recipient's address.
   * @param amount - Amount to send.
   * @returns Promise that resolves to the transaction ID.
   */
  async sendToAddress(toAddress: string, amount: number) {
    const result = await this.sat20.sendBitcoin(toAddress, amount);
    try {
      const txid = JSON.parse(result);
      return txid;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Switches the network for the Sat20 wallet.
   * @param network - The target network.
   */
  async switchNetwork(network: Network) {
    await this.sat20.switchNetwork(getSat20Network(network));
  }

  /**
   * Signs a message.
   * @param message - The message to sign.
   * @param type - The type of signature.
   * @returns Promise that resolves to the signature.
   */
  async signMessage(message: string, type?: MessageType) {
    return this.sat20.signMessage(message, type);
  }

  /**
   * Signs a PSBT (Partially Signed Bitcoin Transaction).
   * @param psbtHex - The PSBT in hexadecimal format.
   * @param options - Signing options.
   * @returns Promise that resolves to the signed PSBT.
   */
  async signPsbt(psbtHex: string, options?: any) {
    return this.sat20.signPsbt(psbtHex, options);
  }

  /**
   * Signs multiple PSBTs.
   * @param psbtHexs - Array of PSBTs in hexadecimal format.
   * @param options - Array of signing options.
   * @returns Promise that resolves to an array of signed PSBTs.
   */
  async signPsbts(psbtHexs: string[], options?: any) {
    return this.sat20.signPsbts(psbtHexs, options);
  }

  /**
   * Pushes a raw transaction to the network.
   * @param rawTx - The raw transaction data.
   * @returns Promise that resolves to the transaction ID.
   */
  async pushTx(rawTx: string) {
    return this.sat20.pushTx({ rawtx: rawTx });
  }

  /**
   * Pushes a PSBT to the network.
   * @param psbtHex - The PSBT in hexadecimal format.
   * @returns Promise that resolves to the transaction ID.
   */
  async pushPsbt(psbtHex: string) {
    const result = await this.sat20.pushPsbt(psbtHex);
    try {
      const txid = JSON.parse(result);
      return txid;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retrieves inscriptions with pagination.
   * @param cursor - Pagination cursor.
   * @param size - Number of items to retrieve.
   * @returns Promise that resolves to the inscriptions and next cursor.
   */
  async getInscriptions(
    cursor: number,
    size: number,
  ): Promise<Sat20WalletTypes.GetInscriptionsResult> {
    return this.sat20.getInscriptions(cursor, size);
  }
}
