import { ref } from 'vue';
import type { BtcConnectorId, Balance } from 'btc-connect-core';
import { UNISAT_LOGO, OKX_LOGO, SAT20_LOGO } from './constant';
import { Network } from 'btc-connect-core';
declare global {
  interface Window {
    btcWallet: any;
  }
}
import { BtcWalletConnectConfig } from './type';
import BtcWalletConnect, { Connector } from 'btc-connect-core';

// 创建一个闭包来存储单例的状态
let instance: ReturnType<typeof createStore> | null = null;

const createStore = () => {
  const btcWallet = ref<BtcWalletConnect | undefined>();
  const balance = ref<Balance>({ confirmed: 0, unconfirmed: 0, total: 0 });
  const publicKey = ref<string>('');
  const address = ref<string>('');
  const message = ref<string>('');
  const connected = ref<boolean>(false);
  const networkForce = ref<boolean>(false);
  const initStatus = ref<boolean>(false);
  const modalVisible = ref<boolean>(false);
  const signature = ref<string>('');
  const network = ref<Network>(Network.LIVENET);
  const forceNetwork = ref<Network>(Network.LIVENET);
  const connectorId = ref<BtcConnectorId | undefined>();
  const localConnectorId = ref<BtcConnectorId | undefined>();
  const connector = ref<Connector | undefined>();
  const connectors = ref<
    | Array<{
        id: BtcConnectorId;
        name: string;
        logo: string;
        connector: any;
        installed: boolean;
      }>
    | undefined
  >();

  const setModalVisible = (visible: boolean) => {
    modalVisible.value = visible;
  };

  const init = (config: BtcWalletConnectConfig = {}) => {
    try {
      const {
        defaultNetwork = Network.LIVENET,
        message: configMessage = '',
        networkForce: configNetworkForce = false,
      } = config;
      message.value = configMessage;
      networkForce.value = configNetworkForce;
      const wallet = new BtcWalletConnect({
        network: defaultNetwork,
      });
      window.btcWallet = wallet;
      btcWallet.value = wallet;
      network.value = defaultNetwork;
      forceNetwork.value = defaultNetwork;
      connector.value = wallet.connector;
      localConnectorId.value = wallet.localConnectorId;
      console.log('wallet.connectors', wallet.connectors);

      connectors.value = wallet.connectors.map((con) => ({
        id: con.id as BtcConnectorId,
        name: con.instance.name,
        logo:
          con.id === 'unisat'
            ? UNISAT_LOGO
            : con.id === 'okx'
              ? OKX_LOGO
              : SAT20_LOGO,
        connector: con.instance,
        installed: con.installed,
      }));
      initStatus.value = true;
    } catch (error) {
      console.error('Error initializing Wallet', error);
      initStatus.value = false;
      throw error;
    }
  };

  const switchConnector = (id: BtcConnectorId) => {
    if (!btcWallet.value) {
      throw new Error('Wallet not initialized');
    }
    btcWallet.value.switchConnector(id);
    connectorId.value = id;
    connector.value = btcWallet.value.connector;
    localConnectorId.value = btcWallet.value.localConnectorId;
  };

  const check = async () => {
    try {
      if (!btcWallet.value) {
        throw new Error('Wallet not initialized');
      }
      await btcWallet.value.check();
      if (btcWallet.value?.address) {
        address.value = btcWallet.value.address;
      }
      if (btcWallet.value?.publicKey) {
        publicKey.value = btcWallet.value.publicKey;
      }
      balance.value = btcWallet.value.balance;
      connected.value = btcWallet.value.connected;
      network.value = btcWallet.value.network;
      localConnectorId.value = btcWallet.value.localConnectorId;
    } catch (error) {
      console.error('Error checking Wallet', error);
      throw error;
    }
  };

  const connect = async () => {
    try {
      if (!btcWallet.value) {
        throw new Error('Wallet not initialized');
      }
      await btcWallet.value.connect();
      if (
        networkForce.value &&
        btcWallet.value.network !== forceNetwork.value
      ) {
        await btcWallet.value.switchNetwork(forceNetwork.value as any);
      }
      if (btcWallet.value?.address) {
        address.value = btcWallet.value.address;
      }
      if (btcWallet.value?.publicKey) {
        publicKey.value = btcWallet.value.publicKey;
      }
      console.log('networkForce', networkForce.value);
      console.log('forceNetwork', forceNetwork.value);
      console.log('btcWallet.value.network', btcWallet.value.network);

      if (message.value) {
        signature.value = await btcWallet.value.signMessage(message.value);
      }
      balance.value = btcWallet.value.balance;
      connected.value = btcWallet.value.connected;
      network.value = btcWallet.value.network;
      localConnectorId.value = btcWallet.value.localConnectorId;
    } catch (error) {
      console.error('Error connecting Wallet', error);
      throw error;
    }
  };

  const disconnect = async () => {
    if (!btcWallet.value) {
      throw new Error('Wallet not initialized');
    }
    await btcWallet.value.disconnect();
    balance.value = { confirmed: 0, unconfirmed: 0, total: 0 };
    signature.value = '';
    connectorId.value = undefined;
    publicKey.value = '';
    address.value = '';
    initStatus.value = false;
    connected.value = false;
    network.value = Network.LIVENET;
  };

  const switchNetwork = async (n: Network) => {
    try {
      if (!btcWallet.value) {
        throw new Error('Wallet not initialized');
      }
      await btcWallet.value.switchNetwork(n);
      network.value = await btcWallet.value.getNetwork();
      if (btcWallet.value?.address) {
        address.value = btcWallet.value.address;
      }
      if (btcWallet.value?.publicKey) {
        publicKey.value = btcWallet.value.publicKey;
      }
      balance.value = btcWallet.value.balance;
      connected.value = btcWallet.value.connected;
      localConnectorId.value = btcWallet.value.localConnectorId;
    } catch (error) {
      console.error('Error switching network', error);
      throw error;
    }
  };

  return {
    btcWallet,
    balance,
    publicKey,
    address,
    signature,
    connected,
    initStatus,
    modalVisible,
    network,
    connectorId,
    localConnectorId,
    connector,
    connectors,
    setModalVisible,
    init,
    switchConnector,
    check,
    connect,
    disconnect,
    switchNetwork,
  };
};

export const useWalletStore = () => {
  if (!instance) {
    instance = createStore();
  }
  return instance;
};
