# React & Vue ConnectButton 样式统一规划

## 项目背景

为了让 React 和 Vue 包中的 ConnectButton 组件提供完全一致的用户体验，需要统一两个包的视觉表现、交互行为和功能特性。本规划旨在系统性地解决现有差异，确保用户在两个框架中获得相同的使用体验。

## 现状分析

### 主要差异概览

#### 1. 架构设计差异
- **React包**: 单一组件模式，所有逻辑集成在 ConnectButton 中
- **Vue包**: 模块化组件架构，ConnectButton + WalletStatus + AddressDisplay + BalanceDisplay

#### 2. 样式实现差异
- **React包**: 内联 CSS 样式注入，所有样式写在组件文件中
- **Vue包**: 独立 CSS 文件架构，支持更完整的主题系统

#### 3. 功能完整性差异
- **React包**: 基础连接/断开功能，简单的下拉菜单
- **Vue包**: 完整的功能集合，包括钱包信息、网络显示、余额刷新等

#### 4. 交互体验差异
- **React包**: 基本的悬停效果，有限的可访问性支持
- **Vue包**: 丰富的微交互、完整可访问性支持、现代CSS特性

#### 5. 主题系统差异
- **React包**: 仅支持 light/dark 主题
- **Vue包**: 支持 light/dark/auto 主题，使用 color-mix() 等现代CSS

### 详细对比表

| 特性 | React 包 | Vue 包 | 差异程度 | 统一优先级 |
|------|----------|--------|----------|------------|
| **基础样式** | 内联CSS | 外部CSS文件 | 架构差异 | 中 |
| **主题系统** | light/dark | light/dark/auto | 功能差异 | 高 |
| **动画效果** | 基础过渡 | 丰富微交互 | 用户体验差异 | 高 |
| **下拉菜单** | 简单Disconnect | 完整功能菜单 | 功能差异 | 高 |
| **状态指示器** | 无 | 完整状态点 | 功能缺失 | 高 |
| **可访问性** | 基础支持 | 完整A11y支持 | 用户体验差异 | 高 |
| **响应式设计** | 基础支持 | 完整响应式 | 用户体验差异 | 中 |
| **现代CSS特性** | 传统实现 | color-mix等 | 技术实现差异 | 中 |

## 统一目标

### 核心目标
1. **视觉一致性**: 两个包在各主题下外观完全一致
2. **功能对等性**: 提供相同的功能集合和交互体验
3. **体验统一性**: 相同的动画、过渡和用户反馈
4. **技术先进性**: 使用现代Web技术，支持最新的浏览器特性

### 设计原则
1. **保持框架特色**: 在统一体验的同时保持各框架的最佳实践
2. **向后兼容**: 不破坏现有API接口和用户代码
3. **渐进增强**: 在保证兼容性的前提下使用现代技术
4. **性能优先**: 确保统一过程不增加不必要的性能负担

## 技术方案

### 1. CSS实现架构决策

**推荐方案A**: 保持框架特色，统一视觉规范
```
React包: 继续使用内联CSS样式注入
Vue包: 继续使用外部CSS文件
统一方式: 制定统一的设计规范和CSS变量标准
```

**理由**:
- 保持各框架的开发习惯和最佳实践
- 避免大规模重构带来的风险
- 维护成本相对可控
- 用户迁移成本低

### 2. 组件架构统一决策

**推荐方案A**: 统一组件架构层次
```
Vue包: 保持现有模块化架构 (ConnectButton + WalletStatus + AddressDisplay + BalanceDisplay)
React包: 引入类似的子组件结构，但保持单一导出接口
统一方式: 明确定义各组件的职责边界和交互协议
```

**理由**:
- 代码复用性提高
- 测试和维护更容易
- 功能对等性更容易实现
- 不破坏现有API接口

### 3. 主题系统统一决策

**推荐方案A**: 全面支持现代CSS特性
```
主题支持: light / dark / auto 三种模式
实现方式: color-mix() + CSS变量 + 媒体查询
降级方案: auto主题回退到light主题
兼容性: 提供polyfill或优雅降级
```

**理由**:
- 符合现代Web开发趋势
- 提供最佳用户体验
- 技术债务最小化
- 与主流Web框架保持一致

## 实施计划

### 阶段1: 设计规范统一 (2天)

#### 任务1.1: 统一设计系统 (4小时)
- 制定统一的颜色系统
- 统一字体和排版规范
- 定义间距和尺寸标准
- 建立动效设计规范

**输出物**:
```
DESIGN_SYSTEM.md - 设计系统文档
VARIABLE_DEFINITIONS.md - CSS变量定义标准
```

#### 任务1.2: 交互行为规范 (3小时)
- 统一交互状态定义
- 定义动画和过渡规范
- 制定可访问性标准
- 建立响应式设计指南

**输出物**:
```
INTERACTION_GUIDELINES.md - 交互行为规范
ACCESSIBILITY_GUIDELINES.md - 可访问性指南
```

#### 任务1.3: 组件接口规范 (3小时)
- 明确Props接口统一
- 制定事件命名规范
- 定义组件状态管理
- 建立错误处理标准

**输出物**:
```
COMPONENT_API_STANDARD.md - 组件API标准
STATE_MANAGEMENT_GUIDE.md - 状态管理指南
```

### 阶段2: 样式系统重构 (3天)

#### 任务2.1: React包主题系统升级 (4小时)
**目标**: 将React包升级到支持auto主题

**具体工作**:
```typescript
// 需要修改的文件: packages/react/src/components/ConnectButton.tsx

interface ConnectButtonProps {
  theme?: 'light' | 'dark' | 'auto'; // 新增 'auto'
  // ... 其他props
}

// 实现auto主题逻辑
const getTheme = (propsTheme: string | undefined) => {
  if (propsTheme === 'auto') {
    return window?.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return propsTheme || 'light';
};
```

#### 任务2.2: React包功能补齐 - 下拉菜单 (6小时)
**目标**: 将Vue包的丰富下拉菜单功能移植到React包

**具体工作**:
- 添加钱包信息显示
- 添加网络状态显示
- 实现复制地址功能
- 添加余额刷新功能
- 完善断开连接操作

```typescript
// 新增的下拉菜单结构
const WalletDropdown = () => (
  <div className="btc-dropdown">
    <div className="btc-dropdown-header">
      <div className="btc-dropdown-wallet-info">
        <img src={currentWallet?.icon} alt={currentWallet?.name} />
        <span>{currentWallet?.name}</span>
      </div>
      <div className="btc-dropdown-network">
        Network: {networkDisplay}
      </div>
    </div>
    <div className="btc-dropdown-divider" />
    <div className="btc-dropdown-actions">
      <button onClick={handleCopyAddress}>Copy Address</button>
      <button onClick={handleRefreshBalance}>Refresh Balance</button>
      <button onClick={handleDisconnect}>Disconnect</button>
    </div>
  </div>
);
```

#### 任务2.3: React包状态指示器添加 (3小时)
**目标**: 在React包中添加连接状态指示器

**具体工作**:
```typescript
// 状态指示器组件
const ConnectionIndicator = ({ isConnected, isConnecting }) => (
  <div className="btc-wallet-status-indicator">
    <div className={`btc-status-dot btc-status-dot--${getStatusClass(isConnected, isConnecting)}`} />
  </div>
);
```

#### 任务2.4: 动画效果统一 (5小时)
**目标**: 确保两个包的动画效果完全一致

**具体工作**:
- 悬停状态动画 (translateY(-1px), 阴影变化)
- 图标旋转动画 (hover时旋转5度并缩放)
- 下拉菜单动画 (slideDown效果)
- 按钮加载动画
- 复制成功反馈动画

#### 任务2.5: 可访问性增强 (2小时)
**目标**: 将Vue包的可访问性特性扩展到React包

**具体工作**:
- 高对比度模式支持
- 键盘导航增强
- 屏幕阅读器优化
- 减少动画模式支持

### 阶段3: Vue包优化调整 (1天)

#### 任务3.1: Vue包细节调整 (2小时)
**目标**: 根据统一规范微调Vue包实现

**具体工作**:
- 确保CSS变量命名与React包一致
- 调整部分动画参数保持同步
- 优化一些交互细节

#### 任务3.2: 性能优化 (2小时)
**目标**: 确保统一后的性能表现

**具体工作**:
- CSS优化和压缩
- 动画性能调优
- 内存泄漏检查

### 阶段4: 测试验证 (2天)

#### 任务4.1: 视觉回归测试搭建 (4小时)
**目标**: 建立自动化视觉测试流程

**具体工作**:
```typescript
// 测试文件结构
tests/visual-regression/
├── react/
│   ├── connect-button.light.test.ts
│   ├── connect-button.dark.test.ts
│   └── connect-button.auto.test.ts
├── vue/
│   ├── connect-button.light.test.ts
│   ├── connect-button.dark.test.ts
│   └── connect-button.auto.test.ts
└── comparison/
    ├── react-vs-comparison.json
    └── vue-vs-comparison.json
```

#### 任务4.2: 交互行为测试 (3小时)
**目标**: 验证两个包的交互行为一致性

**具体工作**:
- 鼠标悬停行为测试
- 点击事件测试
- 键盘导航测试
- 触摸设备交互测试

#### 任务4.3: 跨浏览器兼容性测试 (2小时)
**目标**: 确保在各浏览器中表现一致

**测试范围**:
- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)
- 移动端浏览器

#### 任务4.4: 性能基准测试 (1小时)
**目标**: 验证统一后的性能表现

**测试指标**:
- 组件渲染时间
- 交互响应延迟
- 内存使用情况
- 包体积变化

### 阶段5: 文档和示例更新 (1天)

#### 任务5.1: 文档同步更新 (3小时)
**具体工作**:
- 更新React包文档，描述新增功能
- 更新Vue包文档，保持一致性
- 创建迁移指南 (如果需要)
- 更新API文档

#### 任务5.2: 示例项目同步 (2小时)
**具体工作**:
- 更新React示例项目
- 更新Vue示例项目
- 确保示例行为一致
- 添加新功能演示

#### 任务5.3: 发布准备 (1小时)
**具体工作**:
- 版本号更新
- CHANGELOG更新
- 发布说明准备

## 技术实施细节

### 1. 统一的CSS变量系统

```css
/* 主题无关的基础变量 */
:root {
  /* 品牌色 */
  --btc-connect-primary: #f7931a;
  --btc-connect-primary-hover: #e8840d;
  --btc-connect-primary-light: #fff4e6;

  /* 间距系统 */
  --btc-connect-spacing-xs: 4px;
  --btc-connect-spacing-sm: 8px;
  --btc-connect-spacing-md: 16px;
  --btc-connect-spacing-lg: 24px;

  /* 字体系统 */
  --btc-connect-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --btc-connect-font-size-xs: 10px;
  --btc-connect-font-size-sm: 12px;
  --btc-connect-font-size-md: 14px;
  --btc-connect-font-size-lg: 16px;

  /* 圆角系统 */
  --btc-connect-radius-sm: 4px;
  --btc-connect-radius-md: 8px;
  --btc-connect-radius-lg: 12px;

  /* 阴影系统 */
  --btc-connect-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --btc-connect-shadow-md: 0 1px 3px rgba(0, 0, 0, 0.1);
  --btc-connect-shadow-lg: 0 4px 6px rgba(0, 0, 0, 0.1);

  /* 动画系统 */
  --btc-connect-transition-fast: 0.15s ease;
  --btc-connect-transition-normal: 0.2s ease;
  --btc-connect-transition-slow: 0.3s ease;

  /* Z-index层级 */
  --btc-connect-z-dropdown: 1000;
  --btc-connect-z-modal: 1050;
  --btc-connect-z-tooltip: 1100;
}

/* light主题变量 */
:root, [data-theme="light"] {
  --btc-connect-bg-primary: #ffffff;
  --btc-connect-bg-secondary: #f8f9fa;
  --btc-connect-bg-tertiary: #e9ecef;
  --btc-connect-text-primary: #333333;
  --btc-connect-text-secondary: #6c757d;
  --btc-connect-text-tertiary: #adb5bd;
  --btc-connect-border-primary: #dee2e6;
  --btc-connect-border-secondary: #ced4da;
  --btc-connect-interactive-hover: #f8f9fa;
  --btc-connect-interactive-active: #e9ecef;
}

/* dark主题变量 */
[data-theme="dark"] {
  --btc-connect-bg-primary: #1a1a1a;
  --btc-connect-bg-secondary: #2a2a2a;
  --btc-connect-bg-tertiary: #3a3a3a;
  --btc-connect-text-primary: #ffffff;
  --btc-connect-text-secondary: #ced4da;
  --btc-connect-text-tertiary: #adb5bd;
  --btc-connect-border-primary: rgba(255, 255, 255, 0.1);
  --btc-connect-border-secondary: rgba(255, 255, 255, 0.2);
  --btc-connect-interactive-hover: #2a2a2a;
  --btc-connect-interactive-active: #3a3a3a;
}

/* auto主题 - 使用现代CSS特性 */
[data-theme="auto"] {
  --btc-connect-bg-primary: color-mix(in srgb, canvas 85%, white);
  --btc-connect-text-primary: color-mix(in srgb, canvastext 85%, black);
  --btc-connect-border-primary: color-mix(in srgb, canvas 50%, white);
}

@media (prefers-color-scheme: dark) {
  [data-theme="auto"] {
    --btc-connect-bg-primary: color-mix(in srgb, canvas 15%, black);
    --btc-connect-text-primary: color-mix(in srgb, canvastext 15%, white);
    --btc-connect-border-primary: color-mix(in srgb, canvas 30%, black);
  }
}
```

### 2. 统一的组件状态定义

```typescript
// 统一的组件状态接口
export interface ComponentState {
  isConnected: boolean;
  isConnecting: boolean;
  currentWallet: WalletInfo | null;
  error: Error | null;
  theme: 'light' | 'dark' | 'auto';
  showDropdown: boolean;
  copiedAddress: boolean;
  balanceLoading: boolean;
}

// 统一的组件事件接口
export interface ComponentEvents {
  connect: (walletId: string) => void;
  disconnect: () => void;
  error: (error: Error) => void;
  addressCopied: (address: string) => void;
  balanceRefreshed: () => void;
}

// 统一的Props接口
export interface ConnectButtonProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'select' | 'button' | 'compact';
  label?: string;
  disabled?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  showBalance?: boolean;
  showAddress?: boolean;
  balancePrecision?: number;
  className?: string;
  style?: React.CSSProperties | Record<string, any>;
  onConnect?: (walletId: string) => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  onAddressCopied?: (address: string) => void;
  onBalanceRefreshed?: () => void;
}
```

### 3. 统一的动画规范

```css
/* 统一的动画定义 */
@keyframes btc-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes btc-fadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes btc-slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes btc-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 统一的悬停效果 */
.btc-connect-hover {
  transition: all var(--btc-connect-transition-fast);
}

.btc-connect:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--btc-connect-shadow-md);
}

.btc-connect:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: var(--btc-connect-shadow-sm);
}

/* 统一的图标动画 */
.btc-icon-animated {
  transition: transform var(--btc-connect-transition-normal);
}

.btc-connect:hover .btc-icon-animated {
  transform: rotate(5deg) scale(1.1);
}
```

## 风险评估与缓解策略

### 主要风险点

#### 1. 向后兼容性风险
**风险描述**: React包的架构调整可能影响现有用户代码
**影响程度**: 中等
**缓解策略**:
- 保持所有现有Props接口不变
- 新增功能通过可选Props提供
- 提供详细的迁移文档
- 设置充分的测试覆盖

#### 2. 性能风险
**风险描述**: 功能丰富可能导致包体积和性能开销增加
**影响程度**: 中等
**缓解策略**:
- 使用tree-shaking优化
- 按需加载非核心功能
- 建立性能基准测试
- 监控关键性能指标

#### 3. 浏览器兼容性风险
**风险描述**: 现代CSS特性在旧浏览器中可能不支持
**影响程度**: 中等
**缓解策略**:
- 优雅降级方案
- 提供polyfill支持
- 明确支持的浏览器版本
- 提供兼容性检查工具

#### 4. 维护成本风险
**风险描述**: 维护两套相似的代码可能增加工作负担
**影响程度**: 低
**缓解策略**:
- 建立自动化测试流程
- 统一的设计规范文档
- 代码生成工具
- 组件库管理流程

### 成功衡量标准

#### 1. 视觉一致性
- [ ] 两个包在相同主题下外观完全一致
- [ ] 所有交互状态的视觉效果一致
- [ ] 响应式表现一致
- [ ] 动画效果完全同步

#### 2. 功能对等性
- [ ] 两个包提供相同的功能集合
- [ ] 交互行为完全一致
- [ ] 错误处理机制统一
- [ ] 事件触发逻辑一致

#### 3. 性能标准
- [ ] 组件渲染时间不增加超过10%
- [ ] 交互响应延迟低于100ms
- [ ] 包体积增长控制在合理范围
- [ ] 内存使用无明显增加

#### 4. 兼容性标准
- [ ] 支持主流浏览器最新版本
- [ ] 在旧浏览器中优雅降级
- [ ] 移动端设备表现良好
- [ ] 屏幕阅读器兼容性

## 时间安排与里程碑

### 总体时间安排
- **项目总工期**: 9个工作日
- **关键里程碑**: 3个主要节点
- **缓冲时间**: 2天 (用于测试和问题修复)

### 详细时间线

#### 第1周 (5天)

**Day 1**: 设计规范统一
- 上午: 制定设计系统和颜色规范
- 下午: 建立交互行为规范和组件接口标准

**Day 2**: React包主题系统升级
- 上午: 实现auto主题支持
- 下午: 主题切换逻辑和CSS变量系统

**Day 3**: React包功能补齐 - 下拉菜单
- 上午: 下拉菜单UI实现
- 下午: 功能逻辑实现 (复制、刷新、断开)

**Day 4**: React包功能完善
- 上午: 状态指示器实现
- 下午: 动画效果统一和优化

**Day 5**: 可访问性增强
- 上午: 可访问性特性实现
- 下午: 初步测试和问题修复

#### 第2周 (4天)

**Day 6**: Vue包优化和调整
- 上午: Vue包细节调整和同步
- 下午: 性能优化和代码清理

**Day 7**: 测试体系建设
- 上午: 视觉回归测试搭建
- 下午: 交互行为测试实现

**Day 8**: 兼容性和性能测试
- 上午: 跨浏览器兼容性测试
- 下午: 性能基准测试和优化

**Day 9**: 文档和发布准备
- 上午: 文档更新和示例同步
- 下午: 发布准备和项目总结

### 关键里程碑

#### 里程碑1: 设计系统完成 (Day 1)
**验收标准**:
- [ ] 设计系统文档完成
- [ ] CSS变量系统建立
- [ ] 组件接口规范确定

#### 里程碑2: React包功能完成 (Day 5)
**验收标准**:
- [ ] React包支持所有Vue包功能
- [ ] 视觉表现与Vue包一致
- [ ] 所有测试用例通过

#### 里程碑3: 项目完成 (Day 9)
**验收标准**:
- [ ] 两个包完全统一
- [ ] 所有测试验证通过
- [ ] 文档和示例更新完成

## 质量保证

### 代码质量标准
- TypeScript严格模式
- ESLint规则遵循
- 代码覆盖率 > 90%
- 性能基准达标

### 测试策略
- 单元测试覆盖所有组件
- 集成测试验证交互流程
- 视觉回归测试确保一致性
- 跨浏览器兼容性测试

### 审查流程
- 代码审查必须通过
- 设计审查确保一致性
- 性能审查确保标准
- 文档审查确保完整性

## 后续维护计划

### 版本发布策略
- 主要功能更新: 小版本号递增
- 重大架构变更: 主版本号递增
- Bug修复: 补丁版本号递增

### 长期维护重点
- 新浏览器版本适配
- Web标准演进跟进
- 用户反馈收集和处理
- 性能持续优化

---

**文档版本**: v1.0
**创建日期**: 2025-10-31
**最后更新**: 2025-10-31
**负责人**: btc-connect 开发团队