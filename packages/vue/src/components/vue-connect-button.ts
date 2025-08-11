import { defineComponent, h, ref, watch } from 'vue'
import { useConnectWallet } from '../composables/useCore'
import { useWallet, useWalletModal } from '../composables'

// Ensure custom element is registered by importing once
import '@btc-connect/ui/connect-button'

export default defineComponent({
  name: 'BTCConnectButton',
  props: {
    theme: { type: String as () => 'light' | 'dark', default: 'light' },
    unit: { type: String, default: 'BTC' },
    disconnectText: { type: String, default: 'Disconnect' },
    label: { type: String, default: undefined },
  },
  setup(props) {
    const { isConnected } = useWallet()
    const { disconnect } = useConnectWallet()
    const { openModal } = useWalletModal()
    const address = ref<string>('')
    const balance = ref<number>(0)

    const wallet = useWallet()
    console.log(wallet);
    watch(() => wallet.state.value, (s) => {
      address.value = s.currentAccount?.address || ''
      const b: any = s.currentAccount?.balance
      balance.value = b && typeof b === 'object' && typeof b.total === 'number' ? b.total : 0
    }, { immediate: true })

    console.log(isConnected);
    const onClick = () => {
      if (!isConnected.value) openModal()
    }
    const onDisconnect = async () => { await disconnect() }

    return () =>
      h('connect-button', {
        connected: isConnected.value,
        balance: balance.value,
        address: address.value,
        unit: props.unit,
        theme: props.theme,
        disconnectText: props.disconnectText,
        label: props.label,
        onClick,
        onDisconnect,
      })
  },
})


