<template>
  <div class="h-20 bg-gray-800">
    <WalletConnect
      :config="{
        defaultNetwork: Network.TESTNET,
        networkForce: true,
      }"
    ></WalletConnect>
  </div>
</template>

<script setup lang="ts">
import { Network } from 'btc-connect-core';
</script>
