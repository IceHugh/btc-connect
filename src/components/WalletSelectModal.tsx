import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { closeIcon, loadingIcon } from '../assets';
import { BtcConnectorId } from '../types/wallet';

export interface WalletSelectModalProps {
  visible: boolean;
  title?: string;
  theme?: 'light' | 'dark';
  wallets: any[];
  onClick?: (id: BtcConnectorId) => void;
  onClose?: () => void;
}
export const WalletSelectModal = ({
  visible,
  title = 'Select Wallet',
  theme = 'light',
  wallets = [],
  onClick,
  onClose,
}: WalletSelectModalProps) => {
  const [isBrowser, setIsBrowser] = useState(false);
  const [loading, setLoading] = useState(false);

  const clickHandler = async (id: BtcConnectorId, installed: boolean) => {
    if (loading || !installed) return;
    setLoading(true);
    try {
      await onClick?.(id);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    setIsBrowser(true);
  }, []);

  const modalContent = visible ? (
    <div className="fixed top-0 left-0 w-screen h-screen z-[9999]">
      <div
        className={`bg-black ${theme === 'dark' ? 'bg-opacity-70' : 'bg-opacity-30'}  w-full h-full`}
      ></div>
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 max-w-[90%] min-h-30 max-h-[full] rounded-xl  overflow-hidden ${theme === 'dark' ?
      'text-[#ecedee] bg-[#18181b]' : 'bg-white text-black'}`}>
        <div className={`p-4  relative ${theme === 'dark' ? 'border-b border-gray-600' : 'border-b border-gray-200'}`}>
          <h2 className="text-xl font-bold text-center">{title}</h2>
          <button
            onClick={() => onClose?.()}
            className="absolute top-1/2 -translate-y-1/2 right-4"
          >
            <img src={closeIcon} alt="close" className={`w-6 h-6 ${theme === 'dark' ? 'invert' : ''}`} />
          </button>
        </div>
        <div className="p-4 flex flex-col gap-2">
          {wallets.map((wallet: any) => (
            <div
              key={wallet.id}
              onClick={() => clickHandler?.(wallet.id, wallet.installed)}
              className={`h-12 cursor-pointer flex items-center justify-between p-2 gap-2 rounded-lg relative overflow-hidden ${theme === 'dark' ? 'bg-[#2d2d2d] text-[#ecedee]' : 'bg-gray-100 text-black'}`}
            >
              {loading && (
                <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-80 flex items-center justify-center">
                  <img
                    src={loadingIcon}
                    alt="loading"
                    className="w-6 h-6 animate-spin"
                  />
                </div>
              )}
              <div className="flex items-center flex-1">
                <img
                  src={wallet.logo}
                  alt={wallet.name}
                  className="w-8 h-8 mr-2"
                />
                <span className="flex-1">{wallet.name}</span>
              </div>
              <div className="text-xs text-orange-600">
                {wallet.installed && 'Not Installed'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ) : null;

  if (isBrowser) {
    return ReactDOM.createPortal(modalContent, document.body);
  } else {
    return null;
  }
};
