import { defineComponent, h, onMounted, ref } from 'vue'
import { useConnectWallet } from '../composables/useCore'
import { useWalletModal } from '../composables'
import { getAllAdapters } from '@btc-connect/core'

// Ensure custom element is registered
import '@btc-connect/ui/wallet-modal'

export default defineComponent({
  name: 'WalletModal',
  props: {
    theme: { type: String as () => 'light' | 'dark', default: 'light' },
    title: { type: String, default: 'Select Wallet' },
    texts: { type: Object as () => { title?: string; installedText?: string; notInstalledText?: string; downloadText?: string }, default: undefined },
  },
  setup(props) {
    const { availableWallets, connect } = useConnectWallet()
    const { isModalOpen, closeModal } = useWalletModal()
    const wallets = ref<any[]>([])

    const recompute = () => {
      const installed = new Set(availableWallets.map(w => w.id))
      wallets.value = getAllAdapters().map((adapter) => ({
        id: adapter.id,
        name: adapter.name,
        icon: adapter.icon,
        installed: installed.has(adapter.id),
      }))
    }

    onMounted(recompute)
    // no reactive source provided; consumer should trigger recompute when list changes in future if needed

    const onWalletSelected = async (e: CustomEvent<{ wallet: string }>) => {
      const walletId = e.detail.wallet
      try { await connect(walletId) } finally { closeModal() }
    }

    const onModalClosed = () => closeModal()

    return () => h('wallet-modal', {
      open: isModalOpen.value,
      theme: props.theme,
      title: props.title,
      texts: props.texts ?? { title: 'Select Wallet', installedText: 'Installed', notInstalledText: 'Not Installed', downloadText: 'Download' },
      wallets: wallets.value,
      onWalletSelected: onWalletSelected as unknown as (e: Event) => void,
      onModalClosed,
    })
  },
})


