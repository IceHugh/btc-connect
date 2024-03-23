// src/connectors/base.ts
class BtcConnector {
  ready = false;
  installed = false;
  connected = false;
  address = "";
  publicKey;
  network;
  constructor(network) {
    this.network = network;
  }
  disconnect() {
    this.address = undefined;
    this.publicKey = undefined;
  }
  getAccount() {
    return this.address;
  }
  isAuthorized() {
    const address = this.getAccount();
    return !!address;
  }
  async getNetwork() {
    if (!this.network) {
      throw new Error("Something went wrong while connecting");
    }
    return this.network;
  }
  async getPublicKey() {
    if (!this.publicKey) {
      throw new Error("Something went wrong while connecting");
    }
    return this.publicKey;
  }
}

// src/connectors/unisat.ts
var getUnisatNetwork = (network) => {
  switch (network) {
    case "testnet":
      return "testnet";
    default:
      return "livenet";
  }
};

class UnisatConnector extends BtcConnector {
  id = "unisat";
  name = "Unisat";
  homepage = "https://unisat.io";
  banance = { confirmed: 0, unconfirmed: 0, total: 0 };
  unisat;
  constructor(network) {
    super(network);
    this.unisat = window.unisat;
  }
  on(event, handler) {
    this.unisat.on(event, handler);
  }
  removeListener(event, handler) {
    this.unisat.removeListener(event, handler);
  }
  async connect() {
    this.connected = false;
    try {
      if (!this.unisat) {
        throw new Error("Unisat not installed");
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
        this.unisat.getBalance()
      ]);
      this.publicKey = publicKey;
      this.network = network;
      this.banance = banance;
      this.connected = true;
    }
  }
  async disconnect() {
    this.address = undefined;
    this.publicKey = undefined;
    this.connected = false;
    this.banance = { confirmed: 0, unconfirmed: 0, total: 0 };
  }
  async getAccounts() {
    return this.unisat.getAccounts();
  }
  async sendToAddress(toAddress, amount) {
    return this.unisat?.sendBitcoin(toAddress, amount);
  }
  async switchNetwork(network) {
    await this.unisat.switchNetwork(getUnisatNetwork(network));
  }
  async getPublicKey() {
    return this.unisat.getPublicKey();
  }
  async getBalance() {
    return this.unisat.getBalance();
  }
  async signPsbt(psbtHex, options) {
    return this.unisat.signPsbt(psbtHex, options);
  }
  async signMessage(message) {
    return this.unisat.signMessage(message);
  }
  async signPsbts(psbtHexs, options) {
    return this.unisat.signPsbts(psbtHexs, options);
  }
  async pushTx(rawTx) {
    return this.unisat.pushTx({ rawtx: rawTx });
  }
  async pushPsbt(psbtHex) {
    return this.unisat.pushPsbt(psbtHex);
  }
}
// src/connectors/okx.ts
class OkxConnector extends BtcConnector {
  id = "okx";
  name = "Okx Wallet";
  homepage = "https://www.okx.com/web3/build/docs/sdks/chains/bitcoin/provider";
  banance = { confirmed: 0, unconfirmed: 0, total: 0 };
  okxwallet;
  constructor(network) {
    super(network);
    this.okxwallet = network === "testnet" ? window.okxwallet.bitcoinTestnet : window.okxwallet.bitcoin;
  }
  on(event, handler) {
    if (this.network === "livenet") {
      this.okxwallet.on(event, handler);
    }
  }
  async connect() {
    this.connected = false;
    try {
      if (!this.okxwallet) {
        throw new Error("OkxWallet not installed");
      }
      const res = await this.okxwallet.connect();
      this.connected = true;
      this.address = res.address;
      this.publicKey = res.publicKey;
      await this.getCurrentInfo();
    } catch (error) {
      throw error;
    }
    return this.connected;
  }
  async getCurrentInfo() {
    if (this.network === "livenet") {
      const accounts = await this.okxwallet.getAccounts();
      if (accounts.length) {
        this.address = accounts[0];
        const [publicKey, network, banance] = await Promise.all([
          this.okxwallet.getPublicKey(),
          this.okxwallet.getNetwork(),
          this.okxwallet.getBalance()
        ]);
        this.publicKey = publicKey;
        this.network = network;
        this.banance = banance;
        this.connected = true;
      }
    }
  }
  async disconnect() {
    this.address = undefined;
    this.publicKey = undefined;
    this.connected = false;
    this.banance = { confirmed: 0, unconfirmed: 0, total: 0 };
  }
  async getAccounts() {
    if (this.network !== "livenet") {
      throw new Error("Can't get accounts on testnet");
    }
    return this.okxwallet.getAccounts();
  }
  async getNetwork() {
    return this.network;
  }
  async getPublicKey() {
    if (this.network !== "livenet") {
      throw new Error("Can't get accounts on testnet");
    }
    return this.okxwallet.getPublicKey();
  }
  async getBalance() {
    if (this.network !== "livenet") {
      throw new Error("Can't get accounts on testnet");
    }
    return this.okxwallet.getBalance();
  }
  async sendToAddress(toAddress, amount) {
    if (this.network !== "livenet") {
      throw new Error("Can't get accounts on testnet");
    }
    return this.okxwallet?.sendBitcoin(toAddress, amount);
  }
  async switchNetwork(network) {
    this.network = network;
    this.okxwallet = network === "testnet" ? window.okxwallet.bitcoinTestnet : window.okxwallet.bitcoin;
  }
  async signPsbt(psbtHex, options) {
    return this.okxwallet.signPsbt(psbtHex, options);
  }
  async signMessage(message) {
    return this.okxwallet.signMessage(message);
  }
  async signPsbts(psbtHexs, options) {
    return this.okxwallet.signPsbts(psbtHexs, options);
  }
  async pushTx(rawTx) {
    if (this.network !== "livenet") {
      throw new Error("Can't get accounts on testnet");
    }
    return this.okxwallet.pushTx(rawTx);
  }
  async pushPsbt(psbtHex) {
    if (this.network !== "livenet") {
      throw new Error("Can't get accounts on testnet");
    }
    return this.okxwallet.pushPsbt(psbtHex);
  }
}
// src/index.ts
class BtcWalletConnect {
  local_storage_key = "btc_connector_id";
  connectorId = "unisat";
  localConnectorId;
  connected = false;
  installed = false;
  address;
  publicKey;
  network;
  balance = { confirmed: 0, unconfirmed: 0, total: 0 };
  connectors;
  connector;
  constructor({
    network = "livenet",
    defaultConnectorId = "unisat"
  }) {
    this.network = network;
    this.connectors = [
      {
        id: "unisat",
        instance: new UnisatConnector(this.network),
        installed: !!window.unisat
      },
      {
        id: "okx",
        instance: new OkxConnector(this.network),
        installed: !!window.okxwallet
      }
    ];
    this.localConnectorId = localStorage.getItem(this.local_storage_key) || undefined;
    this.connectorId = defaultConnectorId;
    this.connector = this.connectors.find((c) => c.id === defaultConnectorId && c.installed)?.instance;
  }
  async switchConnector(id) {
    const _c = this.connectors.find((c) => c.id === id && c.installed)?.instance;
    if (!_c) {
      throw new Error("Connector not found");
    }
    this.connector = _c;
    return _c;
  }
  async connect() {
    if (!this.connector) {
      throw new Error("Connector not found");
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
  async getCurrentInfo() {
    if (!this.connector) {
      throw new Error("Connector not found");
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
      throw new Error("Connector not found");
    }
    this.connectorId = this.localConnectorId || this.connectorId;
    const _c = this.connectors.find((c) => c.id === this.connectorId && c.installed)?.instance;
    if (!_c) {
      throw new Error("Connector not found");
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
      throw new Error("Connector not found");
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
      throw new Error("Connector not found");
    }
    return this.connector.getAccounts();
  }
  async getNetwork() {
    if (!this.connector) {
      throw new Error("Connector not found");
    }
    return this.connector.network;
  }
  async switchNetwork(network) {
    if (!this.connector) {
      throw new Error("Connector not found");
    }
    await this.connector.switchNetwork(network);
    this.network = network;
  }
  async sendToAddress(toAddress, amount) {
    if (!this.connector) {
      throw new Error("Connector not found");
    }
    return this.connector.sendToAddress(toAddress, amount);
  }
  async signMessage(message, type) {
    if (!this.connector) {
      throw new Error("Connector not found");
    }
    return this.connector.signMessage(message);
  }
  async signPsbt(psbtHex, options) {
    if (!this.connector) {
      throw new Error("Connector not found");
    }
    return this.connector.signPsbt(psbtHex, options);
  }
  async signPsbts(psbtHexs, options) {
    if (!this.connector) {
      throw new Error("Connector not found");
    }
    return this.connector.signPsbts(psbtHexs, options);
  }
  async pushTx(rawTx) {
    if (!this.connector) {
      throw new Error("Connector not found");
    }
    return this.connector.pushTx(rawTx);
  }
  async pushPsbt(psbtHex) {
    if (!this.connector) {
      throw new Error("Connector not found");
    }
    return this.connector.pushPsbt(psbtHex);
  }
  on = (event, handler) => {
    if (!this.connector) {
      throw new Error("Connector not found");
    }
    if (this.connector instanceof UnisatConnector) {
      this.connector.on(event, handler);
    } else {
      this.connector.on(event, handler);
    }
  };
  removeListener = (event, handler) => {
    if (!this.connector) {
      throw new Error("Connector not found");
    }
    if (this.connector instanceof UnisatConnector) {
      this.connector.removeListener(event, handler);
    }
  };
}
var src_default = BtcWalletConnect;
export {
  src_default as default
};
