📘 btc-connect 产品文档

一个专为比特币 Web3 应用设计的钱包连接工具包，提供统一的连接接口、事件监听和适配层，支持 UniSat、OKX Wallet、Xverse、Bitget 等主流钱包。核心逻辑独立于框架，支持 React 和 Vue 两大生态的适配模块。
钱包连接弹窗 UI	提供默认的连接按钮、钱包选择弹窗
⸻

🧱 项目结构

btc-connect/
├── core     # 钱包适配器、连接管理、状态控制（框架无关）
├── react    # 提供 React Hooks 与 Context
└── vue      # 提供 Vue Composables 与注入机制


⸻

✨ 产品定位

模块	功能定位
@btc-connect/core	框架无关的核心模块，定义统一的钱包接口协议（adapter），管理钱包连接状态与事件
@btc-connect/react	提供 React 上下文、Hooks、自动连接支持，与核心模块解耦
@btc-connect/vue	提供 Vue Composables、状态响应式封装，与核心模块解耦


⸻

🧩 支持的钱包（持续扩展中）
	•	✅ UniSat 接口文档 https://docs.unisat.io/dev/open-api-documentation/unisat-wallet#unisat-wallet-api
	•	✅ OKX Wallet 接口文档 https://web3.okx.com/zh-hans/build/dev-docs/sdks/chains/bitcoin/provider
	•	✅ Xverse 接口文档 https://docs.xverse.app/sats-connect/wallet-methods/wallet_getnetwork
	•	🟡 Bitget Wallet（规划中）
	•	🟡 Alby / Lightning Wallet（探索中）

⸻

🔧 安装方式

通用安装（Monorepo 用户）

pnpm i @btc-connect/core

React 项目

pnpm i @btc-connect/react

Vue 项目

pnpm i @btc-connect/vue


⸻

📦 使用方式

示例：在 React 中连接 UniSat 钱包

import { BTCWalletProvider, useWallet, useConnectWallet } from '@btc-connect/react'

export function App() {
  return (
    <BTCWalletProvider>
      <WalletConnectButton />
    </BTCWalletProvider>
  )
}

function WalletConnectButton() {
  const { account, connected } = useWallet()
  const connect = useConnectWallet('unisat')

  return (
    <button onClick={connect}>
      {connected ? `Connected: ${account}` : 'Connect UniSat'}
    </button>
    
  )
}


⸻

示例：在 Vue 中连接 OKX 钱包

<template>
  <button @click="connect">连接 OKX 钱包</button>
  <div v-if="account">当前账户：{{ account }}</div>
</template>

<script setup>
import { useBTCWallet, useConnectWallet } from '@btc-connect/vue'

const { account } = useBTCWallet()
const connect = useConnectWallet('okx')
</script>


⸻

🧱 核心模块结构：@btc-connect/core

文件名	描述
adapters/	所有钱包的 Adapter 实现目录
WalletManager	管理连接状态、事件订阅、Adapter 注册
types.ts	类型定义：钱包信息、事件类型、连接状态等
events.ts	简易 EventEmitter 或订阅系统，用于框架通信
index.ts	核心导出接口


⸻

🧩 Adapter 机制

每个钱包需实现统一接口：

interface BTCWalletAdapter {
  id: string
  name: string
  icon: string
  isReady(): boolean
  connect(): Promise<string[]>
  disconnect(): Promise<void>
  getAccounts(): Promise<string[]>
  getNetwork(): Promise<string>
  on(event: WalletEvent, handler: Function): void
  off(event: WalletEvent, handler: Function): void
}

所有 Adapter 由 WalletManager 注册管理：

manager.register(new UniSatAdapter())
manager.getAdapterById('unisat').connect()


⸻

⚙️ 可配置项（支持扩展）

配置项	描述
默认连接钱包 ID	用于实现“自动重连”逻辑
钱包列表展示顺序	可根据设备或地域设置排序，例如在移动端优先展示 OKX
自定义钱包图标与名称	支持通过注册接口动态注入新钱包
事件回调	连接成功、断开连接、账户切换、网络切换等状态变更回调





⸻

📣 目标用户
	•	BTC 原生 Web3 应用（如：BRC-20、Ordinals、Runes）
	•	支持多钱包接入的 DApp 前端开发者
	•	独立开发者或 Web3 初创团队
	•	面向比特币扩展生态的 UI 构建者

⸻

📚 文档 & 示例
	•	示例代码：
	•	React 示例（UniSat、OKX）
	•	Vue 示例（Xverse、Hiro）

⸻

📌 授权协议

MIT License - 免费、开源、可商用
