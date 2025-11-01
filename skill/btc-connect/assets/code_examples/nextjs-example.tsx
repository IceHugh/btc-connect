'use client';

import {
  useAccount,
  useNetwork,
  useSignature,
  useWallet,
} from '@btc-connect/react';
import { useEffect, useState } from 'react';

// Next.js 客户端组件示例
export default function NextJsWalletExample() {
  // SSR 防护：确保客户端渲染
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  // React Hooks 使用（与React示例相同）
  const {
    wallet,
    isConnected,
    isConnecting,
    connect,
    disconnect,
    currentWallet,
  } = useWallet();

  const { network, switchNetwork, isSwitching } = useNetwork();

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

  // 网络切换
  const handleSwitchNetwork = async (
    targetNetwork: 'livenet' | 'testnet' | 'regtest',
  ) => {
    try {
      await switchNetwork(targetNetwork);
      console.log('网络切换成功');
    } catch (error) {
      console.error('网络切换失败:', error);
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
