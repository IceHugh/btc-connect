import { UnisatConnector, OkxConnector } from './connectors';
import {
  Balance,
  BtcWalletConnectOptions,
  BtcConnectorId,
  BrcWalletNetwork,
  NetworkChangedEvent,
  AccountsChangedEvent,
  MessageType,
} from './types';

type Connector = UnisatConnector | OkxConnector;

export interface BtcConnectors {
  id: string;
  instance: Connector;
  installed: boolean;
}
class BtcWalletConnect {
  private local_storage_key = 'btc_connector_id';
  connectorId: BtcConnectorId = 'unisat';
  localConnectorId?: BtcConnectorId;
  connected: boolean = false;
  installed: boolean = false;
  address?: string;
  publicKey?: string;
  network: BrcWalletNetwork;
  balance: Balance = { confirmed: 0, unconfirmed: 0, total: 0 };
  connectors: BtcConnectors[];
  connector?: Connector;
  constructor({
    network = 'livenet',
    defaultConnectorId = 'unisat',
  }: BtcWalletConnectOptions) {
    this.network = network;
    this.connectors = [
      {
        id: 'unisat',
        instance: new UnisatConnector(this.network),
        installed: !!window.unisat,
      },
      {
        id: 'okx',
        instance: new OkxConnector(this.network),
        installed: !!window.okxwallet,
      },
    ];
    this.localConnectorId =
      (localStorage.getItem(this.local_storage_key) as BtcConnectorId) ||
      undefined;
    this.connectorId = defaultConnectorId;
    this.connector = this.connectors.find(
      (c) => c.id === defaultConnectorId && c.installed
    )?.instance;
  }
  async switchConnector(id: BtcConnectorId) {
    const _c = this.connectors.find(
      (c) => c.id === id && c.installed
    )?.instance;
    if (!_c) {
      throw new Error('Connector not found');
    }
    this.connector = _c;
    return _c;
  }
  async connect() {
    if (!this.connector) {
      throw new Error('Connector not found');
    }
    this.connected = await this.connector.connect();
    if (this.connected) {
      this.address = this.connector.address;
      this.publicKey = this.connector.publicKey;
      this.balance = this.connector.banance;
    }
    localStorage.setItem(this.local_storage_key, this.connectorId);
    return this.connected;
  }
  private async getCurrentInfo() {
    if (!this.connector) {
      throw new Error('Connector not found');
    }
    try {
      await this.connector.getCurrentInfo();
      this.address = this.connector.address;
      this.publicKey = this.connector.publicKey;
      this.balance = this.connector.banance;
      this.connected = this.connector.connected;
    } catch (error) {
      throw error;
    }
  }
  async check() {
    if (!this.connector) {
      throw new Error('Connector not found');
    }
    this.connectorId = this.localConnectorId || this.connectorId;
    const _c = this.connectors.find(
      (c) => c.id === this.connectorId && c.installed
    )?.instance;
    if (!_c) {
      throw new Error('Connector not found');
    }
    this.connector = _c;
    try {
      await this.getCurrentInfo();
    } catch (error) {
      console.error(error);
    }
  }
  async disconnect() {
    if (!this.connector) {
      throw new Error('Connector not found');
    }
    await this.connector.disconnect();
    this.connected = false;
    this.address = undefined;
    this.publicKey = undefined;
    this.balance = { confirmed: 0, unconfirmed: 0, total: 0 };
    localStorage.removeItem(this.local_storage_key);
  }
  async getAccounts() {
    if (!this.connector) {
      throw new Error('Connector not found');
    }
    return this.connector.getAccounts();
  }

  async getNetwork() {
    if (!this.connector) {
      throw new Error('Connector not found');
    }
    return this.connector.network;
  }

  async switchNetwork(network: BrcWalletNetwork) {
    if (!this.connector) {
      throw new Error('Connector not found');
    }
    await this.connector.switchNetwork(network);
    this.network = network;
  }
  async sendToAddress(toAddress: string, amount: number) {
    if (!this.connector) {
      throw new Error('Connector not found');
    }
    return this.connector.sendToAddress(toAddress, amount);
  }

  async signMessage(message: string, type?: MessageType) {
    if (!this.connector) {
      throw new Error('Connector not found');
    }
    return this.connector.signMessage(message);
  }
  async signPsbt(psbtHex: string, options?: any) {
    if (!this.connector) {
      throw new Error('Connector not found');
    }
    return this.connector.signPsbt(psbtHex, options);
  }

  async signPsbts(psbtHexs: string[], options?: any) {
    if (!this.connector) {
      throw new Error('Connector not found');
    }
    return this.connector.signPsbts(psbtHexs, options);
  }
  async pushTx(rawTx: string) {
    if (!this.connector) {
      throw new Error('Connector not found');
    }
    return this.connector.pushTx(rawTx);
  }
  async pushPsbt(psbtHex: string) {
    if (!this.connector) {
      throw new Error('Connector not found');
    }
    return this.connector.pushPsbt(psbtHex);
  }
  on: NetworkChangedEvent | AccountsChangedEvent = (
    event: 'networkChanged' | 'accountsChanged' | 'accountChanged',
    handler: any
  ) => {
    if (!this.connector) {
      throw new Error('Connector not found');
    }
    if (this.connector instanceof UnisatConnector) {
      this.connector.on(event as 'networkChanged' | 'accountsChanged', handler);
    } else {
      this.connector.on(event as 'accountsChanged' | 'accountChanged', handler);
    }
  };
  removeListener: NetworkChangedEvent | AccountsChangedEvent = (
    event: 'networkChanged' | 'accountsChanged',
    handler: any
  ) => {
    if (!this.connector) {
      throw new Error('Connector not found');
    }
    if (this.connector instanceof UnisatConnector) {
      this.connector.removeListener(event, handler);
    }
  };
}

export default BtcWalletConnect;
