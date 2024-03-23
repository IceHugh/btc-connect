import React, { useMemo } from 'react';
import { useEffect, useState, useRef } from 'react';
import BtcWalletConnect from '../connect';
import { WalletSelectModal } from './WalletSelectModal';
import { hideStr } from '../utils';
import { ExitIcon } from './ExitIcon';
import { useReactWalletStore } from '../hooks';
import { BtcWalletConnectOptions, BtcConnectorId } from '../types/wallet';

export interface WalletConnectReactProps {
  config: BtcWalletConnectOptions;
  theme?: 'light' | 'dark';
  onConnectSuccess?: (btcWallet: BtcWalletConnect) => void;
  onConnectError?: (error: any) => void;
  onDisconnectSuccess?: () => void;
  onDisconnectError?: (error: any) => void;
  children?: React.ReactNode;
}

export const WalletConnectReact = ({
  config: { network = 'livenet', defaultConnectorId = 'unisat' },
  theme = 'dark',
  onConnectSuccess,
  onConnectError,
  onDisconnectSuccess,
  onDisconnectError,
  children,
}: WalletConnectReactProps) => {
  const [visible, setVisible] = useState(false);
  const {
    connect,
    check,
    connectors,
    connected,
    address,
    init,
    disconnect,
    initStatus,
    btcWallet,
    switchConnector,
  } = useReactWalletStore((state) => state);

  const handleConnect = () => {
    setVisible(true);
  };

  const walletSelect = async (id: BtcConnectorId) => {
    switchConnector(id);
    try {
      await connect();
      if (btcWallet) {
        onConnectSuccess?.(btcWallet);
      }
    } catch (error) {
      onConnectError?.(error);
    }
  };
  const handlerDisconnect = async () => {
    try {
      await disconnect();
      onDisconnectSuccess?.();
    } catch (error) {
      console.error(error);
      onDisconnectError?.(error);
    }
  };
  const wallets = useMemo(() => {
    return (
      connectors?.map((c) => ({
        id: c.id,
        name: c.name,
        logo: c.logo,
        installed: c.installed,
      })) || []
    );
  }, [connectors]);

  useEffect(() => {
    if (initStatus) {
      check();
    }
  }, [initStatus]);

  useEffect(() => {
    if (connected) {
      // btcWallet?.on("accountChanged", check);
      btcWallet?.on('networkChanged', check);
    }
    return () => {
      // btcWallet?.removeListener("accountChanged", check);
      btcWallet?.removeListener('networkChanged', check);
    };
  }, [connected]);

  useEffect(() => {
    init({ network, defaultConnectorId });
  }, []);

  useEffect(() => {
    init({ network, defaultConnectorId });
  }, [network, defaultConnectorId]);

  return (
    <>
      {!connected ? (
        <>
          <button
            onClick={handleConnect}
            className={`bg-clip-text text-transparent border  rounded-xl h-10 px-4 hover:border-yellow-500 ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-pink-500 to-violet-500 border-gray-600'
                : 'bg-gradient-to-r from-blue-500 to-green-500 border-gray-300'
            }`}
          >
            Connect
          </button>
          <WalletSelectModal
            theme={theme}
            onClose={() => setVisible(false)}
            visible={visible}
            wallets={wallets}
            onClick={walletSelect}
          />
        </>
      ) : !!children ? (
        children
      ) : (
        <button
          onClick={handlerDisconnect}
          className={`bg-clip-text text-transparent border border-gray-300 rounded-xl h-10 px-4 hover:border-yellow-500 flex justify-center items-center ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-pink-500 to-violet-500'
              : 'bg-gradient-to-r from-blue-500 to-green-500'
          }`}
        >
          <span className="mr-1">{hideStr(address, 4, '***')}</span>
          <ExitIcon
            className={`${theme === 'dark' ? 'text-white' : 'text-black'}`}
          />
        </button>
      )}
    </>
  );
};
