import type { Network } from '@btc-connect/core';
import { computed, ref, watch } from 'vue';
import { useWalletContext } from '../walletContext';

// 本地网络信息映射
const NETWORK_INFO: Record<Network, { name: string; type: string }> = {
  livenet: {
    name: 'Mainnet',
    type: 'main',
  },
  testnet: {
    name: 'Testnet',
    type: 'test',
  },
  regtest: {
    name: 'Regtest',
    type: 'regtest',
  },
  mainnet: {
    name: 'Mainnet',
    type: 'main',
  },
};

function getNetworkName(network?: Network): string {
  if (!network) return 'Unknown';
  return NETWORK_INFO[network]?.name || 'Unknown';
}

function getNetworkType(network?: Network): string {
  if (!network) return 'unknown';
  return NETWORK_INFO[network]?.type || 'unknown';
}

export function useNetwork() {
  const ctx = useWalletContext();
  const currentNetwork = ref<Network | undefined>(ctx.state.value.network);

  // 监听网络变化
  watch(
    ctx.state,
    (newState) => {
      currentNetwork.value = newState.network;
    },
    { immediate: true },
  );

  const switchNetwork = async (targetNetwork: Network): Promise<void> => {
    if (ctx.manager.value?.switchNetwork) {
      return await ctx.manager.value.switchNetwork(targetNetwork);
    }
    throw new Error('Network switching not supported or no wallet connected');
  };

  const network = computed(() => {
    const net = currentNetwork.value;
    return {
      network: net,
      name: getNetworkName(net),
      type: getNetworkType(net),
    };
  });

  const getNetworkInfo = (net: Network) => {
    return {
      name: getNetworkName(net),
      type: getNetworkType(net),
    };
  };

  return {
    network,
    currentNetwork,
    switchNetwork,
    name: computed(() => getNetworkName(currentNetwork.value)),
    getNetworkInfo,
  };
}
