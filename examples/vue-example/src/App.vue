<script setup lang="ts">
import { BTCConnectButton, WalletModal } from '@btc-connect/vue'
</script>

<template>
  <div style="display:flex; gap: 16px; align-items: center;">
    <BTCConnectButton theme="light" label="Connect Wallet" />
    <WalletModal />
  </div>
</template>

<style scoped>
</style>
