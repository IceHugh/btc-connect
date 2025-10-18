import { useState } from 'react';
import {
  AccountInfo,
  AccountInfoGroup,
    BTCThemeProvider,
  BTCWalletProvider,
  ConnectButton,
  MinimalConnectButton,
  NetworkStatus,
  NetworkSwitch,
  QuickActions,
  ThemeToggle,
  WalletGrid,
  WalletModal,
  WalletSelect,
} from '../src';

// 基础使用示例
function BasicExample() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <BTCThemeProvider>
      <BTCWalletProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* 标题和主题切换 */}
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                BTC Connect React 组件库示例
              </h1>
              <ThemeToggle />
            </div>

            {/* 连接按钮示例 */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                连接按钮样式
              </h2>
              <div className="flex flex-wrap gap-4">
                <ConnectButton />
                <ConnectButton />
                <MinimalConnectButton />
                <ConnectButton variant="secondary">自定义按钮</ConnectButton>
              </div>
            </section>

            {/* 钱包模态框示例 */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                钱包模态框
              </h2>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-btc-500 text-white rounded-lg hover:bg-btc-600"
              >
                打开钱包选择
              </button>
              <WalletModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                animation="scale"
              />
            </section>

            {/* 账户信息示例 */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                账户信息显示
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AccountInfo variant="minimal" />
                <AccountInfo variant="card" />
                <AccountInfo variant="detailed" />
              </div>
            </section>

            {/* 网络切换示例 */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                网络切换
              </h2>
              <div className="flex flex-wrap gap-4 items-center">
                <NetworkSwitch />
                <NetworkSwitch variant="compact" />
                <NetworkSwitch variant="button" />
                <NetworkStatus variant="badge" />
                <NetworkStatus variant="card" />
              </div>
            </section>

            {/* 钱包选择示例 */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                钱包选择器
              </h2>
              <div className="space-y-4">
                <WalletSelect />
                <WalletSelect variant="compact" />
                <WalletSelect variant="button" />
              </div>
            </section>

            {/* 快速操作示例 */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                快速操作
              </h2>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
                <AccountInfo variant="detailed" />
                <div className="mt-4">
                  <QuickActions />
                </div>
              </div>
            </section>

            {/* 钱包网格示例 */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                钱包网格
              </h2>
              <WalletGrid />
            </section>
          </div>
        </div>
      </BTCWalletProvider>
    </BTCThemeProvider>
  );
}

// 高级使用示例
function AdvancedExample() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [_selectedNetwork, setSelectedNetwork] = useState(null);

  return (
    <BTCThemeProvider defaultTheme="dark">
      <BTCWalletProvider>
        <div className="min-h-screen bg-gray-900 p-6">
          <div className="max-w-6xl mx-auto">
            {/* 自定义配置的钱包模态框 */}
            <WalletModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              title="选择您的比特币钱包"
              featuredWallets={['unisat', 'okx', 'xverse']}
              animation="slide"
            />

            {/* 自定义样式组合 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 左侧：连接和状态 */}
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    钱包连接
                  </h3>
                  <div className="space-y-4">
                    <ConnectButton size="lg" />
                    <NetworkSwitch
                      variant="button"
                      size="lg"
                      onNetworkChange={setSelectedNetwork}
                    />
                  </div>
                </div>

                <AccountInfoGroup>
                  <QuickActions showQRCode={true} />
                </AccountInfoGroup>
              </div>

              {/* 右侧：钱包选择和详情 */}
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    钱包管理
                  </h3>
                  <WalletSelect
                    variant="button"
                    showDescription={true}
                    featuredWallets={['unisat', 'okx']}
                  />
                </div>

                <div className="bg-gray-800 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    所有钱包
                  </h3>
                  <WalletGrid
                    featuredWallets={['unisat', 'okx', 'xverse']}
                    showBalance={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </BTCWalletProvider>
    </BTCThemeProvider>
  );
}

// 响应式布局示例
function ResponsiveExample() {
  return (
    <BTCThemeProvider>
      <BTCWalletProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          {/* 顶部导航栏 */}
          <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-btc-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">₿</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      BTC dApp
                    </h1>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <NetworkSwitch variant="compact" />
                  <MinimalConnectButton />
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </nav>

          {/* 主要内容 */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* 左侧边栏 */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                  <AccountInfo variant="detailed" />
                  <div className="mt-6">
                    <QuickActions />
                  </div>
                </div>
              </div>

              {/* 主要内容区域 */}
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    欢迎使用 BTC Connect
                  </h2>

                  {!account ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-btc-100 dark:bg-btc-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-8 h-8 text-btc-600 dark:text-btc-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-label="添加"
                          role="img"
                        >
                          <title>添加</title>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        连接钱包开始使用
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        连接您的比特币钱包来访问所有功能
                      </p>
                      <ConnectButton size="lg" />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-r from-btc-50 to-btc-100 dark:from-btc-900/20 dark:to-btc-800/20 rounded-xl p-4">
                          <h4 className="text-sm font-medium text-btc-600 dark:text-btc-400 mb-1">
                            账户余额
                          </h4>
                          <p className="text-2xl font-bold text-btc-700 dark:text-btc-300">
                            {balance?.toFixed(8) || '0.00000000'} BTC
                          </p>
                        </div>
                        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4">
                          <h4 className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                            当前网络
                          </h4>
                          <NetworkStatus variant="badge" size="lg" />
                        </div>
                      </div>

                      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                          可用钱包
                        </h3>
                        <WalletGrid />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </BTCWalletProvider>
    </BTCThemeProvider>
  );
}

// 导出示例组件
export { BasicExample, AdvancedExample, ResponsiveExample };

// 导出示例作为默认导出
export default function ExampleApp() {
  return <BasicExample />;
}
