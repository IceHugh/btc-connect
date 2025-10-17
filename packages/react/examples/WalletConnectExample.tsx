import {
  AccountInfo,
  BTCWalletProvider,
  ConnectButton,
  NetworkSwitch,
  useWalletModal,
  WalletModal,
} from '@btc-connect/react';

function WalletConnectExample() {
  const { isOpen, openModal, closeModal } = useWalletModal();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            BTC Connect React 示例
          </h1>
          <p className="text-gray-600">使用 React 组件连接比特币钱包</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 连接按钮 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">连接钱包</h2>
            <div className="space-y-4">
              <ConnectButton onClick={openModal} />
              <button
                onClick={openModal}
                className="w-full px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
              >
                打开钱包选择器
              </button>
            </div>
          </div>

          {/* 网络切换 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">网络设置</h2>
            <NetworkSwitch />
          </div>

          {/* 账户信息 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">账户信息</h2>
            <AccountInfo />
          </div>

          {/* 高级功能 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">高级功能</h2>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  支持的钱包：UniSat, OKX, Xverse
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  支持的网络：主网、测试网、本地测试网
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  功能：连接、断开、切换钱包、网络切换
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 钱包模态框 */}
      <WalletModal isOpen={isOpen} onClose={closeModal} title="选择钱包" />
    </div>
  );
}

export default function App() {
  return (
    <BTCWalletProvider>
      <WalletConnectExample />
    </BTCWalletProvider>
  );
}
