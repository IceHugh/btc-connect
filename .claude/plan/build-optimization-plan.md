# btc-connect 构建优化详细规划

## 📋 项目概述

**规划目标**: 优化 core 和 vue 包的构建流程，解决代码压缩、混淆和全局函数/类重复定义问题
**项目版本**: v0.3.14
**规划时间**: 2025-10-31
**预计完成时间**: 2025-11-02

---

## 🎯 核心问题定义

### 1. **全局函数和类重复定义问题**
- **问题描述**: Core 包中的 BTCWalletManager 等类在 Vue 包中可能重复实例化
- **影响范围**: 可能导致运行时冲突、内存浪费、状态不一致
- **优先级**: 🔴 高

### 2. **代码压缩和混淆策略不统一**
- **问题描述**: Core 和 Vue 包使用不同的压缩工具和策略
- **影响范围**: 包大小不一致、性能差异、维护困难
- **优先级**: 🟡 中

### 3. **构建产物体积优化**
- **问题描述**: Vue 包体积偏大（72KB），包含重复工具函数
- **影响范围**: 加载性能、用户体验
- **优先级**: 🟡 中

### 4. **TypeScript 配置不一致**
- **问题描述**: Vue 包关闭了严格模式，类型安全性降低
- **影响范围**: 开发体验、代码质量
- **优先级**: 🟠 中高

---

## 🔧 详细解决方案

### Phase 1: 解决类重复定义问题（最高优先级）

#### 1.1 分析依赖关系
**目标**: 明确 Core 和 Vue 包之间的依赖边界
**时间**: 2小时

**具体任务**:
1. 检查 Vue 包中所有来自 @btc-connect/core 的导入
2. 识别重复创建的类实例
3. 分析全局变量和单例模式的使用

**预期产出**:
- 依赖关系图
- 重复实例清单
- 重构建议

#### 1.2 重构依赖注入机制
**目标**: 确保所有类只被实例化一次
**时间**: 4小时

**具体任务**:
1. 在 Core 包中实现单例模式的 wallet manager
2. 修改 Vue 包的导入方式，使用单例而非新建实例
3. 添加依赖注入容器，统一管理全局状态

**代码示例**:
```typescript
// core/src/singletons.ts
export class WalletManagerSingleton {
  private static instance: BTCWalletManager;

  static getInstance(): BTCWalletManager {
    if (!this.instance) {
      this.instance = new BTCWalletManager();
    }
    return this.instance;
  }
}

// vue/src/composables/useCore.ts
import { WalletManagerSingleton } from '@btc-connect/core';
export const walletManager = WalletManagerSingleton.getInstance();
```

#### 1.3 验证单例模式
**目标**: 确保重构后的单例模式正常工作
**时间**: 2小时

**具体任务**:
1. 编写单元测试验证单例行为
2. 在多个环境中测试类实例唯一性
3. 验证状态同步的一致性

### Phase 2: 统一构建配置

#### 2.1 创建统一构建工具链
**目标**: Core 和 Vue 包使用一致的压缩和混淆策略
**时间**: 3小时

**具体任务**:
1. 评估 Bun build 和 Vite 的兼容性
2. 选择统一的压缩工具（推荐 Bun build）
3. 配置统一的混淆策略

**配置示例**:
```javascript
// shared-build-config.js
export const buildConfig = {
  minify: {
    whitespace: true,
    syntax: true,
    identifiers: true, // 启用标识符混淆
    mangle: {
      eval: true,
      keep_fnames: false,
      toplevel: false,
    }
  },
  sourcemap: process.env.NODE_ENV === 'development',
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  },
  treeshake: {
    preset: 'smallest',
    moduleSideEffects: false
  }
};
```

#### 2.2 优化 Vue 包构建配置
**目标**: 将 Vue 包迁移到统一构建配置
**时间**: 2小时

**具体任务**:
1. 修改 `packages/vue/vite.config.ts`
2. 启用高级压缩选项
3. 配置 externals 优化

#### 2.3 性能对比测试
**目标**: 验证构建优化效果
**时间**: 1小时

**具体任务**:
1. 对比优化前后的包大小
2. 测试运行时性能
3. 验证功能完整性

### Phase 3: TypeScript 配置统一

#### 3.1 启用 Vue 包严格模式
**目标**: 提高类型安全性
**时间**: 2小时

**具体任务**:
1. 修改 `packages/vue/tsconfig.app.json`
2. 启用 `strict: true`
3. 修复类型错误

**配置更新**:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

#### 3.2 统一 TypeScript 基础配置
**目标**: Core 和 Vue 包使用一致的 TS 配置
**时间**: 1小时

### Phase 4: 体积优化和代码分割

#### 4.1 分析 Vue 包体积
**目标**: 识别可优化的代码模块
**时间**: 2小时

**具体任务**:
1. 使用 bundle analyzer 分析包体积
2. 识别重复工具函数
3. 分析依赖项大小

#### 4.2 实现代码分割
**目标**: 减少初始包大小
**时间**: 3小时

**具体任务**:
1. 将 Vue 组件分离为独立 chunk
2. 工具函数延迟加载
3. 配置动态导入

#### 4.3 移除重复代码
**目标**: 消除 Core 和 Vue 包间的重复实现
**时间**: 2小时

**具体任务**:
1. 识别重复的工具函数
2. 将公共函数移至 Core 包
3. 更新 Vue 包导入

### Phase 5: 增强开发体验和监控

#### 5.1 优化 ES modules 输出
**目标**: 专注于 ES modules 格式的最佳实践
**时间**: 2小时

**具体任务**:
1. 优化 ES modules 的 tree-shaking 效果
2. 确保 package.json exports 配置最优
3. 验证现代浏览器和构建工具兼容性

#### 5.2 添加构建监控
**目标**: 持续监控构建性能
**时间**: 2小时

**具体任务**:
1. 集成构建分析工具
2. 设置包大小阈值警告
3. 添加性能基准测试

---

## 📊 实施计划时间表

### Day 1 (2025-10-31)
- **上午 (4小时)**: Phase 1.1-1.2 分析和重构依赖关系
- **下午 (4小时)**: Phase 1.3 验证单例模式，Phase 2.1 统一构建配置

### Day 2 (2025-11-01)
- **上午 (4小时)**: Phase 2.2-2.3 优化构建配置和性能测试
- **下午 (4小时)**: Phase 3.1-3.2 TypeScript 配置统一

### Day 3 (2025-11-02)
- **上午 (4小时)**: Phase 4.1-4.2 体积分析和代码分割
- **下午 (4小时)**: Phase 4.3-5.1 移除重复代码，优化 ES modules 输出

---

## 🎯 预期成果

### 量化指标
- **Vue 包体积**: 从 72KB 减少到 50KB (-30%)
- **Core 包体积**: 从 48KB 减少到 42KB (-12%)
- **构建时间**: 减少 15-20%
- **类型错误**: 减少到 0 个

### 质量提升
- ✅ 消除全局类重复定义问题
- ✅ 统一的压缩和混淆策略
- ✅ 完整的 TypeScript 类型安全
- ✅ 更好的模块化和可维护性
- ✅ 增强的运行环境兼容性

### 开发体验改进
- 🔧 统一的构建配置和开发工具
- 📦 更清晰的依赖关系
- 🛡️ 更强的类型安全保障
- 📈 可持续的性能监控

---

## ⚠️ 风险评估和缓解策略

### 高风险项
1. **单例模式重构可能影响现有 API**
   - **缓解**: 保持向后兼容，渐进式重构
   - **回滚计划**: 保留原始实现作为备选方案

2. **构建配置统一可能导致兼容性问题**
   - **缓解**: 充分测试不同环境
   - **回滚计划**: 保留原始构建配置

### 中风险项
1. **TypeScript 严格模式可能引入大量类型错误**
   - **缓解**: 分阶段启用，先修复关键错误
   - **回滚计划**: 逐步启用，而非一次性全部启用

2. **代码分割可能影响运行时性能**
   - **缓解**: 充分的性能测试和监控
   - **回滚计划**: 保留原始打包方式

---

## 🧪 测试策略

### 单元测试
- [ ] 验证单例模式的正确性
- [ ] 测试重构后的 API 兼容性
- [ ] 验证类型定义的完整性

### 集成测试
- [ ] 测试 Core 和 Vue 包的集成
- [ ] 验证 ES modules 格式的兼容性
- [ ] 测试运行时性能和内存使用

### 端到端测试
- [ ] 验证示例应用的正常运行
- [ ] 测试不同浏览器环境
- [ ] 验证生产环境部署

### 性能测试
- [ ] 包大小对比测试
- [ ] 构建时间基准测试
- [ ] 运行时性能分析

---

## 📝 验收标准

### 功能验收
- [ ] 所有现有功能正常工作
- [ ] API 保持向后兼容
- [ ] 示例应用正常运行

### 性能验收
- [ ] Vue 包体积 ≤ 50KB
- [ ] Core 包体积 ≤ 42KB
- [ ] 构建时间减少 ≥ 15%
- [ ] 零全局类重复定义

### 质量验收
- [ ] TypeScript 编译零错误
- [ ] 所有测试通过
- [ ] 代码覆盖率 ≥ 80%

### 兼容性验收
- [ ] 优化 ES modules 输出和 tree-shaking
- [ ] 兼容 Node.js 18+ 和现代浏览器
- [ ] 支持主流构建工具 (Vite, Webpack, Rollup)

---

## 🚀 后续优化计划

### 短期 (1-2周)
- 添加自动化构建监控
- 完善 CI/CD 集成
- 优化文档和示例

### 中期 (1个月)
- 实现按需加载机制
- 添加性能监控面板
- 优化错误处理和调试体验

### 长期 (3个月)
- 考虑微前端架构支持
- 实现更高级的缓存策略
- 添加更多钱包适配器

---

*本规划文档将根据实施过程中的发现和反馈持续更新*