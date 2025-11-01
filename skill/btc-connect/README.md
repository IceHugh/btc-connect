# BTC-Connect 专业集成技能 v0.4.0

> 专为比特币 Web3 应用设计的钱包连接工具包，提供统一的连接接口、事件监听和适配层。支持 React、Vue、Next.js、Nuxt 3 项目中完整集成最新版本的 btc-connect (v0.4.0+)，实现 UniSat 和 OKX 钱包的连接、网络切换、状态管理，并解决 SSR 环境兼容性问题。

**🆕 最新特性**：
- ✅ **完整网络切换功能** (v0.3.11+)：支持主网、测试网、回归测试网
- ✅ **Vue v0.4.0+ 架构优化**：统一 API、模态框集成、全局状态管理
- ✅ **增强钱包检测机制**：20秒内每300ms轮询延迟注入
- ✅ **完整 SSR 兼容支持**：Next.js 和 Nuxt 3 详细集成方案
- ✅ **性能优化系统**：缓存机制、错误处理、连接优化

## 🚀 快速开始

### 1. 环境检查
首先检查你的项目环境：
```bash
python scripts/check_environment.py
```

### 2. 自动安装
根据项目类型自动安装相应的包：
```bash
# 自动检测项目类型并安装
python scripts/install_packages.py

# 或指定项目类型
python scripts/install_packages.py react
python scripts/install_packages.py vue
python scripts/install_packages.py nextjs
python scripts/install_packages.py nuxt3
```

### 3. 测试钱包连接
创建测试页面验证钱包功能：
```bash
python scripts/test_wallet_connection.py
```

### 4. 版本检查
确保版本兼容性：
```bash
python scripts/version_checker.py
```

## 📁 技能结构

```
btc-connect/
├── SKILL.md                    # 主要技能文档
├── README.md                   # 技能介绍和使用指南
├── skill.json                  # 技能配置文件
├── scripts/                    # 自动化脚本
│   ├── install_packages.py     # 包安装脚本
│   ├── check_environment.py    # 环境检查脚本
│   ├── test_wallet_connection.py # 钱包连接测试
│   └── version_checker.py      # 版本兼容性检查
├── references/                 # 详细文档
│   ├── api_reference.md        # 完整API文档
│   ├── framework_setup.md      # 框架配置指南
│   ├── ssr_config.md          # SSR环境配置
│   ├── network_switching.md    # 🆕 网络切换功能详解
│   ├── unisat_integration.md   # UniSat钱包集成
│   ├── okx_integration.md      # OKX钱包集成
│   └── troubleshooting.md      # 问题排查指南
└── assets/                     # 资源文件
    ├── code_examples/          # 代码示例
    │   ├── react-example.tsx
    │   ├── vue-example.vue
    │   ├── nextjs-example.tsx  # 🆕 Next.js示例
    │   └── nuxt-example.vue    # 🆕 Nuxt 3示例
    └── demo.html              # 技能演示页面
```

## 🎯 核心功能

### 🤖 自动化脚本
- **智能包安装**: 自动检测项目类型并安装最新版本的 btc-connect 包
- **环境分析**: 全面分析项目环境和集成状态，支持 SSR 检测
- **钱包测试**: 创建完整的钱包功能测试页面，包含网络切换测试
- **版本管理**: 检查版本兼容性和依赖冲突，支持最新版本验证

### 📚 完整文档
- **API参考**: 详细的API文档和使用示例，包含网络切换API
- **框架指南**: React、Vue、Next.js、Nuxt 3的配置指南
- **SSR配置**: 服务器端渲染环境的特殊配置和最佳实践
- **网络切换**: 🆕 完整的网络切换功能详解和实现方案
- **钱包集成**: UniSat和OKX钱包的详细集成方案

### 🛠️ 代码示例和模板
- **最新代码示例**: React、Vue、Next.js、Nuxt 3的完整示例代码
- **网络切换示例**: 🆕 包含网络切换功能的完整代码示例
- **SSR集成示例**: 🆕 详细的SSR环境集成代码示例
- **TypeScript配置**: 完整的TypeScript类型定义和配置

## 🔧 支持的框架和钱包

### 前端框架
- ✅ React (CSR + SSR)
- ✅ Vue 3 (CSR + SSR)
- ✅ Next.js (完整SSR支持)
- ✅ Nuxt 3 (完整SSR支持)
- ✅ 纯JavaScript项目

### 🆕 网络切换支持
- ✅ **主网 (livenet/mainnet)**: 比特币主网络
- ✅ **测试网 (testnet)**: 比特币测试网络
- ✅ **回归测试网 (regtest)**: 本地开发和测试

### 钱包支持
- ✅ **UniSat 钱包** (完全支持 + 程序化网络切换)
- ✅ **OKX 钱包** (基础支持 + 手动网络切换指导)
- ⚠️ **Xverse 钱包** (暂时禁用，等待重新激活)

### 包管理器
- ✅ Bun (推荐)
- ✅ npm
- ✅ yarn
- ✅ pnpm

## 📖 使用指南

### 🚀 版本要求
- **@btc-connect/core**: v0.4.0+ (自动安装最新版本)
- **@btc-connect/react**: v0.4.0+ (自动安装最新版本)
- **@btc-connect/vue**: v0.4.0+ (架构优化版本，自动安装最新版本)
- **Node.js**: >= 18
- **TypeScript**: >= 5.0

> **💡 安装策略**: 安装脚本自动安装最新版本，确保最低版本要求为 v0.4.0+，同时提供版本兼容性检查。

### React 项目集成 (v0.4.0+)
1. **安装依赖**: `@btc-connect/core` + `@btc-connect/react`
2. **配置Provider**: 使用 BTCWalletProvider 包装应用
3. **使用Hooks**: useWallet、useNetwork、useAccount、useAutoConnect 等
4. **网络切换**: 使用 useNetwork Hook 实现网络切换
5. **SSR配置**: 使用 'use client' 指令或动态导入

### Vue 项目集成 (v0.4.0+ 架构优化)
1. **安装依赖**: `@btc-connect/core` + `@btc-connect/vue` (v0.4.0+)
2. **配置插件**: 使用 BTCWalletPlugin
3. **🆕 统一API**: 使用 `useWallet()` 获取所有功能
4. **组件使用**: ConnectButton、WalletModal 等
5. **网络切换**: 内置网络切换功能

### Next.js SSR 配置 (完整支持)
1. **动态导入**: 钱包组件必须动态导入
2. **客户端组件**: 使用 'use client' 指令标记
3. **状态同步**: 避免SSR/客户端状态不匹配
4. **错误边界**: 配置客户端错误处理

### Nuxt 3 SSR 配置 (完整支持)
1. **客户端插件**: 创建客户端专用插件
2. **生命周期**: 使用 onMounted 确保客户端执行
3. **组件保护**: 使用 ClientOnly 组件包装
4. **运行时配置**: 配置客户端环境变量

### 🆕 网络切换功能 (v0.3.11+)
```typescript
// React Hook
const { network, switchNetwork } = useNetwork()
await switchNetwork('testnet') // 切换到测试网

// Vue Composable
const { network, switchNetwork } = useNetwork()
await switchNetwork('mainnet') // 切换到主网
```

## 🔍 常见问题解决

### 🔗 连接问题
- **钱包检测失败**: 检查钱包是否正确安装和启用
- **延迟注入处理**: 🆕 使用增强检测机制（20秒内每300ms轮询）
- **用户取消连接**: 正确处理用户取消连接的情况
- **网络权限**: 确保钱包有权限访问目标网络

### 🌐 SSR 问题
- **动态导入**: 使用动态导入避免服务端错误
- **Window对象**: 检查window对象的可用性
- **状态同步**: 处理SSR/客户端状态不匹配问题
- **客户端插件**: 在Nuxt 3中使用客户端专用插件

### 📦 版本兼容性问题
- **版本匹配**: 安装脚本自动选择最新版本，确保最低版本要求（core v0.4.0+, vue v0.4.0+）
- **版本检查**: 脚本会验证安装版本并提供兼容性建议
- **API变更**: 🆕 注意v0.4.0+ Vue包的架构变化
- **类型定义**: 配置正确的TypeScript类型
- **依赖冲突**: 检查是否存在依赖版本冲突

### ⚡ 性能问题
- **缓存系统**: 🆕 利用智能缓存提升性能
- **连接优化**: 避免不必要的重复连接
- **事件管理**: 正确清理事件监听器
- **内存泄漏**: 检查组件卸载时的资源清理

### 🔄 网络切换问题
- **UniSat钱包**: 完全支持程序化网络切换
- **OKX钱包**: 需要用户手动在钱包中切换网络
- **网络状态**: 正确处理网络状态变化事件
- **切换失败**: 提供详细的错误信息和用户指导

## 🎨 特色功能

### 🧠 智能环境检测
- 自动识别项目类型和框架（React、Vue、Next.js、Nuxt 3）
- 检测已安装的包和配置，识别版本兼容性
- 🆕 分析SSR环境设置和网络切换支持
- 提供详细的诊断报告和修复建议

### ⚡ 一键式安装
- 根据项目类型自动选择合适的包版本
- 支持多种包管理器（Bun、npm、yarn、pnpm）
- 验证安装结果和版本兼容性
- 🆕 自动解决常见的依赖冲突和版本问题

### 🧪 完整的测试支持
- 创建功能完整的测试页面
- 🆕 支持钱包连接、签名、网络切换完整测试
- 实时状态显示和错误处理
- 详细的测试日志和性能指标

### 📚 详细的文档和示例
- 完整的API参考文档，包含网络切换API
- 分步骤的集成指南和最佳实践
- 🆕 丰富的代码示例（React、Vue、Next.js、Nuxt 3）
- 常见问题解决方案和故障排除指南

## 🚀 快速体验

1. **📖 查看演示页面**: 打开 `assets/demo.html` 了解技能功能
2. **🔍 运行环境检查**: `python scripts/check_environment.py`
3. **📦 自动安装包**: `python scripts/install_packages.py`
4. **🧪 测试钱包功能**: `python scripts/test_wallet_connection.py`
5. **📋 版本兼容性检查**: `python scripts/version_checker.py`
6. **📚 查看详细文档**: `references/` 目录下的各种指南

## 📈 最佳实践建议

### 🎯 开发流程
1. **环境准备**: 确保Node.js >= 18，推荐使用Bun包管理器
2. **版本选择**: 使用安装脚本自动安装最新版本（最低要求v0.4.0+）
3. **框架配置**: 根据框架类型选择合适的集成方案
4. **SSR配置**: 在SSR项目中正确配置客户端组件
5. **网络切换**: 为不同钱包提供合适的网络切换体验
6. **测试验证**: 运行完整的功能测试确保一切正常

### 🔒 安全性考虑
- 验证钱包连接和交易请求的安全性
- 实现完整的错误处理和用户反馈机制
- 正确处理敏感信息和私钥
- 使用HTTPS协议保护通信安全

## 🤝 贡献指南

欢迎提交问题和改进建议！

### 🛠️ 技能使用流程
1. 运行环境检查脚本，确保开发环境就绪
2. 使用自动安装脚本安装最新版本的包
3. 根据框架配置指南进行项目设置
4. 集成钱包功能和网络切换特性
5. 运行测试验证功能和性能
6. 查看问题排查指南解决疑难杂症

这个技能为btc-connect的集成提供了完整的解决方案，让你能够快速、可靠地在各种项目中集成比特币钱包功能，包括最新的网络切换特性和架构优化。