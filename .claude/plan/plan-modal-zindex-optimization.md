# Modal Z-Index 优化功能规划

## 1. 目标定义

### 1.1 核心目标
将btc-connect项目中WalletModal组件的z-index提高到足够大的值，确保在第三方网站上能够正常显示，不被其他元素覆盖。

### 1.2 技术指标
- **当前状态**: React和Vue版本modal组件z-index均为1050
- **目标状态**: 提供可配置的z-index机制，默认使用超高值确保显示优先级
- **兼容性要求**: 保持SSR兼容性（Next.js、Nuxt 3）
- **向后兼容**: 确保现有API不破坏
- **性能要求**: 不影响页面渲染性能

### 1.3 功能范围
- React版本WalletModal组件优化
- Vue版本WalletModal组件优化
- 新增z-index配置选项
- 提供动态z-index检测机制（可选）
- 更新相关类型定义

## 2. 技术方案

### 2.1 整体架构设计

#### 2.1.1 配置层级结构
```
Provider/Plugin 层级 (全局配置)
    ↓
组件层级 (局部配置，覆盖全局)
    ↓
运行时动态调整 (可选机制)
```

#### 2.1.2 Z-Index 策略选择
采用**混合策略**，提供多种配置选项：

1. **固定高值策略** (默认)
   - 默认z-index: `999999`
   - 确保在绝大多数情况下都处于最顶层，避免极端值

2. **动态检测策略** (可选)
   - 运行时检测页面最高z-index
   - 在最高值基础上添加安全余量

3. **自定义策略**
   - 用户可指定具体z-index值

### 2.2 React版本实现方案

#### 2.2.1 Context Provider扩展
```typescript
// packages/react/src/context/index.tsx
interface WalletProviderProps {
  // ... 现有属性
  modalConfig?: {
    zIndex?: number | 'auto' | 'max';
    strategy?: 'fixed' | 'dynamic' | 'custom';
  };
}
```

#### 2.2.2 组件Props扩展
```typescript
// packages/react/src/components/WalletModal.tsx
export interface WalletModalProps {
  // ... 现有属性
  zIndex?: number | 'auto' | 'max';
  strategy?: 'fixed' | 'dynamic' | 'custom';
}
```

#### 2.2.3 Z-Index 计算工具
```typescript
// packages/react/src/utils/zIndex.ts
export class ZIndexManager {
  private static readonly DEFAULT_Z_INDEX = 999999; // 高优先级z-index值
  private static readonly SAFE_MARGIN = 10;

  static calculateZIndex(
    strategy: 'fixed' | 'dynamic' | 'custom',
    customValue?: number
  ): number {
    switch (strategy) {
      case 'fixed':
        return this.DEFAULT_Z_INDEX;
      case 'dynamic':
        return this.getDynamicZIndex();
      case 'custom':
        return customValue || this.DEFAULT_Z_INDEX;
      default:
        return this.DEFAULT_Z_INDEX;
    }
  }

  private static getDynamicZIndex(): number {
    if (typeof document === 'undefined') return this.DEFAULT_Z_INDEX;

    let maxZIndex = 0;
    const elements = document.querySelectorAll('*');

    elements.forEach(el => {
      const zIndex = parseInt(window.getComputedStyle(el).zIndex || '0');
      if (zIndex > maxZIndex) {
        maxZIndex = zIndex;
      }
    });

    return maxZIndex + this.SAFE_MARGIN;
  }
}
```

### 2.3 Vue版本实现方案

#### 2.3.1 Plugin配置扩展
```typescript
// packages/vue/src/walletContext.ts
export interface BTCWalletPluginOptions {
  // ... 现有属性
  modalConfig?: {
    zIndex?: number | 'auto' | 'max';
    strategy?: 'fixed' | 'dynamic' | 'custom';
  };
}
```

#### 2.3.2 组件Props扩展
```typescript
// packages/vue/src/components/WalletModal.vue
interface Props {
  // ... 现有属性
  zIndex?: number | 'auto' | 'max';
  strategy?: 'fixed' | 'dynamic' | 'custom';
}
```

#### 2.3.3 组合式API扩展
```typescript
// packages/vue/src/composables/useWalletModal.ts
export function useWalletModal() {
  // ... 现有实现

  const modalZIndex = computed(() => {
    const config = getCurrentInstance()?.appContext.config.globalProperties.$btcWalletConfig;
    return ZIndexManager.calculateZIndex(
      config?.modalConfig?.strategy || 'fixed',
      config?.modalConfig?.zIndex
    );
  });

  return {
    // ... 现有返回值
    modalZIndex
  };
}
```

### 2.4 类型定义扩展

#### 2.4.1 共享类型定义
```typescript
// packages/core/src/types/config.ts
export interface ModalConfig {
  zIndex?: number | 'auto' | 'max';
  strategy?: 'fixed' | 'dynamic' | 'custom';
}

export type ZIndexStrategy = 'fixed' | 'dynamic' | 'custom';
export type ZIndexValue = number | 'auto' | 'max';
```

## 3. 实施步骤

### 3.1 第一阶段：核心功能实现 (优先级：高)

#### 步骤 1.1：类型定义扩展
- [ ] 在 `packages/core/src/types/config.ts` 中添加 ModalConfig 类型
- [ ] 导出 ZIndexStrategy 和 ZIndexValue 类型
- [ ] 更新核心模块的 type exports

#### 步骤 1.2：Z-Index管理工具开发
- [ ] 在 `packages/core/src/utils/zIndex.ts` 中实现 ZIndexManager 类
- [ ] 实现固定值、动态检测和自定义值计算逻辑
- [ ] 添加SSR保护机制
- [ ] 编写单元测试

#### 步骤 1.3：React版本核心修改
- [ ] 扩展 `WalletProviderProps` 接口，添加 modalConfig 属性
- [ ] 扩展 `WalletModalProps` 接口，添加 zIndex 和 strategy 属性
- [ ] 修改 WalletModal 组件，集成 ZIndexManager
- [ ] 更新样式注入逻辑，使用动态 z-index
- [ ] 更新 Context Provider，传递全局配置

#### 步骤 1.4：Vue版本核心修改
- [ ] 扩展 `BTCWalletPluginOptions` 接口，添加 modalConfig 属性
- [ ] 扩展 WalletModal 组件 Props，添加 zIndex 和 strategy 属性
- [ ] 修改组件模板，使用动态 z-index
- [ ] 更新 composable，添加 modalZIndex 计算属性
- [ ] 更新插件配置逻辑

### 3.2 第二阶段：优化和完善 (优先级：中)

#### 步骤 2.1：性能优化
- [ ] 优化动态检测算法，避免性能问题
- [ ] 添加防抖机制，避免频繁计算
- [ ] 实现缓存机制，存储计算结果

#### 步骤 2.2：SSR兼容性完善
- [ ] 确保 ZIndexManager 在服务端环境的安全运行
- [ ] 测试 Next.js 示例项目的兼容性
- [ ] 测试 Nuxt 3 示例项目的兼容性
- [ ] 更新示例项目，展示新功能使用方法

#### 步骤 2.3：错误处理和边界情况
- [ ] 添加无效 z-index 值的错误处理
- [ ] 处理动态检测失败的情况
- [ ] 添加用户友好的错误提示

### 3.3 第三阶段：文档和测试 (优先级：中)

#### 步骤 3.1：文档更新
- [ ] 更新 React 模块的 CLAUDE.md 文档
- [ ] 更新 Vue 模块的 CLAUDE.md 文档
- [ ] 添加 API 使用示例
- [ ] 更新根目录的 CHANGELOG

#### 步骤 3.2：测试覆盖
- [ ] 编写 ZIndexManager 单元测试
- [ ] 编写 React 组件集成测试
- [ ] 编写 Vue 组件集成测试
- [ ] 添加 SSR 环境测试
- [ ] 添加性能基准测试

### 3.4 第四阶段：发布和验证 (优先级：低)

#### 步骤 4.1：示例项目更新
- [ ] 更新 react-example，展示 z-index 配置
- [ ] 更新 vue-example，展示 z-index 配置
- [ ] 更新 nextjs-example，展示 SSR 环境下的配置
- [ ] 更新 nuxt-example，展示 SSR 环境下的配置

#### 步骤 4.2：版本发布准备
- [ ] 更新各模块的版本号
- [ ] 验证向后兼容性
- [ ] 准备发布说明

## 4. 验收标准

### 4.1 功能验收标准

#### 4.1.1 基础功能验收
- [ ] React 版本 WalletModal 支持自定义 z-index 配置
- [ ] Vue 版本 WalletModal 支持自定义 z-index 配置
- [ ] 默认使用高优先级 z-index 值 (999999)
- [ ] 支持固定、动态、自定义三种策略
- [ ] 配置优先级正确：组件级 > 全局级 > 默认值

#### 4.1.2 兼容性验收
- [ ] 现有 API 完全向后兼容
- [ ] SSR 环境下正常运行 (Next.js, Nuxt 3)
- [ ] 客户端环境正常运行
- [ ] 多浏览器兼容 (Chrome, Firefox, Safari, Edge)

#### 4.1.3 性能验收
- [ ] 动态 z-index 计算不影响页面渲染性能
- [ ] 内存使用无显著增加
- [ ] 组件渲染速度无明显下降

### 4.2 测试验收标准

#### 4.2.1 单元测试覆盖率
- [ ] ZIndexManager 类测试覆盖率 ≥ 90%
- [ ] React 组件相关逻辑测试覆盖率 ≥ 80%
- [ ] Vue 组件相关逻辑测试覆盖率 ≥ 80%

#### 4.2.2 集成测试
- [ ] React Provider 配置传递测试通过
- [ ] Vue Plugin 配置传递测试通过
- [ ] 组件级配置覆盖全局配置测试通过
- [ ] SSR 环境集成测试通过

#### 4.2.3 端到端测试
- [ ] 完整的钱包连接流程测试通过
- [ ] Modal 显示层级正确性测试通过
- [ ] 第三方网站覆盖场景测试通过

### 4.3 代码质量验收标准

#### 4.3.1 代码规范
- [ ] 所有修改通过 Biome 代码检查
- [ ] TypeScript 类型检查无错误
- [ ] 代码符合项目编码规范

#### 4.3.2 文档完整性
- [ ] API 文档更新完整
- [ ] 使用示例清晰准确
- [ ] 变更记录详细记录

## 5. 风险评估与缓解措施

### 5.1 技术风险

#### 5.1.1 高风险：CSS样式冲突
**风险描述**: 动态z-index可能与第三方网站样式产生意外冲突
**影响程度**: 中等
**缓解措施**:
- 使用极高z-index值作为默认选项，减少冲突可能
- 提供!important声明确保样式优先级
- 添加样式隔离机制

#### 5.1.2 中风险：性能影响
**风险描述**: 动态z-index检测可能影响页面性能
**影响程度**: 中等
**缓解措施**:
- 实现防抖机制，避免频繁计算
- 添加缓存机制，存储计算结果
- 优化DOM查询算法

#### 5.1.3 低风险：SSR兼容性问题
**风险描述**: 服务端渲染环境下可能出现兼容性问题
**影响程度**: 低
**缓解措施**:
- 添加typeof检查确保客户端执行
- 提供SSR安全的默认值
- 充分测试SSR环境

### 5.2 业务风险

#### 5.2.1 中风险：向后兼容性破坏
**风险描述**: 新功能可能破坏现有用户的使用方式
**影响程度**: 中等
**缓解措施**:
- 所有新配置项都设置为可选
- 保持现有API完全不变
- 提供详细的迁移指南

#### 5.2.2 低风险：用户理解成本
**风险描述**: 新的配置选项可能增加用户学习成本
**影响程度**: 低
**缓解措施**:
- 提供合理的默认配置
- 编写详细的使用文档
- 添加丰富的使用示例

### 5.3 项目风险

#### 5.3.1 低风险：开发延期
**风险描述**: 功能复杂度可能导致开发延期
**影响程度**: 低
**缓解措施**:
- 采用分阶段实施策略
- 优先实现核心功能
- 预留充分的测试时间

## 6. 资源需求

### 6.1 开发资源
- **前端开发**: 1人，预计3-4个工作日
- **测试**: 1人，预计1-2个工作日
- **文档**: 0.5人，预计1个工作日

### 6.2 技术资源
- 开发环境：现有的Bun + TypeScript环境
- 测试环境：现有的Bun Test框架
- 文档工具：现有的Markdown文档系统

## 7. 时间计划

| 阶段 | 内容 | 预计时间 | 开始时间 | 完成时间 |
|------|------|----------|----------|----------|
| 第一阶段 | 核心功能实现 | 2-3天 | 待定 | 待定 |
| 第二阶段 | 优化和完善 | 1-2天 | 待定 | 待定 |
| 第三阶段 | 文档和测试 | 1-2天 | 待定 | 待定 |
| 第四阶段 | 发布和验证 | 1天 | 待定 | 待定 |
| **总计** | **完整功能** | **5-8天** | **待定** | **待定** |

## 8. 成功指标

### 8.1 技术指标
- [ ] 所有测试用例通过率 100%
- [ ] 代码覆盖率 ≥ 80%
- [ ] 性能基准测试通过
- [ ] 构建成功率 100%

### 8.2 用户体验指标
- [ ] Modal在第三方网站显示层级正确率 100%
- [ ] 新功能配置成功率 ≥ 95%
- [ ] 向后兼容性保持率 100%

### 8.3 项目质量指标
- [ ] 代码审查通过率 100%
- [ ] 文档完整性 100%
- [ ] 发布流程成功率 100%

---

**文档创建时间**: 2025-10-19
**文档版本**: v1.0
**负责人**: 待分配
**状态**: 规划阶段