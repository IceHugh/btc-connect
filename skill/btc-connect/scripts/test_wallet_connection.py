#!/usr/bin/env python3
"""
钱包连接测试脚本
用于测试UniSat和OKX钱包的连接状态
"""
import asyncio
import json
import time
from pathlib import Path

def create_test_html():
    """创建测试HTML文件"""
    html_content = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BTC-Connect 钱包连接测试</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .wallet-status {
            padding: 15px;
            margin: 10px 0;
            border-radius: 5px;
            border-left: 4px solid #ddd;
        }
        .wallet-detected {
            background: #d4edda;
            border-color: #28a745;
            color: #155724;
        }
        .wallet-not-detected {
            background: #f8d7da;
            border-color: #dc3545;
            color: #721c24;
        }
        .wallet-connecting {
            background: #fff3cd;
            border-color: #ffc107;
            color: #856404;
        }
        .wallet-connected {
            background: #d1ecf1;
            border-color: #17a2b8;
            color: #0c5460;
        }
        button {
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin: 5px;
            font-size: 14px;
        }
        button:hover {
            background: #0056b3;
        }
        button:disabled {
            background: #6c757d;
            cursor: not-allowed;
        }
        .test-section {
            margin: 20px 0;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        .account-info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
            font-family: monospace;
            font-size: 12px;
        }
        .log {
            background: #000;
            color: #00ff00;
            padding: 15px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            max-height: 200px;
            overflow-y: auto;
            white-space: pre-wrap;
        }
        .error {
            color: #ff6b6b;
        }
        .success {
            color: #51cf66;
        }
        .warning {
            color: #ffd43b;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔗 BTC-Connect 钱包连接测试</h1>
        <p>此页面用于测试 UniSat 和 OKX 钱包的连接状态和功能。</p>

        <div class="test-section">
            <h2>📱 钱包检测</h2>
            <div id="wallet-status">
                <div class="wallet-status wallet-connecting">
                    正在检测钱包...
                </div>
            </div>
            <button onclick="detectWallets()">重新检测</button>
        </div>

        <div class="test-section">
            <h2>🔌 连接测试</h2>
            <div id="connection-section">
                <p>请先确保已安装并启用钱包扩展</p>
            </div>
        </div>

        <div class="test-section">
            <h2>📊 账户信息</h2>
            <div id="account-info">
                <p>连接钱包后显示账户信息</p>
            </div>
        </div>

        <div class="test-section">
            <h2>🌐 网络测试</h2>
            <div id="network-section">
                <p>连接钱包后显示网络信息</p>
            </div>
        </div>

        <div class="test-section">
            <h2>📝 测试日志</h2>
            <div id="test-log" class="log">等待测试开始...</div>
            <button onclick="clearLog()">清空日志</button>
        </div>
    </div>

    <script>
        class WalletTester {
            constructor() {
                this.logElement = document.getElementById('test-log')
                this.currentWallet = null
                this.testResults = {}
            }

            log(message, type = 'info') {
                const timestamp = new Date().toLocaleTimeString()
                const logEntry = `[${timestamp}] ${message}`
                console.log(logEntry)

                if (this.logElement) {
                    this.logElement.innerHTML += `<span class="${type}">${logEntry}</span>\\n`
                    this.logElement.scrollTop = this.logElement.scrollHeight
                }
            }

            async detectWallets() {
                this.log('开始检测钱包...', 'info')

                const unisatDetected = typeof window.unisat !== 'undefined'
                const okxDetected = typeof window.okxwallet !== 'undefined'

                this.log(`UniSat 钱包: ${unisatDetected ? '✅ 检测到' : '❌ 未检测到'}`,
                         unisatDetected ? 'success' : 'error')
                this.log(`OKX 钱包: ${okxDetected ? '✅ 检测到' : '❌ 未检测到'}`,
                         okxDetected ? 'success' : 'error')

                this.updateWalletStatus(unisatDetected, okxDetected)
                this.updateConnectionSection(unisatDetected, okxDetected)

                return { unisat: unisatDetected, okx: okxDetected }
            }

            updateWalletStatus(unisatDetected, okxDetected) {
                const statusDiv = document.getElementById('wallet-status')

                let html = ''

                if (unisatDetected) {
                    html += '<div class="wallet-status wallet-detected">✅ UniSat 钱包已检测到</div>'
                } else {
                    html += '<div class="wallet-status wallet-not-detected">❌ UniSat 钱包未检测到 (<a href="https://unisat.io/" target="_blank">下载</a>)</div>'
                }

                if (okxDetected) {
                    html += '<div class="wallet-status wallet-detected">✅ OKX 钱包已检测到</div>'
                } else {
                    html += '<div class="wallet-status wallet-not-detected">❌ OKX 钱包未检测到 (<a href="https://www.okx.com/web3" target="_blank">下载</a>)</div>'
                }

                if (!unisatDetected && !okxDetected) {
                    html += '<div class="wallet-status wallet-connecting">⚠️ 未检测到任何支持的钱包，请安装钱包扩展</div>'
                }

                statusDiv.innerHTML = html
            }

            updateConnectionSection(unisatDetected, okxDetected) {
                const section = document.getElementById('connection-section')

                let html = ''

                if (unisatDetected) {
                    html += '<button onclick="walletTester.testUniSatConnection()">测试 UniSat 连接</button> '
                }

                if (okxDetected) {
                    html += '<button onclick="walletTester.testOKXConnection()">测试 OKX 连接</button>'
                }

                if (!unisatDetected && !okxDetected) {
                    html = '<p>请先安装钱包扩展</p>'
                }

                section.innerHTML = html
            }

            async testUniSatConnection() {
                this.log('开始测试 UniSat 连接...', 'info')
                this.currentWallet = 'unisat'

                try {
                    // 测试连接
                    const accounts = await window.unisat.requestAccounts()
                    this.log(`✅ UniSat 连接成功，账户数量: ${accounts.length}`, 'success')

                    if (accounts.length > 0) {
                        await this.testUniSatAccountInfo(accounts[0])
                        await this.testUniSatNetwork()
                        await this.testUniSatSign()
                    }

                    this.testResults.unisat = { success: true, accounts }

                } catch (error) {
                    this.log(`❌ UniSat 连接失败: ${error.message}`, 'error')
                    this.testResults.unisat = { success: false, error: error.message }
                }
            }

            async testUniSatAccountInfo(address) {
                try {
                    this.log('获取账户信息...', 'info')

                    const publicKey = await window.unisat.getPublicKey()
                    const balance = await window.unisat.getBalance()

                    const accountInfo = {
                        address: address,
                        publicKey: publicKey,
                        balance: balance
                    }

                    this.log(`✅ 账户信息获取成功`, 'success')
                    this.updateAccountInfo(accountInfo)

                } catch (error) {
                    this.log(`❌ 获取账户信息失败: ${error.message}`, 'error')
                }
            }

            async testUniSatNetwork() {
                try {
                    this.log('获取网络信息...', 'info')

                    const network = await window.unisat.getNetwork()

                    this.log(`✅ 当前网络: ${network}`, 'success')
                    this.updateNetworkInfo(network)

                } catch (error) {
                    this.log(`❌ 获取网络信息失败: ${error.message}`, 'error')
                }
            }

            async testUniSatSign() {
                try {
                    this.log('测试消息签名...', 'info')

                    const message = 'Hello BTC-Connect Test!'
                    const signature = await window.unisat.signMessage(message)

                    this.log(`✅ 消息签名成功`, 'success')
                    this.log(`签名结果: ${signature.substring(0, 50)}...`, 'info')

                } catch (error) {
                    this.log(`❌ 消息签名失败: ${error.message}`, 'error')
                }
            }

            async testOKXConnection() {
                this.log('开始测试 OKX 连接...', 'info')
                this.currentWallet = 'okx'

                try {
                    // 测试连接
                    const accounts = await window.okxwallet.bitcoin.request({
                        method: 'btc_requestAccounts'
                    })
                    this.log(`✅ OKX 连接成功，账户数量: ${accounts.length}`, 'success')

                    if (accounts.length > 0) {
                        await this.testOKXAccountInfo(accounts[0])
                        await this.testOKXNetwork()
                        await this.testOKXSign()
                    }

                    this.testResults.okx = { success: true, accounts }

                } catch (error) {
                    this.log(`❌ OKX 连接失败: ${error.message}`, 'error')
                    this.testResults.okx = { success: false, error: error.message }
                }
            }

            async testOKXAccountInfo(address) {
                try {
                    this.log('获取账户信息...', 'info')

                    const publicKey = await window.okxwallet.bitcoin.request({
                        method: 'btc_getPublicKey'
                    })
                    const balance = await window.okxwallet.bitcoin.request({
                        method: 'btc_getBalance'
                    })

                    const accountInfo = {
                        address: address,
                        publicKey: publicKey,
                        balance: balance
                    }

                    this.log(`✅ 账户信息获取成功`, 'success')
                    this.updateAccountInfo(accountInfo)

                } catch (error) {
                    this.log(`❌ 获取账户信息失败: ${error.message}`, 'error')
                }
            }

            async testOKXNetwork() {
                try {
                    this.log('获取网络信息...', 'info')

                    const network = await window.okxwallet.bitcoin.request({
                        method: 'btc_getNetwork'
                    })

                    this.log(`✅ 当前网络: ${network}`, 'success')
                    this.updateNetworkInfo(network)

                } catch (error) {
                    this.log(`❌ 获取网络信息失败: ${error.message}`, 'error')
                }
            }

            async testOKXSign() {
                try {
                    this.log('测试消息签名...', 'info')

                    const message = 'Hello BTC-Connect Test!'
                    const signature = await window.okxwallet.bitcoin.request({
                        method: 'btc_signMessage',
                        params: [message]
                    })

                    this.log(`✅ 消息签名成功`, 'success')
                    this.log(`签名结果: ${signature.substring(0, 50)}...`, 'info')

                } catch (error) {
                    this.log(`❌ 消息签名失败: ${error.message}`, 'error')
                }
            }

            updateAccountInfo(accountInfo) {
                const infoDiv = document.getElementById('account-info')
                infoDiv.innerHTML = \`
                    <div class="account-info">
                        <strong>地址:</strong> \${accountInfo.address}<br>
                        <strong>公钥:</strong> \${accountInfo.publicKey}<br>
                        <strong>余额:</strong> \${accountInfo.balance.total} satoshis<br>
                        <strong>确认余额:</strong> \${accountInfo.balance.confirmed} satoshis<br>
                        <strong>未确认余额:</strong> \${accountInfo.balance.unconfirmed} satoshis
                    </div>
                \`
            }

            updateNetworkInfo(network) {
                const section = document.getElementById('network-section')
                section.innerHTML = \`
                    <div class="account-info">
                        <strong>当前网络:</strong> \${network}<br>
                        <button onclick="walletTester.testNetworkSwitch()">测试网络切换</button>
                    </div>
                \`
            }

            async testNetworkSwitch() {
                if (!this.currentWallet) {
                    this.log('请先连接钱包', 'warning')
                    return
                }

                const targetNetwork = this.currentWallet === 'unisat' ? 'testnet' : 'testnet'

                try {
                    this.log(\`尝试切换到 \${targetNetwork}...\`, 'info')

                    if (this.currentWallet === 'unisat') {
                        await window.unisat.switchNetwork(targetNetwork)
                    } else {
                        this.log('OKX 钱包需要手动切换网络', 'warning')
                    }

                    this.log(\`网络切换操作完成\`, 'success')

                } catch (error) {
                    this.log(\`网络切换失败: \${error.message}\`, 'error')
                }
            }

            clearLog() {
                this.logElement.innerHTML = '日志已清空...'
            }
        }

        // 初始化测试器
        const walletTester = new WalletTester()

        // 页面加载完成后自动检测钱包
        window.addEventListener('load', () => {
            setTimeout(() => {
                walletTester.detectWallets()
            }, 1000)
        })

        // 清空日志函数
        function clearLog() {
            walletTester.clearLog()
        }

        // 检测钱包函数
        function detectWallets() {
            walletTester.detectWallets()
        }
    </script>
</body>
</html>
"""

    test_file = Path("btc-connect-wallet-test.html")
    with open(test_file, "w", encoding="utf-8") as f:
        f.write(html_content)

    return test_file

def main():
    """主函数"""
    print("=== BTC-Connect 钱包连接测试工具 ===\n")

    # 创建测试HTML文件
    print("📝 创建测试页面...")
    test_file = create_test_html()
    print(f"✅ 测试页面已创建: {test_file.absolute()}")

    print("\n📋 使用说明:")
    print("1. 在浏览器中打开测试页面")
    print(f"   file://{test_file.absolute()}")
    print("2. 确保已安装 UniSat 或 OKX 钱包扩展")
    print("3. 点击相应按钮测试钱包功能")
    print("4. 查看测试日志了解详细结果")

    print("\n🔗 钱包下载:")
    print("- UniSat: https://unisat.io/")
    print("- OKX: https://www.okx.com/web3")

    print("\n⚠️  注意事项:")
    print("- 请在支持钱包扩展的浏览器中测试")
    print("- 确保钱包扩展已启用和解锁")
    print("- 测试过程中请批准钱包的连接请求")

    # 自动打开浏览器（如果可能）
    import webbrowser
    try:
        webbrowser.open(f"file://{test_file.absolute()}")
        print(f"\n🚀 已自动打开测试页面")
    except:
        print(f"\n💡 请手动在浏览器中打开: file://{test_file.absolute()}")

if __name__ == "__main__":
    main()