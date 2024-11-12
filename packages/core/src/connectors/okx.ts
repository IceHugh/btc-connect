import { Network, Balance, MessageType } from '../types';
import { BtcConnector } from './base';

export namespace OkxWalletTypes {
  export interface AddressInfo {
    address: string;
    publicKey: string;
    compressedPublicKey: string;
  }
  export type OnEvent = (
    event: 'accountsChanged' | 'accountChanged',
    handler: (accounts: Array<string> | Array<AddressInfo>) => void,
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

  export interface ConnectResult {
    address: string;
    publicKey: string;
  }
  export interface SendProps {
    from: string;
    to: string;
    value: number;
    satBytes: number;
  }
  export interface SendResult {
    txhash: string;
  }

  export interface TransferNftProps {
    from: string;
    to: string;
    data: string | string[];
  }
  export interface TransferNftResult {
    txhash: string;
  }
  export interface SplitUtxoProps {
    from: string;
    amount: number;
  }
  export interface SplitUtxoResult {
    utxos: {
      txId: string;
      vOut: number;
      amount: number;
      rawTransaction: string;
    }[];
  }

  export interface InscribeProps {
    type: 51 | 58;
    from: string;
    tick: string;
    tid: string;
  }
  export interface MintProps {
    type: 60 | 50 | 51 | 62 | 61 | 36 | 33 | 34 | 35 | 58;
    from: string;
    inscriptions: {
      contentType: string;
      body: string;
    }[];
  }
  export interface MintResult {
    commitAddrs: string[];
    commitTx: string;
    revealTxs: string[];
    commitTxFee: number;
    revealTxFees: number[];
    feeRate: number;
    size: number;
  }
}

export type OkxWallet = {
  connect: () => Promise<OkxWalletTypes.ConnectResult>;
  requestAccounts: () => Promise<string[]>;
  getAccounts: () => Promise<string[]>;
  getNetwork: () => Promise<Network>;
  getPublicKey: () => Promise<string>;
  getBalance: () => Promise<Balance>;
  getInscriptions: (
    cursor: number,
    size: number,
  ) => Promise<OkxWalletTypes.GetInscriptionsResult>;
  sendBitcoin: (
    toAddress: string,
    satoshis: number,
    options?: {
      feeRate: number;
    },
  ) => Promise<string>;
  sendInscription: (
    address: string,
    inscriptionId: string,
    options?: { feeRate: number },
  ) => Promise<string>;
  transferNft: ({
    from,
    to,
    data,
  }: OkxWalletTypes.TransferNftProps) => Promise<OkxWalletTypes.TransferNftResult>;
  send: ({
    from,
    to,
    value,
    satBytes,
  }: OkxWalletTypes.SendProps) => Promise<OkxWalletTypes.SendResult>;
  signMessage: (message: string, type?: MessageType) => Promise<string>;
  pushTx: (rawtx: string) => Promise<string>;
  splitUtxo: ({
    from,
    amount,
  }: OkxWalletTypes.SplitUtxoProps) => Promise<OkxWalletTypes.SplitUtxoResult>;
  inscribe: ({
    type,
    from,
    tick,
    tid,
  }: OkxWalletTypes.InscribeProps) => Promise<string>;
  mint: ({
    type,
    from,
    inscriptions,
  }: OkxWalletTypes.MintProps) => Promise<OkxWalletTypes.MintResult>;
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
  pushPsbt: (psbtHex: string) => Promise<string>;
  on: OkxWalletTypes.OnEvent;
  switchNetwork: (network: Network) => Promise<void>;
};

declare global {
  interface Window {
    okxwallet: {
      bitcoin: OkxWallet;
      bitcoinTestnet: OkxWallet;
    };
  }
}

export class OkxConnector extends BtcConnector {
  readonly id = 'okx';
  readonly name: string = 'OKX';
  readonly networks: Network[] = [
    Network.LIVENET,
    Network.REGTEST,
    Network.TESTNET4,
  ];
  public homepage: string =
    'https://www.okx.com/web3/build/docs/sdks/chains/bitcoin/provider';
  public balance: Balance = { confirmed: 0, unconfirmed: 0, total: 0 };
  public okxwallet: OkxWallet;

  constructor(network: Network) {
    super(network);
    this.network = Network.LIVENET;
    this.okxwallet = window.okxwallet?.bitcoin;
  }

  /**
   * Connect to OKX Wallet
   * @returns Whether the connection was successful
   */
  async connect(): Promise<boolean> {
    this.connected = false;
    try {
      if (!this.okxwallet) {
        throw new Error('OkxWallet not installed');
      }
      const res = await this.okxwallet.connect();
      this.connected = true;
      this.address = res.address;
      this.publicKey = res.publicKey;
      await this.getCurrentInfo();
    } catch (error) {
      console.error('Connection failed:', error);
      throw error;
    }
    return this.connected;
  }

  /**
   * Disconnect
   */
  async disconnect(): Promise<void> {
    this.address = undefined;
    this.publicKey = undefined;
    this.connected = false;
    this.balance = { confirmed: 0, unconfirmed: 0, total: 0 };
  }

  /**
   * On event
   * @param event Event type
   * @param handler Event handler
   */
  on(event: 'accountsChanged' | 'accountChanged', handler: any) {
    if (this.network === Network.LIVENET) {
      this.okxwallet?.on(event, handler);
    }
  }

  /**
   * Inscribe
   * @param type Inscription type
   * @param from Sender address
   * @param tick Tick value
   * @param tid Transaction ID
   * @returns Transaction hash
   */
  async inscribe({
    type,
    from,
    tick,
    tid,
  }: OkxWalletTypes.InscribeProps): Promise<string> {
    return this.okxwallet.inscribe({ type, from, tick, tid });
  }

  /**
   * Mint inscriptions
   * @param type Mint type
   * @param from Sender address
   * @param inscriptions Inscriptions data
   * @returns Mint result
   */
  async mint({
    type,
    from,
    inscriptions,
  }: OkxWalletTypes.MintProps): Promise<OkxWalletTypes.MintResult> {
    return this.okxwallet.mint({ type, from, inscriptions });
  }

  /**
   * Send transaction
   * @param from Sender address
   * @param to Recipient address
   * @param value Value to send
   * @param satBytes Satoshi bytes
   * @returns Send result
   */
  async send({
    from,
    to,
    value,
    satBytes,
  }: OkxWalletTypes.SendProps): Promise<OkxWalletTypes.SendResult> {
    return this.okxwallet.send({ from, to, value, satBytes });
  }

  /**
   * Send Bitcoin to address
   * @param toAddress Recipient address
   * @param amount Amount in satoshis
   * @returns Transaction hash
   */
  async sendToAddress(toAddress: string, amount: number) {
    return this.okxwallet.sendBitcoin(toAddress, amount);
  }

  /**
   * Send inscription
   * @param address Recipient address
   * @param inscriptionId Inscription ID
   * @param options Optional fee rate
   * @returns Send inscription result
   */
  async sendInscription(
    address: string,
    inscriptionId: string,
    options?: { feeRate: number },
  ): Promise<string> {
    return this.okxwallet.sendInscription(address, inscriptionId, options);
  }

  /**
   * Split UTXO
   * @param from Sender address
   * @param amount Amount to split
   * @returns Split UTXO result
   */
  async splitUtxo({
    from,
    amount,
  }: OkxWalletTypes.SplitUtxoProps): Promise<OkxWalletTypes.SplitUtxoResult> {
    return this.okxwallet.splitUtxo({ from, amount });
  }

  /**
   * Sign message
   * @param message Message to sign
   * @param type Message type
   * @returns Signed message
   */
  async signMessage(message: string, type?: MessageType) {
    return this.okxwallet.signMessage(message, type);
  }

  /**
   * Sign PSBT
   * @param psbtHex PSBT hexadecimal string
   * @param options Signing options
   * @returns Signed PSBT
   */
  async signPsbt(psbtHex: string, options?: any) {
    return this.okxwallet.signPsbt(psbtHex, options);
  }

  /**
   * Batch sign PSBTs
   * @param psbtHexs Array of PSBT hexadecimal strings
   * @param options Signing options array
   * @returns Array of signed PSBTs
   */
  async signPsbts(psbtHexs: string[], options?: any) {
    return this.okxwallet.signPsbts(psbtHexs, options);
  }

  /**
   * Get accounts
   * @returns List of accounts
   */
  async getAccounts(): Promise<string[]> {
    return this.okxwallet.getAccounts();
  }

  /**
   * Get account balance
   * @returns Balance information
   */
  async getBalance() {
    return this.okxwallet.getBalance();
  }

  /**
   * Get current information
   */
  async getCurrentInfo(): Promise<void> {
    if (this.network === Network.LIVENET) {
      if (!this.okxwallet) {
        throw new Error('OkxWallet not installed');
      }
      const accounts = await this.okxwallet.getAccounts();
      if (accounts.length) {
        this.address = accounts[0];
        const [publicKey, network, balance] = await Promise.all([
          this.okxwallet.getPublicKey(),
          this.okxwallet.getNetwork(),
          this.okxwallet.getBalance(),
        ]);
        this.publicKey = publicKey;
        this.network = network;
        this.balance = balance;
        this.connected = true;
      }
    }
  }

  /**
   * Get network
   * @returns Current network
   */
  async getNetwork(): Promise<Network> {
    return this.okxwallet.getNetwork();
  }

  /**
   * Get public key
   * @returns Public key
   */
  async getPublicKey() {
    return this.okxwallet.getPublicKey();
  }

  /**
   * Push PSBT
   * @param psbtHex PSBT hexadecimal string
   * @returns Transaction hash
   */
  async pushPsbt(psbtHex: string) {
    return this.okxwallet.pushPsbt(psbtHex);
  }

  /**
   * Push transaction
   * @param rawTx Raw transaction data
   * @returns Transaction hash
   */
  async pushTx(rawTx: string) {
    return this.okxwallet.pushTx(rawTx);
  }

  /**
   * Switch network
   * @param network Target network
   */
  async switchNetwork(network: Network) {
    await this.okxwallet.switchNetwork(network);
  }
  /**
   * Get inscription information
   * @param cursor Pagination cursor
   * @param size Number of items to retrieve
   * @returns Inscription information and pagination
   */
  async getInscriptions(
    cursor: number,
    size: number,
  ): Promise<OkxWalletTypes.GetInscriptionsResult> {
    return this.okxwallet.getInscriptions(cursor, size);
  }
}
