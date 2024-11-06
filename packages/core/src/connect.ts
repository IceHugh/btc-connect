import {
  // ...other type imports...
  Balance,
  BtcWalletConnectOptions,
  BtcConnectorId,
  Network,
  NetworkChangedEvent,
  AccountsChangedEvent,
  MessageType,
  AccountChangedEvent,
} from './types';

// Add the following import statements, replacing the original connector imports
import { UnisatConnector, UnisatWalletTypes } from './connectors/unisat';
import { OkxConnector, OkxWalletTypes } from './connectors/okx';
import { Sat20Connector, Sat20WalletTypes } from './connectors/sat20';
import { BtcConnector } from './connectors/base';

export type Connector = UnisatConnector | OkxConnector | Sat20Connector;

export interface BtcConnectors {
  id: BtcConnectorId;
  instance: Connector;
  installed: boolean;
}

class BtcWalletConnect {
  private local_storage_key = '_btc_connector_id';
  private local_disconnect_key = '_btc_disconnect_status';
  connectorId: BtcConnectorId = 'unisat';
  localConnectorId?: BtcConnectorId;
  disConnectStatus: boolean = false;
  connected: boolean = false;
  address?: string;
  publicKey?: string;
  network: Network;
  balance: Balance = { confirmed: 0, unconfirmed: 0, total: 0 };
  connectors: BtcConnectors[];
  connector?: Connector;

  private connectorRegistry: Record<BtcConnectorId, typeof BtcConnector> = {
    unisat: UnisatConnector,
    okx: OkxConnector,
    sat20: Sat20Connector,
    // Add new connectors here
  };

  constructor({
    network = Network.LIVENET,
  }: BtcWalletConnectOptions) {
    this.network = network;
    this.connectors = Object.entries(this.connectorRegistry).map(
      ([id, ConnectorClass]) => ({
        id: id as BtcConnectorId,
        instance: new (ConnectorClass as any)(this.network),
        installed: this.isConnectorInstalled(id as BtcConnectorId),
      })
    );
    this.localConnectorId =
      (localStorage.getItem(this.local_storage_key) as BtcConnectorId) ||
      undefined;
    this.disConnectStatus =
      localStorage.getItem(this.local_disconnect_key) === '1';
  }

  /**
   * Check if the connector is installed
   * @param id Connector identifier
   * @returns Whether it is installed
   */
  private isConnectorInstalled(id: BtcConnectorId): boolean {
    switch (id) {
      case 'unisat':
        return !!window.unisat;
      case 'okx':
        return !!window.okxwallet;
      case 'sat20':
        return !!window.sat20;
      // Add installation checks for new connectors
      default:
        return false;
    }
  }

  /**
   * Dynamically register a new connector
   * @param id Connector identifier
   * @param ConnectorClass Connector class
   */
  registerConnector(id: BtcConnectorId, ConnectorClass: typeof BtcConnector): void {
    if (this.connectorRegistry[id]) {
      throw new Error(`Connector with id ${id} is already registered.`);
    }
    this.connectorRegistry[id] = ConnectorClass;
    const isInstalled = this.isConnectorInstalled(id);
    this.connectors.push({
      id,
      instance: ConnectorClass.prototype.constructor !== BtcConnector.prototype.constructor
        ? new (ConnectorClass as any)(this.network)
        : undefined,
      installed: isInstalled,
    });
  }

  /**
   * Switch the current connector
   * @param id Target connector identifier
   * @returns The switched connector instance
   */
  switchConnector(id: BtcConnectorId): Connector {
    const _c = this.connectors.find(
      (c) => c.id === id && c.installed,
    )?.instance;
    if (!_c) {
      throw new Error('Connector not found');
    }
    this.connectorId = id;
    this.connector = _c;
    return _c;
  }

  /**
   * Connect the currently selected connector
   * @returns Whether the connection was successful
   */
  async connect(): Promise<boolean> {
    if (!this.connector) {
      throw new Error('Connector not found');
    }
    this.connected = await this.connector.connect();
    if (this.connected) {
      this.address = this.connector.address;
      this.publicKey = this.connector.publicKey;
      this.balance = this.connector.balance;
      this.network = this.connector.network;
    }
    localStorage.setItem(this.local_storage_key, this.connectorId);
    localStorage.removeItem(this.local_disconnect_key);
    return this.connected;
  }

  /**
   * Get current information
   */
  private async getCurrentInfo(): Promise<void> {
    if (!this.connector) {
      throw new Error('Connector not found');
    }
    try {
      if (this.connector.getCurrentInfo) {
        await this.connector.getCurrentInfo();
        this.address = this.connector.address;
        this.publicKey = this.connector.publicKey;
        this.network = this.connector.network;
        this.balance = this.connector.balance;
        this.connected = this.connector.connected;
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check connection status
   */
  async check(): Promise<boolean> {
    if (this.disConnectStatus) {
      return false;
    }
    this.connectorId = this.localConnectorId || this.connectorId;
    const _c = this.connectors.find(
      (c) => c.id === this.connectorId && c.installed,
    )?.instance;
    if (!_c) {
      throw new Error('Connector not found');
    }
    this.connector = _c;
    try {
      await this.getCurrentInfo();
      return this.connected;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  /**
   * Disconnect
   */
  async disconnect(): Promise<void> {
    if (!this.connector) {
      throw new Error('Connector not found');
    }
    await this.connector.disconnect();
    this.connected = false;
    this.address = undefined;
    this.publicKey = undefined;
    this.balance = { confirmed: 0, unconfirmed: 0, total: 0 };
    localStorage.setItem(this.local_disconnect_key, '1');
  }

  /**
   * Get account list
   * @returns Array of account addresses
   */
  async getAccounts(): Promise<string[]> {
    if (!this.connector) {
      throw new Error('Connector not found');
    }
    return this.connector.getAccounts();
  }

  /**
   * Get the current network
   * @returns Current network
   */
  async getNetwork(): Promise<Network> {
    if (!this.connector) {
      throw new Error('Connector not found');
    }
    return this.connector.network;
  }

  /**
   * Switch network
   * @param network Target network
   */
  async switchNetwork(network: Network): Promise<void> {
    if (!this.connector) {
      throw new Error('Connector not found');
    }
    await this.connector.switchNetwork(network);
    this.network = network;
    await this.getCurrentInfo();
  }

  /**
   * Send Bitcoin to a specified address
   * @param toAddress Target address
   * @param amount Amount
   * @returns Transaction ID
   */
  async sendToAddress(toAddress: string, amount: number): Promise<string> {
    if (!this.connector) {
      throw new Error('Connector not found');
    }
    if (amount <= 0) {
      throw new Error('Invalid amount');
    }
    return this.connector.sendToAddress(toAddress, amount);
  }

  /**
   * Sign a message
   * @param message Message content
   * @param type Signature type
   * @returns Signature result
   */
  async signMessage(message: string, type?: MessageType): Promise<string> {
    if (!this.connector) {
      throw new Error('Connector not found');
    }
    return this.connector.signMessage(message, type);
  }

  /**
   * Sign a PSBT
   * @param psbtHex PSBT hexadecimal string
   * @param options Signing options
   * @returns Signed PSBT
   */
  async signPsbt(psbtHex: string, options?: any): Promise<string> {
    if (!this.connector) {
      throw new Error('Connector not found');
    }
    return this.connector.signPsbt(psbtHex, options);
  }

  /**
   * Batch sign PSBTs
   * @param psbtHexs Multiple PSBT hexadecimal strings
   * @param options Signing options
   * @returns Array of signed PSBTs
   */
  async signPsbts(psbtHexs: string[], options?: any): Promise<string[]> {
    if (!this.connector) {
      throw new Error('Connector not found');
    }
    return this.connector.signPsbts(psbtHexs, options);
  }

  /**
   * Push a transaction
   * @param rawTx Raw transaction data
   * @returns Transaction ID
   */
  async pushTx(rawTx: string): Promise<string> {
    if (!this.connector) {
      throw new Error('Connector not found');
    }
    return this.connector.pushTx(rawTx);
  }

  /**
   * Push a PSBT
   * @param psbtHex PSBT hexadecimal string
   * @returns Transaction ID
   */
  async pushPsbt(psbtHex: string): Promise<string> {
    if (!this.connector) {
      throw new Error('Connector not found');
    }
    return this.connector.pushPsbt(psbtHex);
  }

  /**
   * Subscribe to events
   * @param event Event type
   * @param handler Event handler
   */
  on(
    event: 'networkChanged' | 'accountsChanged' | 'accountChanged',
    handler: (data: any) => void,
  ): void {
    if (!this.connector) {
      throw new Error('Connector not found');
    }
    if (
      this.connector instanceof UnisatConnector ||
      this.connector instanceof Sat20Connector
    ) {
      this.connector.on(event as 'networkChanged' | 'accountsChanged', handler);
    } else {
      this.connector.on(
        event as 'accountsChanged' | 'accountChanged',
        handler,
      );
    }
  }

  /**
   * Remove event listener
   * @param event Event type
   * @param handler Event handler
   */
  removeListener(
    event: 'networkChanged' | 'accountsChanged' | 'accountChanged',
    handler: (data: any) => void,
  ): void {
    if (!this.connector) {
      throw new Error('Connector not found');
    }
    if (this.connector instanceof UnisatConnector || this.connector instanceof Sat20Connector) {
      this.connector.removeListener(event as 'networkChanged' | 'accountsChanged', handler);
    } else if (this.connector instanceof OkxConnector) {
      // OkxConnector does not support removing specific events, or may need to implement corresponding logic
    }
  }

  /**
   * Get inscription data
   * @param cursor Pagination cursor
   * @param size Number of items to return
   * @returns Inscription data result
   */
  async getInscriptions(
    cursor: number,
    size: number,
  ): Promise<
    | Sat20WalletTypes.GetInscriptionsResult
    | OkxWalletTypes.GetInscriptionsResult
    | UnisatWalletTypes.GetInscriptionsResult
  > {
    if (!this.connector) {
      throw new Error('Connector not found');
    }
    return this.connector.getInscriptions(cursor, size);
  }
}

export default BtcWalletConnect;
