import { BTCWalletManager } from '@btc-connect/core';

class WalletManager {
  constructor() {
    this.manager = new BTCWalletManager({
      onError: (error) => console.error('Wallet error:', error),
      onStateChange: (state) => console.log('State changed:', state),
    });

    this.setupEventListeners();
    this.initializeUI();
  }

  setupEventListeners() {
    this.manager.on('connect', (accounts) => {
      console.log('钱包已连接:', accounts);
      this.updateUI(accounts[0]);
    });

    this.manager.on('disconnect', () => {
      console.log('钱包已断开');
      this.updateUI(null);
    });

    this.manager.on('networkChange', ({ network }) => {
      console.log('网络已变更:', network);
      this.updateNetworkUI(network);
    });

    this.manager.on('accountChange', (accounts) => {
      console.log('账户已变更:', accounts);
      if (accounts.length > 0) {
        this.updateUI(accounts[0]);
      } else {
        this.updateUI(null);
      }
    });
  }

  initializeUI() {
    // 连接按钮
    const connectBtn = document.getElementById('connect-btn');
    if (connectBtn) {
      connectBtn.addEventListener('click', () => this.handleConnect());
    }

    // UniSat 连接按钮
    const unisatBtn = document.getElementById('unisat-btn');
    if (unisatBtn) {
      unisatBtn.addEventListener('click', () => this.handleConnect('unisat'));
    }

    // OKX 连接按钮
    const okxBtn = document.getElementById('okx-btn');
    if (okxBtn) {
      okxBtn.addEventListener('click', () => this.handleConnect('okx'));
    }

    // 断开连接按钮
    const disconnectBtn = document.getElementById('disconnect-btn');
    if (disconnectBtn) {
      disconnectBtn.addEventListener('click', () => this.handleDisconnect());
    }

    // 网络切换按钮
    const switchToMainnetBtn = document.getElementById('switch-mainnet');
    if (switchToMainnetBtn) {
      switchToMainnetBtn.addEventListener('click', () =>
        this.switchNetwork('livenet'),
      );
    }

    const switchToTestnetBtn = document.getElementById('switch-testnet');
    if (switchToTestnetBtn) {
      switchToTestnetBtn.addEventListener('click', () =>
        this.switchNetwork('testnet'),
      );
    }

    // 刷新余额按钮
    const refreshBalanceBtn = document.getElementById('refresh-balance');
    if (refreshBalanceBtn) {
      refreshBalanceBtn.addEventListener('click', () => this.refreshBalance());
    }

    // 消息签名
    const signMessageBtn = document.getElementById('sign-message');
    if (signMessageBtn) {
      signMessageBtn.addEventListener('click', () => this.signMessage());
    }

    // 检测钱包按钮
    const detectWalletsBtn = document.getElementById('detect-wallets');
    if (detectWalletsBtn) {
      detectWalletsBtn.addEventListener('click', () => this.detectWallets());
    }

    // 初始化时检测钱包
    this.detectWallets();
  }

  async detectWallets() {
    console.log('检测可用钱包...');

    const availableWallets = this.manager.getAvailableWallets();
    const walletStatusDiv = document.getElementById('wallet-status');

    if (walletStatusDiv) {
      if (availableWallets.length === 0) {
        walletStatusDiv.innerHTML = `
          <div class="status-message warning">
            ⚠️ 未检测到可用钱包，请安装 UniSat 或 OKX 钱包扩展
          </div>
        `;
      } else {
        const walletList = availableWallets
          .map(
            (wallet) =>
              `<div class="wallet-item">✅ ${wallet.name} (${wallet.id})</div>`,
          )
          .join('');

        walletStatusDiv.innerHTML = `
          <div class="status-message success">
            检测到 ${availableWallets.length} 个可用钱包:
          </div>
          ${walletList}
        `;
      }
    }
  }

  async handleConnect(walletId = null) {
    try {
      this.showLoading(true);

      let accounts;
      if (walletId) {
        // 连接指定钱包
        accounts = await this.manager.connect(walletId);
      } else {
        // 自动检测并连接第一个可用钱包
        const availableWallets = this.manager.getAvailableWallets();

        if (availableWallets.length === 0) {
          alert('没有检测到可用的钱包，请安装 UniSat 或 OKX 钱包');
          return;
        }

        // 简单示例：使用第一个可用钱包
        const selectedWallet = availableWallets[0];
        console.log(`连接到钱包: ${selectedWallet.name}`);
        accounts = await this.manager.connect(selectedWallet.id);
      }

      console.log('连接成功:', accounts);
      this.showMessage('钱包连接成功！', 'success');
    } catch (error) {
      console.error('连接失败:', error);

      let errorMessage = '连接失败';
      if (error.message.includes('User rejected')) {
        errorMessage = '用户取消了连接请求';
      } else if (error.message.includes('not found')) {
        errorMessage = '未找到钱包，请确保钱包扩展已安装并启用';
      }

      this.showMessage(errorMessage, 'error');
    } finally {
      this.showLoading(false);
    }
  }

  async handleDisconnect() {
    try {
      await this.manager.disconnect();
      this.showMessage('钱包已断开连接', 'info');
    } catch (error) {
      console.error('断开连接失败:', error);
      this.showMessage('断开连接失败', 'error');
    }
  }

  async switchNetwork(network) {
    try {
      await this.manager.switchNetwork(network);
      this.showMessage(
        `已切换到${network === 'livenet' ? '主网' : '测试网'}`,
        'success',
      );
    } catch (error) {
      console.error('网络切换失败:', error);

      if (error.message.includes('not supported')) {
        this.showMessage(
          '该钱包不支持程序化网络切换，请手动在钱包中切换',
          'warning',
        );
      } else {
        this.showMessage(`网络切换失败: ${error.message}`, 'error');
      }
    }
  }

  async refreshBalance() {
    try {
      const currentAccount = this.manager.getCurrentAccount();
      if (!currentAccount) {
        this.showMessage('请先连接钱包', 'warning');
        return;
      }

      this.showLoading(true, '刷新余额中...');

      // 这里应该通过相应的适配器获取余额
      // 由于btc-connect core可能不直接提供获取余额的方法，
      // 这里需要根据具体钱包适配器来实现
      console.log('刷新余额功能需要根据具体钱包适配器实现');

      this.showMessage('余额刷新功能需要根据具体钱包适配器实现', 'info');
    } catch (error) {
      console.error('刷新余额失败:', error);
      this.showMessage('刷新余额失败', 'error');
    } finally {
      this.showLoading(false);
    }
  }

  async signMessage() {
    try {
      const messageInput = document.getElementById('message-input');
      const message = messageInput ? messageInput.value : 'Hello, Bitcoin!';

      const currentAdapter = this.manager.getCurrentAdapter();
      if (!currentAdapter) {
        this.showMessage('请先连接钱包', 'warning');
        return;
      }

      this.showLoading(true, '签名中...');

      const signature = await currentAdapter.signMessage(message);

      console.log('签名成功:', signature);

      // 显示签名结果
      const signatureResult = document.getElementById('signature-result');
      if (signatureResult) {
        signatureResult.textContent = signature;
        signatureResult.style.display = 'block';
      }

      this.showMessage('消息签名成功！', 'success');
    } catch (error) {
      console.error('签名失败:', error);
      this.showMessage(`签名失败: ${error.message}`, 'error');
    } finally {
      this.showLoading(false);
    }
  }

  updateUI(account) {
    const addressDisplay = document.getElementById('address-display');
    const publicKeyDisplay = document.getElementById('publickey-display');
    const connectSection = document.getElementById('connect-section');
    const accountSection = document.getElementById('account-section');

    if (account) {
      if (addressDisplay) {
        addressDisplay.textContent = account.address;
      }

      if (publicKeyDisplay && account.publicKey) {
        publicKeyDisplay.textContent = account.publicKey;
      }

      if (connectSection) {
        connectSection.style.display = 'none';
      }

      if (accountSection) {
        accountSection.style.display = 'block';
      }
    } else {
      if (addressDisplay) {
        addressDisplay.textContent = '';
      }

      if (publicKeyDisplay) {
        publicKeyDisplay.textContent = '';
      }

      if (connectSection) {
        connectSection.style.display = 'block';
      }

      if (accountSection) {
        accountSection.style.display = 'none';
      }

      // 隐藏签名结果
      const signatureResult = document.getElementById('signature-result');
      if (signatureResult) {
        signatureResult.style.display = 'none';
      }
    }
  }

  updateNetworkUI(network) {
    const networkDisplay = document.getElementById('network-display');
    if (networkDisplay) {
      networkDisplay.textContent = network === 'livenet' ? '主网' : '测试网';
    }
  }

  showLoading(show, message = '处理中...') {
    const loadingDiv = document.getElementById('loading');
    if (loadingDiv) {
      if (show) {
        loadingDiv.textContent = message;
        loadingDiv.style.display = 'block';
      } else {
        loadingDiv.style.display = 'none';
      }
    }

    // 禁用/启用按钮
    const buttons = document.querySelectorAll('button');
    buttons.forEach((btn) => {
      btn.disabled = show;
    });
  }

  showMessage(message, type = 'info') {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
      messageDiv.textContent = message;
      messageDiv.className = `message ${type}`;
      messageDiv.style.display = 'block';

      // 3秒后自动隐藏消息
      setTimeout(() => {
        messageDiv.style.display = 'none';
      }, 3000);
    }

    console.log(`[${type.toUpperCase()}] ${message}`);
  }
}

// 初始化钱包管理器
const walletManager = new WalletManager();

// 导出供其他模块使用
export default walletManager;

// 如果直接运行此脚本，添加一些全局函数供HTML调用
if (typeof window !== 'undefined') {
  window.walletManager = walletManager;

  // 提供全局函数
  window.connectWallet = (walletId) => walletManager.handleConnect(walletId);
  window.disconnectWallet = () => walletManager.handleDisconnect();
  window.switchNetwork = (network) => walletManager.switchNetwork(network);
  window.refreshBalance = () => walletManager.refreshBalance();
  window.signMessage = () => walletManager.signMessage();
  window.detectWallets = () => walletManager.detectWallets();
}
