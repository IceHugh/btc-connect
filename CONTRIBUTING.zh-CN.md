# 为 BTC Connect 做贡献

感谢您对 BTC Connect 项目的关注！本指南将帮助您开始为项目做贡献。

## 📋 目录

- [开始之前](#开始之前)
- [开发环境设置](#开发环境设置)
- [项目结构](#项目结构)
- [开发工作流](#开发工作流)
- [代码规范](#代码规范)
- [测试指南](#测试指南)
- [文档编写](#文档编写)
- [提交更改](#提交更改)
- [发布流程](#发布流程)

## 🚀 开始之前

### 环境要求

在开始贡献之前，请确保已安装以下工具：

- **Node.js** >= 18.0.0
- **Bun** >= 1.0.0
- **Git**（最新版本）
- 支持 TypeScript 的代码编辑器（推荐：VS Code）

### 必备知识

- TypeScript（严格模式）
- React 18+（React 包开发）
- Vue 3+（Vue 包开发）
- 比特币钱包概念
- 现代 JavaScript（ES2022+）

## 🛠️ 开发环境设置

### 1. Fork 和克隆

```bash
# 在 GitHub 上 Fork 仓库，然后克隆你的 Fork
git clone https://github.com/YOUR_USERNAME/btc-connect.git
cd btc-connect

# 添加原始仓库作为 upstream
git remote add upstream https://github.com/IceHugh/btc-connect.git
```

### 2. 安装依赖

```bash
# 安装所有包的依赖
bun install

# 构建所有包
bun run build

# 运行测试确保一切正常
bun test
```

### 3. 开发模式

```bash
# 启动所有包的开发模式
bun dev

# 或开发特定包
cd packages/core && bun run dev
cd packages/react && bun run dev
cd packages/vue && bun run dev
```

## 📁 项目结构

```
btc-connect/
├── packages/                 # 核心包
│   ├── core/                # 框架无关的核心模块
│   │   ├── src/
│   │   │   ├── adapters/    # 钱包适配器
│   │   │   ├── managers/    # 钱包管理器
│   │   │   ├── events/      # 事件系统
│   │   │   ├── types/       # 类型定义
│   │   │   └── __tests__/   # 测试文件
│   │   └── package.json
│   ├── react/               # React 集成
│   │   ├── src/
│   │   │   ├── components/  # React 组件
│   │   │   ├── hooks/       # React hooks
│   │   │   ├── context/     # Context providers
│   │   │   └── __tests__/   # 测试文件
│   │   └── package.json
│   └── vue/                 # Vue 集成
│       ├── src/
│       │   ├── components/  # Vue 组件
│       │   ├── composables/ # Vue composables
│       │   └── __tests__/   # 测试文件
│       └── package.json
├── examples/                # 使用示例
│   ├── react/              # React 示例
│   ├── vue-example/        # Vue 示例
│   └── nextjs/             # Next.js SSR 示例
├── docs/                   # 附加文档
└── scripts/                # 构建和工具脚本
```

## 🔄 开发工作流

### 1. 创建分支

```bash
# 与上游 main 分支同步
git fetch upstream
git checkout main
git merge upstream/main

# 为你的功能创建新分支
git checkout -b feature/your-feature-name
# 或
git checkout -b fix/your-bug-fix
```

### 2. 进行更改

- 遵循 [代码规范](#代码规范)
- 为新功能编写测试
- 根据需要更新文档

### 3. 测试更改

```bash
# 运行所有测试
bun test

# 运行特定包的测试
bun test packages/core
bun test packages/react
bun test packages/vue

# 运行测试并生成覆盖率报告
bun test --coverage

# 运行类型检查
bun run typecheck

# 运行代码检查
bun run lint
```

### 4. 提交更改

遵循我们的 [提交消息规范](#提交消息规范)：

```bash
# 暂存更改
git add .

# 使用规范格式提交
git commit -m "feat: 为 XYZ 钱包添加新的适配器"
```

### 5. 推送并创建 Pull Request

```bash
# 推送到你的 Fork
git push origin feature/your-feature-name

# 在 GitHub 上创建 Pull Request
# 使用 PR 模板并填写所有部分
```

## 📝 代码规范

### TypeScript

- 使用 **严格模式** TypeScript
- 所有函数必须有返回类型
- 对象形状使用 `interface`，联合类型/基本类型使用 `type`
- 尽可能使用 `const` 而不是 `let`
- 使用显式的导入/导出

```typescript
// ✅ 好的写法
interface WalletInfo {
  id: string;
  name: string;
  icon: string;
}

const createWallet = (info: WalletInfo): BTCWalletAdapter => {
  return new WalletAdapter(info);
};

// ❌ 错误的写法
const createWallet = (info: any) => {
  return new WalletAdapter(info);
};
```

### 代码风格

我们使用 **Biome** 进行代码格式化和检查：

```bash
# 格式化代码
bun run format

# 检查代码规范
bun run lint

# 自动修复代码规范问题
bun run lint:fix
```

**风格指南：**
- 2 空格缩进
- 字符串使用单引号
- 不使用分号（Biome 会处理）
- 最大行长度：100 字符

### 命名规范

```typescript
// 文件：kebab-case（短横线命名）
wallet-adapter.ts
use-wallet.ts
btc-connect-button.tsx

// 变量和函数：camelCase（驼峰命名）
const walletManager = new BTCWalletManager();
const connectWallet = async (walletId: string) => {};

// 类和接口：PascalCase（大驼峰命名）
class BTCWalletAdapter {}
interface WalletState {}

// 常量：UPPER_SNAKE_CASE（大写下划线命名）
const DEFAULT_TIMEOUT = 5000;
const WALLET_IDS = ['unisat', 'okx', 'xverse'];

// 类型：接口使用 PascalCase，类型别名使用 camelCase
interface WalletInfo {}
type WalletStatus = 'connected' | 'disconnected';
```

## 🧪 测试指南

### 测试结构

```typescript
// packages/core/src/__tests__/managers.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { BTCWalletManager } from '../managers';

describe('BTCWalletManager', () => {
  let manager: BTCWalletManager;

  beforeEach(() => {
    manager = new BTCWalletManager();
  });

  afterEach(() => {
    manager.destroy();
  });

  describe('connect', () => {
    it('应该成功连接钱包', async () => {
      const accounts = await manager.connect('unisat');
      expect(accounts).toBeDefined();
      expect(accounts.length).toBeGreaterThan(0);
    });

    it('无效钱包应该抛出错误', async () => {
      await expect(manager.connect('invalid')).rejects.toThrow();
    });
  });
});
```

### 测试要求

1. **单元测试**：测试独立函数和类
2. **集成测试**：测试模块间交互
3. **模拟外部依赖**：为钱包 API 使用模拟
4. **覆盖率**：保持 >90% 的测试覆盖率
5. **异步测试**：使用正确的 async/await 模式

### 测试命令

```bash
# 运行所有测试
bun test

# 监视模式运行测试
bun test --watch

# 运行测试并生成覆盖率报告
bun test --coverage

# 运行特定测试文件
bun test packages/core/src/__tests__/managers.test.ts
```

## 📚 文档编写

### 代码文档

- 为所有公共 API 使用 JSDoc 注释
- 包含参数类型和返回类型
- 为复杂函数添加使用示例

```typescript
/**
 * 连接到比特币钱包
 * @param walletId - 要连接的钱包 ID
 * @param options - 连接选项
 * @returns 解析为账户信息的 Promise
 * @throws {WalletNotInstalledError} 当钱包未安装时
 * @throws {WalletConnectionError} 当连接失败时
 *
 * @example
 * ```typescript
 * const accounts = await manager.connect('unisat');
 * console.log('已连接账户:', accounts[0].address);
 * ```
 */
async connect(walletId: string, options?: ConnectionOptions): Promise<AccountInfo[]> {
  // 实现
}
```

### README 文档

- 为新功能更新 README.md
- 为重大更改更新 CHANGELOG.md
- 向 `examples/` 目录添加示例
- 保持文档与代码同步

## 📤 提交更改

### Pull Request 流程

1. **创建 Pull Request**
   - 使用描述性标题
   - 完整填写 PR 模板
   - 链接相关 issues

2. **PR 要求**
   - 所有测试通过
   - 代码遵循风格指南
   - 文档已更新
   - 破坏性更改必须有适当的版本升级

3. **审查流程**
   - 维护者将审查你的 PR
   - 及时处理反馈
   - 保持 PR 与 main 分支同步

### Pull Request 模板

```markdown
## 描述
更改的简要描述

## 更改类型
- [ ] 错误修复
- [ ] 新功能
- [ ] 破坏性更改
- [ ] 文档更新

## 测试
- [ ] 所有测试通过
- [ ] 添加了新测试
- [ ] 维持了覆盖率

## 检查清单
- [ ] 代码遵循项目风格指南
- [ ] 完成自我审查
- [ ] 文档已更新
- [ ] 已测试示例（如适用）
```

## 🏷️ 版本管理

### 语义化版本

我们遵循 [语义化版本](https://semver.org/)：

- **MAJOR**：破坏性更改
- **MINOR**：新功能（向后兼容）
- **PATCH**：错误修复（向后兼容）

### 发布流程

1. 更新 package.json 文件中的版本号
2. 更新 CHANGELOG.md
3. 创建发布标签
4. 发布到 npm

### 分支策略

- `main`：稳定发布版本
- `develop`：开发分支（如需要）
- `feature/*`：功能分支
- `fix/*`：错误修复分支

## 🐛 错误报告

### 报告错误

使用 GitHub issue 跟踪器并遵循以下模板：

```markdown
**错误描述**
清晰简洁地描述错误

**重现步骤**
重现行为的步骤

**预期行为**
你期望发生什么

**环境**
- 操作系统：[例如 macOS 13.0]
- Node.js 版本：[例如 18.17.0]
- 浏览器：[例如 Chrome 116]
- 包版本：[例如 1.2.3]

**附加上下文**
任何其他相关信息
```

## 💡 功能请求

### 请求功能

1. 检查现有 issues 避免重复
2. 使用 GitHub issue 跟踪器
3. 提供清晰的用例和实现建议

```markdown
**功能描述**
功能的清晰描述

**用例**
为什么需要这个功能

**建议的解决方案**
你设想的功能如何工作

**考虑的替代方案**
你考虑过的其他方法
```

## 🤝 社区指南

### 行为准则

- 保持尊重和包容
- 欢迎新人并帮助他们学习
- 专注于建设性反馈
- 假设善意

### 获取帮助

- **Discussions**：使用 GitHub Discussions 提问
- **Issues**：使用 issues 报告错误和请求功能
- **Discord**：加入我们的 [Discord 服务器](https://discord.gg/btc-connect)
- **Email**：support@btc-connect.dev

## 🏆 认可

贡献者通过多种方式获得认可：

- **贡献者列表**在 README.md 中
- **发布说明**中提及贡献
- **特别认可**重要贡献
- **维护者权限**给持续贡献者

## 📞 附加资源

- [文档](https://docs.btc-connect.dev)
- [API 参考](https://docs.btc-connect.dev/api)
- [示例](./examples/)
- [Discord 社区](https://discord.gg/btc-connect)

---

感谢您为 BTC Connect 做贡献！您的贡献使全世界的开发者更容易集成比特币钱包。🚀