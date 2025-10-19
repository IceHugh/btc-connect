# 脚本工具

本目录包含项目管理和自动化的脚本工具。

## 版本管理

### 自动版本更新脚本

项目提供了两种方式来自动更新所有子包的版本号：

#### 1. Bash 脚本（推荐）

```bash
# 更新补丁版本 (0.2.0 → 0.2.1)
bun run version:patch

# 更新次版本 (0.2.1 → 0.3.0)
bun run version:minor

# 更新主版本 (0.2.1 → 1.0.0)
bun run version:major

# 更新并推送到远程仓库（触发 CI/CD 自动发布）
bun run version:patch:push
bun run version:minor:push
bun run version:major:push
```

#### 2. Node.js 脚本

```bash
# 更新补丁版本
node scripts/update-version.js patch

# 更新次版本
node scripts/update-version.js minor

# 更新主版本
node scripts/update-version.js major

# 设置特定版本
node scripts/update-version.js 1.2.3

# 更新并推送
node scripts/update-version.js patch --push
```

#### 3. 直接使用 Bash 脚本

```bash
# 更新补丁版本
./scripts/update-version.sh patch

# 更新并推送
./scripts/update-version.sh patch --push
```

### 脚本功能

自动版本更新脚本会：

1. **同步更新所有子包版本号**：
   - `@btc-connect/core`
   - `@btc-connect/react`
   - `@btc-connect/vue`

2. **智能版本计算**：
   - `patch`: 补丁版本（bug 修复）
   - `minor`: 次版本（新功能）
   - `major`: 主版本（破坏性变更）

3. **自动提交更改**：
   - 生成标准化的提交信息
   - 包含所有更新的包列表

4. **可选推送**：
   - 使用 `--push` 参数自动推送到远程仓库
   - 触发 CI/CD 流水线自动发布到 NPM

### 使用示例

```bash
# 开发完成 bug 修复后
bun run version:patch:push

# 添加新功能后
bun run version:minor:push

# 重大版本更新后
bun run version:major:push

# 只更新版本号，不推送（需要手动检查）
bun run version:patch
```

### 提交信息格式

脚本会自动生成如下格式的提交信息：

```
chore: 更新所有子包版本号到 v0.2.1

  - @btc-connect/core: 0.2.1
  - @btc-connect/react: 0.2.1
  - @btc-connect/vue: 0.2.1

准备发布到 NPM
```

## 注意事项

1. **工作目录**: 脚本必须在项目根目录运行
2. **Git 状态**: 运行前请确保没有未提交的更改
3. **版本同步**: 所有子包的版本号会保持同步
4. **CI/CD**: 推送到远程仓库会自动触发 CI/CD 发布流程

## 故障排除

如果脚本运行失败：

1. 检查是否有 Git 锁文件：
   ```bash
   rm -f .git/index.lock
   ```

2. 确保 Node.js 和 Bun 已正确安装

3. 检查包文件是否存在：
   ```bash
   ls packages/*/package.json
   ```

4. 手动验证版本号：
   ```bash
   node -p "require('./packages/core/package.json').version"
   ```