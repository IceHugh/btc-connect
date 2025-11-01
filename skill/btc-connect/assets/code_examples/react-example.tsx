import {
  useAccount,
  useNetwork,
  useSignature,
  useWallet,
} from '@btc-connect/react';

// React Hook 使用示例
export default function WalletExample() {
  // 钱包连接 Hook
  const {
    wallet,
    isConnected,
    isConnecting,
    connect,
    disconnect,
    currentWallet,
  } = useWallet();

  // 🆕 网络切换 Hook
  const { network, switchNetwork, isSwitching } = useNetwork();

  // 账户和签名 Hooks
  const { account, getBalance } = useAccount();
  const { signMessage } = useSignature();

  // 连接钱包
  const handleConnect = async (walletId: string) => {
    try {
      const accounts = await connect(walletId);
      console.log('连接成功:', accounts);
    } catch (error) {
      console.error('连接失败:', error);
    }
  };

  // 🆕 网络切换
  const handleSwitchNetwork = async (
    targetNetwork: 'livenet' | 'testnet' | 'regtest',
  ) => {
    try {
      await switchNetwork(targetNetwork);
      console.log('网络切换成功');
    } catch (error) {
      console.error('网络切换失败:', error);
      // OKX 钱包特殊处理
      if (currentWallet?.id === 'okx') {
        console.log('OKX 钱包需要在钱包中手动切换网络');
      }
    }
  };

  // 消息签名
  const handleSignMessage = async (message: string) => {
    try {
      const signature = await signMessage(message);
      console.log('签名成功:', signature);
      return signature;
    } catch (error) {
      console.error('签名失败:', error);
    }
  };

  return {
    // 状态
    isConnected,
    isConnecting,
    isSwitching,
    network,
    wallet,
    currentWallet,
    account,

    // 操作方法
    connect: handleConnect,
    disconnect,
    switchNetwork: handleSwitchNetwork,
    signMessage: handleSignMessage,
    getBalance,
  };
}
