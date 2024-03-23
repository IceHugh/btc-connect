
import { WalletNetwork } from "../types";
type Address = string;

export abstract class BtcConnector {
  /** Unique connector id */
  abstract readonly id: string;
  /** Connector name */
  abstract readonly name: string;

  abstract readonly logo: string;
  /** Extension or Snap homepage */
  abstract homepage: string;

  /** Whether connector is usable */
  ready: boolean = false;

  public connected: boolean = false;
  address: Address | undefined = '';

  publicKey: string | undefined;

  network: WalletNetwork;

  constructor(network: WalletNetwork) {
    this.network = network;
  }

  abstract connect(): Promise<boolean>;

  abstract sendToAddress(toAddress: string, amount: number): Promise<string>;

  abstract signPsbt(psbtHex: string, options?: any): Promise<string>;


  disconnect() {
    this.address = undefined;
    this.publicKey = undefined;
  }

  getAccount(): string | undefined {
    return this.address;
  }

  isAuthorized(): boolean {
    const address = this.getAccount();

    return !!address;
  }

  // Get bitcoinlib-js network
  async getNetwork(): Promise<WalletNetwork> {
    if (!this.network) {
      throw new Error('Something went wrong while connecting');
    }

    return this.network;
  }

  async getPublicKey(): Promise<string> {
    if (!this.publicKey) {
      throw new Error('Something went wrong while connecting');
    }

    return this.publicKey;
  }
}
