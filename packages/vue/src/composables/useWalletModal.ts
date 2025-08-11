import { ref } from 'vue'

const isOpen = ref(false)

export function useWalletModal() {
  const isModalOpen = isOpen
  const openModal = () => { isOpen.value = true }
  const closeModal = () => { isOpen.value = false }
  return { isModalOpen, openModal, closeModal }
}



