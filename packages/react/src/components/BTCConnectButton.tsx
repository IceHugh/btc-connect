import * as React from 'react';
import { useCallback } from 'react';
import { createComponent } from '@lit/react';
import { ConnectButton as ConnectButtonWC } from '@btc-connect/ui/connect-button';
import { useConnectWallet, useWallet } from '../context';
import { useWalletModal } from '../hooks';

// Low-level React wrapper for the custom element (loosened types for compatibility)
const ConnectButtonElement = (createComponent as any)({
  react: React as any,
  tagName: 'connect-button',
  elementClass: ConnectButtonWC,
  events: {
    onClick: 'click',
    onDisconnect: 'disconnect',
  },
});

export interface BTCConnectButtonProps {
  theme?: 'light' | 'dark';
  unit?: string;
  disconnectText?: string;
  label?: string;
}

export const BTCConnectButton: React.FC<BTCConnectButtonProps> = ({
  theme = 'light',
  unit = 'BTC',
  disconnectText = 'Disconnect',
  label,
}) => {
  const { isConnected, balance, address = '' } = useWallet();
  const { disconnect } = useConnectWallet();
  const { openModal } = useWalletModal();

  const handleClick = useCallback(() => {
    if (!isConnected) {
      openModal();
    }
  }, [isConnected, openModal]);

  const handleDisconnect = useCallback(() => {
    void disconnect();
  }, [disconnect]);

  const ConnectButtonReact = ConnectButtonElement as unknown as React.ComponentType<any>;

  return (
    <ConnectButtonReact
      connected={isConnected}
      balance={typeof balance === 'object' && balance && typeof (balance as any).total === 'number' ? (balance as any).total : 0}
      address={address || ''}
      unit={unit}
      theme={theme}
      disconnectText={disconnectText}
      label={label}
      onClick={handleClick}
      onDisconnect={handleDisconnect}
    />
  );
};
