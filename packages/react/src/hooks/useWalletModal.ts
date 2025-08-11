import { useCallback } from 'react';
import { useSyncExternalStore } from 'react';

// Simple global store for modal open state
type Subscriber = () => void;

const modalStore = {
  isOpen: false,
  subscribers: new Set<Subscriber>(),
  subscribe(callback: Subscriber) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  },
  getSnapshot() {
    return this.isOpen;
  },
  open() {
    if (!this.isOpen) {
      this.isOpen = true;
      this.subscribers.forEach((cb) => cb());
    }
  },
  close() {
    if (this.isOpen) {
      this.isOpen = false;
      this.subscribers.forEach((cb) => cb());
    }
  },
};

export function useWalletModal() {
  const isModalOpen = useSyncExternalStore(
    (cb) => modalStore.subscribe(cb),
    () => modalStore.getSnapshot(),
    () => modalStore.getSnapshot(),
  );

  const openModal = useCallback(() => modalStore.open(), []);
  const closeModal = useCallback(() => modalStore.close(), []);

  return { isModalOpen, openModal, closeModal };
}
