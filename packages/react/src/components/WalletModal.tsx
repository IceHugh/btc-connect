import * as React from 'react';
import { useMemo, useCallback } from 'react';
import { createComponent } from '@lit/react';
import { WalletModal as WalletModalWC } from '@btc-connect/ui/wallet-modal';
import { useConnectWallet } from '../context';
import { useWalletModal } from '../hooks';
import { getAllAdapters } from '@btc-connect/core';

// Low-level React wrapper for the custom element (loosened types for compatibility)
const WalletModalElement = (createComponent as any)({
  react: React as any,
  tagName: 'wallet-modal',
  elementClass: WalletModalWC,
  events: {
    onWalletSelected: 'wallet-selected',
    onModalClosed: 'modal-closed',
    onModalOpened: 'modal-opened',
  },
});

export interface WalletModalProps {
  theme?: 'light' | 'dark';
  title?: string;
  texts?: {
    title?: string;
    installedText?: string;
    notInstalledText?: string;
    downloadText?: string;
  };
}

export const WalletModal: React.FC<WalletModalProps> = ({
  theme = 'light',
  title = 'Select Wallet',
  texts,
}) => {
  const { availableWallets, connect } = useConnectWallet();
  const { isModalOpen, closeModal } = useWalletModal();

  const installedSet = useMemo(
    () => new Set(availableWallets.map((w) => w.id)),
    [availableWallets],
  );

  const allWalletInfos = useMemo(() => {
    // Map core adapters to UI modal wallet items
    return getAllAdapters().map((adapter) => ({
      id: adapter.id,
      name: adapter.name,
      icon: adapter.icon,
      installed: installedSet.has(adapter.id),
    }));
  }, [installedSet]);

  const handleWalletSelected = useCallback(
    async (e: CustomEvent<{ wallet: string }>) => {
      const walletId = e.detail.wallet;
      try {
        await connect(walletId);
      } finally {
        closeModal();
      }
    },
    [connect, closeModal],
  );

  const handleModalClosed = useCallback(() => {
    // Keep React state in sync if the modal self-closes
    closeModal();
  }, [closeModal]);

  const WalletModalReact = WalletModalElement as unknown as React.ComponentType<any>;

  return (
    <WalletModalReact
      open={isModalOpen}
      theme={theme}
      title={title}
      texts={
        texts ?? {
          title: 'Select Wallet',
          installedText: 'Installed',
          notInstalledText: 'Not Installed',
          downloadText: 'Download',
        }
      }
      wallets={allWalletInfos}
      onWalletSelected={handleWalletSelected as unknown as (e: Event) => void}
      onModalClosed={handleModalClosed}
    />
  );
};
