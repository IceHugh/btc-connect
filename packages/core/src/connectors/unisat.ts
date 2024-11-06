import { Network, Balance, MessageType } from '../types';
import { BtcConnector } from './base';

/**
 * Get the corresponding network enum for Unisat
 * @param network Current network
 * @returns Corresponding Network enum
 */
const getUnisatNetwork = (network: Network): Network => {
  switch (network) {
    case Network.TESTNET:
      return Network.TESTNET;
    default:
      return Network.LIVENET;
  }
};

export namespace UnisatWalletTypes {
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
    contentType: number;
    preview: number;
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

export type Unisat = {
  requestAccounts: () => Promise<string[]>;
  getAccounts: () => Promise<string[]>;
  on: UnisatWalletTypes.AccountsChangedEvent;
  removeListener: UnisatWalletTypes.AccountsChangedEvent;
  getInscriptions: (
    cursor: number,
    size: number,
  ) => Promise<UnisatWalletTypes.GetInscriptionsResult>;
  sendInscription: (
    address: string,
    inscriptionId: string,
    options?: { feeRate: number },
  ) => Promise<UnisatWalletTypes.SendInscriptionsResult>;
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
    unisat: Unisat;
  }
}

/**
 * Connector for the Unisat wallet.
 */
export class UnisatConnector extends BtcConnector {
  readonly id = 'unisat';
  readonly name: string = 'Unisat';
  readonly networks: Network[] = [Network.LIVENET, Network.TESTNET];
  public homepage = 'https://unisat.io';
  public balance: Balance = { confirmed: 0, unconfirmed: 0, total: 0 };
  public unisat: Unisat;

  constructor(network: Network) {
    super(network);
    this.unisat = window.unisat;
  }

  /**
   * Connects to the Unisat wallet and retrieves account information.
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
   * Disconnects from the Unisat wallet.
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
    this.unisat.on(event, handler);
  }

  /**
   * Removes an event listener from the Unisat wallet.
   * @param event - The event type ('accountsChanged' or 'networkChanged').
   * @param handler - The event handler function to remove.
   */
  removeListener(
    event: 'accountsChanged' | 'networkChanged',
    handler: (data: any) => void,
  ) {
    this.unisat.removeListener(event, handler);
  }

  /**
   * Requests account information from the Unisat wallet.
   * @returns Promise that resolves to an array of account addresses.
   */
  async requestAccounts() {
    return this.unisat.requestAccounts();
  }

  /**
   * Retrieves the current account information.
   */
  async getCurrentInfo(): Promise<void> {
    const accounts = await this.unisat.getAccounts();
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
   * Retrieves the account balance from the Unisat wallet.
   * @returns Promise that resolves to the balance object.
   */
  async getBalance() {
    return this.unisat.getBalance();
  }

  /**
   * Retrieves the current network from the Unisat wallet.
   * @returns Promise that resolves to the current network.
   */
  async getNetwork(): Promise<Network> {
    return this.unisat.getNetwork();
  }

  /**
   * Retrieves the public key from the Unisat wallet.
   * @returns Promise that resolves to the public key string.
   */
  async getPublicKey() {
    return this.unisat.getPublicKey();
  }

  /**
   * Retrieves the list of accounts from the Unisat wallet.
   * @returns Promise that resolves to an array of account addresses.
   */
  async getAccounts(): Promise<string[]> {
    return this.unisat.getAccounts();
  }

  /**
   * Sends Bitcoin to a specified address.
   * @param toAddress - Recipient's address.
   * @param amount - Amount to send.
   * @returns Promise that resolves to the transaction hash.
   */
  async sendToAddress(toAddress: string, amount: number) {
    return this.unisat.sendBitcoin(toAddress, amount);
  }

  /**
   * Switches the network for the Unisat wallet.
   * @param network - The target network.
   */
  async switchNetwork(network: Network) {
    // Use Network enum
    await this.unisat.switchNetwork(getUnisatNetwork(network));
  }

  /**
   * Signs a message using the Unisat wallet.
   * @param message - The message to sign.
   * @param type - The type of signature.
   * @returns Promise that resolves to the signature.
   */
  async signMessage(message: string, type?: MessageType) {
    return this.unisat.signMessage(message, type);
  }

  /**
   * Signs a PSBT (Partially Signed Bitcoin Transaction).
   * @param psbtHex - The PSBT in hexadecimal format.
   * @param options - Signing options.
   * @returns Promise that resolves to the signed PSBT.
   */
  async signPsbt(psbtHex: string, options?: any) {
    return this.unisat.signPsbt(psbtHex, options);
  }

  /**
   * Signs multiple PSBTs.
   * @param psbtHexs - Array of PSBTs in hexadecimal format.
   * @param options - Array of signing options.
   * @returns Promise that resolves to an array of signed PSBTs.
   */
  async signPsbts(psbtHexs: string[], options?: any) {
    return this.unisat.signPsbts(psbtHexs, options);
  }

  /**
   * Pushes a raw transaction to the network.
   * @param rawTx - The raw transaction data.
   * @returns Promise that resolves to the transaction hash.
   */
  async pushTx(rawTx: string) {
    return this.unisat.pushTx({ rawtx: rawTx });
  }

  /**
   * Pushes a PSBT to the network.
   * @param psbtHex - The PSBT in hexadecimal format.
   * @returns Promise that resolves to the transaction hash.
   */
  async pushPsbt(psbtHex: string) {
    return this.unisat.pushPsbt(psbtHex);
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
  ): Promise<UnisatWalletTypes.GetInscriptionsResult> {
    return this.unisat.getInscriptions(cursor, size);
  }
}
