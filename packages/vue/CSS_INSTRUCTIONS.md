# CSS 样式使用指南

## 🎨 样式引入方式

@btc-connect/vue 提供了两种 CSS 使用方式：

### 1. 推荐方式：外部 CSS 引入

在你的项目中引入我们的 CSS 文件，这样可以获得更好的性能和缓存效果：

#### Nuxt 3
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  css: [
    '@btc-connect/vue/style.css' // 引入所有样式
  ]
})
```

#### Vue 3
```typescript
// main.ts
import '@btc-connect/vue/style.css'

createApp(App).mount('#app')
```

#### Vite
```typescript
// vite.config.ts
export default defineConfig({
  css: {
    postcss: {},
  },
  // 或者直接在 main.ts 中导入
})
```

#### 按需引入
如果你只想引入特定组件的样式：
```typescript
import '@btc-connect/vue/styles/connect-button.css'
```

### 2. 动态注入方式（默认）

组件会自动注入所需的样式，无需手动引入 CSS。这种方式适合：
- 快速原型开发
- 避免样式冲突
- 按需加载

## 📦 CSS 文件结构

```
packages/vue/dist/
├── style.css              # 主样式文件（推荐引入）
└── styles/                # 按需样式文件
    └── connect-button.css  # ConnectButton 组件样式
```

## 🎯 最佳实践

### 生产环境推荐
```typescript
// 使用外部 CSS 文件
import '@btc-connect/vue/style.css'
```

### 开发环境
```typescript
// 可以选择动态注入，无需手动引入 CSS
```

### 按需定制
如果你想自定义样式，可以：
1. 引入基础 CSS
2. 覆盖 CSS 变量
3. 或完全自定义样式

```css
/* 覆盖主题色 */
:root {
  --btc-connect-primary: #your-color;
}
```

## 🔧 CSS 变量

我们提供了完整的 CSS 变量系统，支持主题定制：

```css
:root {
  /* 主色调 */
  --btc-connect-primary: #f7931a;
  --btc-connect-primary-hover: #e8840d;

  /* 中性色 */
  --btc-connect-gray-100: #e9ecef;
  --btc-connect-gray-200: #dee2e6;

  /* 间距 */
  --btc-connect-spacing-sm: 8px;
  --btc-connect-spacing-md: 16px;

  /* 边框圆角 */
  --btc-connect-border-radius: 8px;

  /* 过渡 */
  --btc-connect-transition: all 0.15s ease;
}
```

## 📱 响应式支持

CSS 文件包含完整的响应式支持：
- 移动端适配
- 暗色主题支持
- 减少动画偏好支持
- 高对比度模式支持

## ⚡ 性能对比

| 方式 | 包大小 | 缓存 | 运行时性能 | 开发体验 |
|------|--------|------|------------|----------|
| 外部 CSS | 较小 | ✅ | ⚡⚡⚡ | ⚡⚡ |
| 动态注入 | 较大 | ❌ | ⚡ | ⚡⚡⚡ |

## 🚀 迁移指南

### 从动态注入迁移到外部 CSS

1. **移除动态样式依赖**
   ```typescript
   // 移除这些组件中的样式注入逻辑
   // AddressDisplay, BalanceDisplay, etc.
   ```

2. **添加 CSS 导入**
   ```typescript
   import '@btc-connect/vue/style.css'
   ```

3. **验证样式正常工作**
   - 检查组件样式
   - 测试主题切换
   - 验证响应式效果

## ❓ 常见问题

### Q: 样式不生效？
A: 确保 CSS 文件被正确引入，并且没有样式覆盖问题。

### Q: 如何自定义样式？
A: 通过 CSS 变量覆盖，或者直接覆盖组件类名。

### Q: 是否支持 SSR？
A: 两种方式都完全支持 SSR。

### Q: 如何避免样式冲突？
A: 使用 CSS 变量或 CSS Modules 进行样式隔离。