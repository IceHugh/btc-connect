'use client';

import {
  useBalance,
  useConnectWallet,
  useNetwork,
  useRefreshAccountInfo,
  useSignature,
  useTransactions,
  useWallet,
  useWalletEvent,
  useWalletModal,
  WalletModal,
} from '@btc-connect/react';
import { useCallback, useState } from 'react';

export function WalletTestSuite() {
  const [logs, setLogs] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<Record<string, string>>({});

  // 钱包状态
  const {
    status,
    accounts,
    currentAccount,
    network,
    error,
    isConnected,
    isConnecting,
    address,
    balance,
    publicKey,
  } = useWallet();
  const { connect, disconnect, switchWallet, availableWallets } =
    useConnectWallet();
  const { openModal, isModalOpen } = useWalletModal();
  const { network: currentNetwork, switchNetwork } = useNetwork();
  const { balance: balanceInfo } = useBalance();
  const { signMessage, signPsbt } = useSignature();
  const { sendBitcoin } = useTransactions();
  const { refreshAccountInfo } = useRefreshAccountInfo();

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev.slice(-9), `${timestamp}: ${message}`]);
  }, []);

  const addTestResult = useCallback(
    (test: string, result: string) => {
      setTestResults((prev) => ({ ...prev, [test]: result }));
      addLog(`${test}: ${result}`);
    },
    [addLog],
  );

  // 监听钱包事件
  useWalletEvent('connect', (accounts) => {
    addLog(`钱包已连接，账户数量: ${accounts.length}`);
  });

  useWalletEvent('disconnect', () => {
    addLog('钱包已断开连接');
  });

  useWalletEvent('accountChange', (accounts) => {
    addLog(`账户已变更，新账户数量: ${accounts.length}`);
  });

  useWalletEvent('networkChange', (network) => {
    addLog(`网络已切换到: ${network}`);
  });

  // 基础连接测试
  const testConnection = useCallback(async () => {
    try {
      addTestResult('连接测试', '开始连接...');
      if (!isConnected) {
        await connect('unisat');
        addTestResult('连接测试', '✅ 连接成功');
      } else {
        addTestResult('连接测试', 'ℹ️ 已经连接');
      }
    } catch (error) {
      addTestResult(
        '连接测试',
        `❌ 连接失败: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }, [connect, isConnected, addTestResult]);

  // 账户信息测试
  const testAccounts = useCallback(async () => {
    try {
      addTestResult('账户测试', '获取账户信息...');
      if (!isConnected) {
        addTestResult('账户测试', '❌ 请先连接钱包');
        return;
      }

      // 先刷新账户信息
      addTestResult('账户刷新', '🔄 正在刷新账户信息...');
      await refreshAccountInfo();
      addTestResult('账户刷新', '✅ 账户信息刷新完成');

      // 等待一下让状态更新
      await new Promise((resolve) => setTimeout(resolve, 500));

      addTestResult('账户测试', `✅ 账户数量: ${accounts.length}`);
      addTestResult('当前账户', `✅ 地址: ${address || '无'}`);
      addTestResult('公钥测试', `✅ 公钥: ${publicKey ? '已获取' : '未获取'}`);
    } catch (error) {
      addTestResult(
        '账户测试',
        `❌ 账户测试失败: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }, [
    accounts,
    address,
    publicKey,
    isConnected,
    addTestResult,
    refreshAccountInfo,
  ]);

  // 余额测试
  const testBalance = useCallback(async () => {
    try {
      addTestResult('余额测试', '获取余额信息...');
      if (!isConnected) {
        addTestResult('余额测试', '❌ 请先连接钱包');
        return;
      }

      // 先刷新账户信息
      addTestResult('余额刷新', '🔄 正在刷新余额信息...');
      await refreshAccountInfo();
      addTestResult('余额刷新', '✅ 余额信息刷新完成');

      // 等待一下让状态更新
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (balanceInfo) {
        addTestResult(
          '余额测试',
          `✅ 已确认: ${balanceInfo.confirmedBalance || 0} BTC`,
        );
        addTestResult(
          '未确认余额',
          `✅ 未确认: ${balanceInfo.unconfirmedBalance || 0} BTC`,
        );
        addTestResult(
          '总余额',
          `✅ 总计: ${balanceInfo.totalBalance || 0} BTC`,
        );
      } else {
        addTestResult('余额测试', 'ℹ️ 余额信息为空');
      }
    } catch (error) {
      addTestResult(
        '余额测试',
        `❌ 余额测试失败: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }, [balanceInfo, isConnected, addTestResult, refreshAccountInfo]);

  // 网络测试
  const testNetwork = useCallback(async () => {
    try {
      addTestResult('网络测试', '获取网络信息...');
      if (!isConnected) {
        addTestResult('网络测试', '❌ 请先连接钱包');
        return;
      }

      addTestResult('当前网络', `✅ 当前网络: ${currentNetwork || '未知'}`);

      // 尝试切换到测试网
      if (currentNetwork !== 'testnet') {
        try {
          await switchNetwork('testnet');
          addTestResult('网络切换', '✅ 已切换到测试网');
        } catch (error) {
          addTestResult(
            '网络切换',
            `ℹ️ 切换失败（可能不支持）: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }
    } catch (error) {
      addTestResult(
        '网络测试',
        `❌ 网络测试失败: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }, [currentNetwork, switchNetwork, isConnected, addTestResult]);

  // 签名测试
  const testSignature = useCallback(async () => {
    try {
      addTestResult('签名测试', '开始消息签名测试...');
      if (!isConnected) {
        addTestResult('签名测试', '❌ 请先连接钱包');
        return;
      }

      const testMessage = `BTC Connect 测试消息 - ${new Date().toISOString()}`;
      const signature = await signMessage(testMessage);
      addTestResult('消息签名', `✅ 签名成功，长度: ${signature.length}`);
      addTestResult('签名内容', `✅ 签名: ${signature.substring(0, 20)}...`);
    } catch (error) {
      addTestResult(
        '消息签名',
        `❌ 签名失败: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }, [signMessage, isConnected, addTestResult]);

  // PSBT签名测试
  const testPsbtSignature = useCallback(async () => {
    try {
      addTestResult('PSBT签名测试', '开始PSBT签名测试...');
      if (!isConnected) {
        addTestResult('PSBT签名测试', '❌ 请先连接钱包');
        return;
      }

      // 这是一个示例PSBT（实际使用中需要真实的PSBT数据）
      const testPsbt =
        'cHNldP8BAHUCAAAAASaBcTce3u7JuyxvGB1J9nGQk8jKtzQZpq7a8C7m3COAAAAAAD/////////aLKkAAAAAABYAFOvsZAAAAGXapLMCqJDB9CGVMhKbTRV4F5bGpBAAAAAP7///8CYFvKAAAAFgAUk7d6Jq6FqAQVIRsJhvLZd8vnLWbAAAAABYAFOvsZAAAAGXapLMCqJDB9CGVMhKbTRV4F5bGpBAAAAAAAAAAAAAQAEAQIAAAAAACIAIBIkCrVlAVrLAmK0opVb6L7aZujhY1h0cW00Uz9lqJ8AAAAAABYAFMr+kKqT4QGZjwQdS0R3g7Aq1yvVbIgMEQIEAhgAgL7YQAAAAAAiAgL5Q7VdWRa4Q7rTKQOxIVaYjqmzZ1JR7c8qJpgA4AAAAAAAABgUT';

      const signedPsbt = await signPsbt(testPsbt);
      addTestResult('PSBT签名', `✅ PSBT签名成功，长度: ${signedPsbt.length}`);
    } catch (error) {
      addTestResult(
        'PSBT签名',
        `❌ PSBT签名失败: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }, [signPsbt, isConnected, addTestResult]);

  // 交易测试（发送比特币）
  const testTransaction = useCallback(async () => {
    try {
      addTestResult('交易测试', '开始发送比特币测试...');
      if (!isConnected) {
        addTestResult('交易测试', '❌ 请先连接钱包');
        return;
      }

      // 这是一个示例地址（测试用，实际使用中需要真实地址）
      const testAddress = 'tb1qxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
      const testAmount = 0.00001; // 1000 satoshis

      addTestResult(
        '交易测试',
        `ℹ️ 准备发送 ${testAmount} BTC 到 ${testAddress}`,
      );
      addTestResult('交易测试', '⚠️ 这是一个演示，不会实际发送交易');

      // 在实际应用中取消下面的注释来执行真实交易
      // const txId = await sendBitcoin(testAddress, testAmount);
      // addTestResult('发送比特币', `✅ 交易已发送，TXID: ${txId}`);
    } catch (error) {
      addTestResult(
        '交易测试',
        `❌ 交易测试失败: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }, [isConnected, addTestResult]);

  // 模态框测试
  const testModal = useCallback(() => {
    try {
      if (isModalOpen) {
        addTestResult('模态框测试', 'ℹ️ 模态框已打开');
      } else {
        openModal();
        addTestResult('模态框测试', '✅ 模态框已打开');
      }
    } catch (error) {
      addTestResult(
        '模态框测试',
        `❌ 模态框测试失败: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }, [openModal, isModalOpen, addTestResult]);

  // 钱包切换测试
  const testWalletSwitch = useCallback(async () => {
    try {
      addTestResult('钱包切换测试', '获取可用钱包...');

      const otherWallets = availableWallets.filter(
        (w) => !w.id.includes(currentAccount?.address || ''),
      );
      if (otherWallets.length > 0) {
        const targetWallet = otherWallets[0];
        await switchWallet(targetWallet.id);
        addTestResult('钱包切换', `✅ 已切换到: ${targetWallet.name}`);
      } else {
        addTestResult('钱包切换', 'ℹ️ 没有其他可用的钱包');
      }
    } catch (error) {
      addTestResult(
        '钱包切换测试',
        `❌ 钱包切换失败: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }, [availableWallets, switchWallet, currentAccount, addTestResult]);

  // 刷新账户信息测试
  const testRefresh = useCallback(async () => {
    try {
      addTestResult('刷新测试', '开始刷新账户信息...');
      if (!isConnected) {
        addTestResult('刷新测试', '❌ 请先连接钱包');
        return;
      }

      await refreshAccountInfo();
      addTestResult('刷新测试', '✅ 账户信息刷新成功');

      // 等待状态更新
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 检查刷新后的状态
      if (publicKey) {
        addTestResult('刷新后公钥', '✅ 公钥已获取');
      } else {
        addTestResult('刷新后公钥', '❌ 公钥仍未获取');
      }

      if (balanceInfo) {
        addTestResult('刷新后余额', '✅ 余额已获取');
      } else {
        addTestResult('刷新后余额', '❌ 余额仍未获取');
      }
    } catch (error) {
      addTestResult(
        '刷新测试',
        `❌ 刷新失败: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }, [isConnected, refreshAccountInfo, addTestResult, publicKey, balanceInfo]);

  // 断开连接测试
  const testDisconnection = useCallback(async () => {
    try {
      addTestResult('断开测试', '开始断开连接...');
      if (isConnected) {
        await disconnect();
        addTestResult('断开测试', '✅ 已断开连接');
      } else {
        addTestResult('断开测试', 'ℹ️ 钱包未连接');
      }
    } catch (error) {
      addTestResult(
        '断开测试',
        `❌ 断开连接失败: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }, [disconnect, isConnected, addTestResult]);

  // 运行所有测试
  const runAllTests = useCallback(async () => {
    addLog('🚀 开始运行完整测试套件...');

    // 按顺序执行测试
    await testConnection();
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await testAccounts();
    await new Promise((resolve) => setTimeout(resolve, 500));

    await testBalance();
    await new Promise((resolve) => setTimeout(resolve, 500));

    await testNetwork();
    await new Promise((resolve) => setTimeout(resolve, 500));

    await testSignature();
    await new Promise((resolve) => setTimeout(resolve, 500));

    await testPsbtSignature();
    await new Promise((resolve) => setTimeout(resolve, 500));

    await testTransaction();
    await new Promise((resolve) => setTimeout(resolve, 500));

    testModal();
    await new Promise((resolve) => setTimeout(resolve, 500));

    await testWalletSwitch();

    addLog('✅ 测试套件执行完成！');
  }, [
    testConnection,
    testAccounts,
    testBalance,
    testNetwork,
    testSignature,
    testPsbtSignature,
    testTransaction,
    testModal,
    testWalletSwitch,
    addLog,
  ]);

  // 清除日志
  const clearLogs = useCallback(() => {
    setLogs([]);
    setTestResults({});
    addLog('📝 日志已清除');
  }, [addLog]);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1
        style={{ textAlign: 'center', marginBottom: '30px', color: '#f7931a' }}
      >
        🔗 BTC Connect 完整测试套件
      </h1>

      {/* 状态概览 */}
      <div
        style={{
          backgroundColor: '#ffffff',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '30px',
          border: '2px solid #f7931a',
          boxShadow: '0 4px 12px rgba(247, 147, 26, 0.15)',
        }}
      >
        <h3
          style={{
            marginTop: 0,
            color: '#212529',
            fontSize: '18px',
            fontWeight: 'bold',
          }}
        >
          📊 钱包状态概览
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '10px',
            marginTop: '15px',
          }}
        >
          <div style={{ color: '#495057' }}>
            <strong style={{ color: '#212529' }}>连接状态:</strong>{' '}
            {isConnecting
              ? '连接中...'
              : isConnected
                ? '✅ 已连接'
                : '❌ 未连接'}
          </div>
          <div style={{ color: '#495057' }}>
            <strong style={{ color: '#212529' }}>当前钱包:</strong>{' '}
            {availableWallets.find((w) =>
              w.id.includes(currentAccount?.address || ''),
            )?.name || '未知'}
          </div>
          <div style={{ color: '#495057' }}>
            <strong style={{ color: '#212529' }}>账户数量:</strong>{' '}
            {accounts.length}
          </div>
          <div style={{ color: '#495057' }}>
            <strong style={{ color: '#212529' }}>当前地址:</strong>{' '}
            {address || '无'}
          </div>
          <div style={{ color: '#495057' }}>
            <strong style={{ color: '#212529' }}>当前网络:</strong>{' '}
            {currentNetwork || '未知'}
          </div>
          <div style={{ color: '#495057' }}>
            <strong style={{ color: '#212529' }}>余额:</strong>{' '}
            {balanceInfo ? `${balanceInfo.totalBalance} BTC` : '未知'}
          </div>
        </div>
        {error && (
          <div
            style={{
              color: '#dc3545',
              marginTop: '10px',
              backgroundColor: '#f8d7da',
              padding: '10px',
              borderRadius: '4px',
            }}
          >
            <strong>错误:</strong> {error.message}
          </div>
        )}
      </div>

      {/* 控制按钮 */}
      <div style={{ marginBottom: '30px' }}>
        <h3
          style={{
            color: '#212529',
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: '15px',
          }}
        >
          🎮 测试控制
        </h3>
        <div
          style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            marginBottom: '15px',
          }}
        >
          <button
            onClick={runAllTests}
            style={{
              padding: '12px 24px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              boxShadow: '0 2px 4px rgba(40, 167, 69, 0.3)',
              transition: 'all 0.2s ease',
            }}
          >
            🚀 运行所有测试
          </button>
          <button
            onClick={clearLogs}
            style={{
              padding: '12px 24px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              boxShadow: '0 2px 4px rgba(108, 117, 125, 0.3)',
              transition: 'all 0.2s ease',
            }}
          >
            🗑️ 清除日志
          </button>
          <button
            onClick={openModal}
            style={{
              padding: '12px 24px',
              backgroundColor: '#f7931a',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              boxShadow: '0 2px 4px rgba(247, 147, 26, 0.3)',
              transition: 'all 0.2s ease',
            }}
          >
            🔗 打开钱包选择器
          </button>
        </div>
      </div>

      {/* 测试按钮网格 */}
      <div style={{ marginBottom: '30px' }}>
        <h3
          style={{
            color: '#212529',
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: '15px',
          }}
        >
          🧪 单项测试
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          <button onClick={testConnection} style={testButtonStyle}>
            🔗 连接测试
          </button>
          <button onClick={testAccounts} style={testButtonStyle}>
            👤 账户信息测试
          </button>
          <button onClick={testBalance} style={testButtonStyle}>
            💰 余额测试
          </button>
          <button onClick={testRefresh} style={testButtonStyle}>
            🔄 刷新账户信息
          </button>
          <button onClick={testNetwork} style={testButtonStyle}>
            🌐 网络测试
          </button>
          <button onClick={testSignature} style={testButtonStyle}>
            ✍️ 消息签名测试
          </button>
          <button onClick={testPsbtSignature} style={testButtonStyle}>
            📝 PSBT签名测试
          </button>
          <button onClick={testTransaction} style={testButtonStyle}>
            📤 交易测试
          </button>
          <button onClick={testModal} style={testButtonStyle}>
            🪟 模态框测试
          </button>
          <button onClick={testWalletSwitch} style={testButtonStyle}>
            🔄 钱包切换测试
          </button>
          <button onClick={testDisconnection} style={testButtonStyle}>
            ❌ 断开连接测试
          </button>
        </div>
      </div>

      {/* 测试结果 */}
      {Object.keys(testResults).length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h3
            style={{ color: '#212529', fontSize: '18px', fontWeight: 'bold' }}
          >
            📈 测试结果
          </h3>
          <div
            style={{
              backgroundColor: '#ffffff',
              padding: '15px',
              borderRadius: '8px',
              border: '2px solid #28a745',
              boxShadow: '0 4px 12px rgba(40, 167, 69, 0.15)',
              fontFamily: 'monospace',
              fontSize: '14px',
            }}
          >
            {Object.entries(testResults).map(([test, result]) => (
              <div key={test} style={{ marginBottom: '5px', color: '#212529' }}>
                <strong style={{ color: '#495057' }}>{test}:</strong>{' '}
                <span
                  style={{
                    color: result.includes('✅')
                      ? '#28a745'
                      : result.includes('❌')
                        ? '#dc3545'
                        : '#007bff',
                  }}
                >
                  {result}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 实时日志 */}
      <div>
        <h3
          style={{
            color: '#212529',
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: '15px',
          }}
        >
          📝 实时日志
        </h3>
        <div
          style={{
            backgroundColor: '#212529',
            color: '#f8f9fa',
            padding: '15px',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '13px',
            height: '300px',
            overflowY: 'auto',
            border: '1px solid #495057',
          }}
        >
          {logs.length === 0 ? (
            <div style={{ color: '#6c757d', fontStyle: 'italic' }}>
              等待测试开始...
            </div>
          ) : (
            logs.map((log, index) => (
              <div key={index} style={{ marginBottom: '3px' }}>
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 说明信息 */}
      <div
        style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          marginTop: '30px',
          border: '2px solid #007bff',
          boxShadow: '0 4px 12px rgba(0, 123, 255, 0.15)',
        }}
      >
        <h4
          style={{
            marginTop: 0,
            color: '#212529',
            fontSize: '18px',
            fontWeight: 'bold',
          }}
        >
          ℹ️ 测试说明
        </h4>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '15px',
            marginTop: '15px',
          }}
        >
          <div>
            <p
              style={{
                color: '#495057',
                fontWeight: 'bold',
                marginBottom: '10px',
              }}
            >
              基础功能:
            </p>
            <ul
              style={{
                marginLeft: '20px',
                lineHeight: '1.6',
                color: '#212529',
              }}
            >
              <li>
                🔗 <strong style={{ color: '#007bff' }}>连接测试:</strong>{' '}
                测试钱包连接功能
              </li>
              <li>
                👤 <strong style={{ color: '#007bff' }}>账户测试:</strong>{' '}
                获取账户信息和公钥
              </li>
              <li>
                💰 <strong style={{ color: '#007bff' }}>余额测试:</strong>{' '}
                获取已确认和未确认余额
              </li>
              <li>
                🌐 <strong style={{ color: '#007bff' }}>网络测试:</strong>{' '}
                获取当前网络并尝试切换
              </li>
            </ul>
          </div>
          <div>
            <p
              style={{
                color: '#495057',
                fontWeight: 'bold',
                marginBottom: '10px',
              }}
            >
              高级功能:
            </p>
            <ul
              style={{
                marginLeft: '20px',
                lineHeight: '1.6',
                color: '#212529',
              }}
            >
              <li>
                ✍️ <strong style={{ color: '#007bff' }}>消息签名:</strong>{' '}
                测试消息签名功能
              </li>
              <li>
                📝 <strong style={{ color: '#007bff' }}>PSBT签名:</strong>{' '}
                测试PSBT功能
              </li>
              <li>
                📤 <strong style={{ color: '#007bff' }}>交易测试:</strong>{' '}
                演示比特币发送功能
              </li>
              <li>
                🔄 <strong style={{ color: '#007bff' }}>钱包切换:</strong>{' '}
                测试在不同钱包间切换
              </li>
            </ul>
          </div>
        </div>
        <div
          style={{
            marginTop: '15px',
            padding: '10px',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '4px',
          }}
        >
          <p style={{ marginBottom: 0, color: '#856404', fontSize: '14px' }}>
            <strong>⚠️ 注意:</strong>{' '}
            某些功能可能需要特定的钱包支持。测试前请确保已安装并启用相应的比特币钱包扩展。
          </p>
        </div>
      </div>

      {/* 全局模态框 */}
      <WalletModal />
    </div>
  );
}

const testButtonStyle = {
  padding: '12px 16px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '14px',
  transition: 'background-color 0.2s',
};
