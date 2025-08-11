# BTC Connect UI

这是一个基于 Lit 的 Web Components 库，提供了比特币钱包连接相关的 UI 组件。

## 组件

### Connect Button (`connect-button`)

连接钱包的按钮组件。

**属性：**
- `label` (string): 按钮显示的文本，默认为 "Connect Wallet"

**使用示例：**
```html
<connect-button label="连接比特币钱包"></connect-button>
```

### Wallet Modal (`wallet-modal`)

钱包选择模态框组件。

**属性：**
- `open` (boolean): 控制模态框的显示/隐藏状态

**使用示例：**
```html
<wallet-modal id="walletModal" open="false"></wallet-modal>

<script>
// 打开模态框
document.getElementById('walletModal').open = true;

// 关闭模态框
document.getElementById('walletModal').open = false;
</script>
```

## 安装和构建

```bash
# 安装依赖
bun install

# 构建组件
bun run build
```

## 运行示例

### 开发环境（推荐）

```bash
# 启动开发服务器
bun run dev

# 然后在浏览器中访问
# http://localhost:5173/
```

### 预览构建结果

```bash
# 构建并预览
bun run build
bun run preview

# 然后访问 http://localhost:4173/
```

## 在项目中使用

### 1. 直接引入构建后的文件

```html
<!DOCTYPE html>
<html>
<head>
    <script type="module">
        import './node_modules/@btc-connect/ui/dist/connect-button.es.js';
        import './node_modules/@btc-connect/ui/dist/wallet-modal.es.js';
    </script>
</head>
<body>
    <connect-button label="连接钱包"></connect-button>
    <wallet-modal id="modal" open="false"></wallet-modal>
</body>
</html>
```

### 2. 在 JavaScript 模块中使用

```javascript
import '@btc-connect/ui/dist/connect-button.es.js';
import '@btc-connect/ui/dist/wallet-modal.es.js';

// 现在可以在页面中使用组件了
document.body.innerHTML = `
    <connect-button label="连接钱包"></connect-button>
    <wallet-modal id="modal" open="false"></wallet-modal>
`;
```

## 组合使用示例

```html
<connect-button id="connectBtn" label="点击连接钱包"></connect-button>
<wallet-modal id="walletModal" open="false"></wallet-modal>

<script>
document.getElementById('connectBtn').addEventListener('click', function() {
    document.getElementById('walletModal').open = true;
});

// 点击模态框外部或关闭按钮时关闭模态框
document.getElementById('walletModal').addEventListener('click', function(e) {
    if (e.target.classList.contains('close') || e.target.classList.contains('modal')) {
        this.open = false;
    }
});
</script>
```

## 开发

```bash
# 启动开发服务器
bun run dev

# 预览构建结果
bun run preview
```

## 技术栈

- [Lit](https://lit.dev/) - Web Components 框架
- [TypeScript](https://www.typescriptlang.org/) - 类型安全
- [Vite](https://vitejs.dev/) - 构建工具
