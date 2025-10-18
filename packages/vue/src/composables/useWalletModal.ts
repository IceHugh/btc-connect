import { useWalletContext } from '../walletContext';

/**
 * 使用钱包模态框的Composable
 */
export function useWalletModal() {
  const ctx = useWalletContext();

  return {
    isModalOpen: ctx.isModalOpen,
    openModal: ctx.openModal,
    closeModal: ctx.closeModal,
    toggleModal: ctx.toggleModal,
  };
}
