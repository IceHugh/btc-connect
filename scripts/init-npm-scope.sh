#!/bin/bash

# NPM 作用域初始化脚本
# 用于首次初始化 @btc-connect NPM 作用域

set -e

echo "🚀 开始初始化 @btc-connect NPM 作用域..."

# 检查是否已登录 NPM
echo "📋 检查 NPM 登录状态..."
if ! npm whoami > /dev/null 2>&1; then
    echo "❌ 未登录 NPM，请先执行: npm login"
    exit 1
fi

NPM_USER=$(npm whoami)
echo "✅ 当前 NPM 用户: $NPM_USER"

# 检查包是否存在
echo "🔍 检查 @btc-connect/core 包状态..."
if npm view @btc-connect/core > /dev/null 2>&1; then
    echo "✅ @btc-connect/core 已存在于 NPM"
    echo "作用域已初始化，可以直接使用 CI/CD 发布"
    exit 0
fi

echo "⚠️  @btc-connect/core 包不存在，需要首次发布"

# 构建包
echo "🔨 构建核心包..."
cd packages/core
bun install
bun run build

# 检查构建产物
if [ ! -f "dist/index.js" ]; then
    echo "❌ 构建失败，找不到 dist/index.js"
    exit 1
fi

echo "✅ 构建完成"

# 显示发布信息
echo "📦 发布信息："
echo "  包名: @btc-connect/core"
echo "  版本: $(cat package.json | jq -r .version)"
echo "  用户: $NPM_USER"
echo "  权限: public"

# 确认发布
read -p "确认发布 @btc-connect/core 到 NPM? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 用户取消发布"
    exit 1
fi

# 发布包
echo "🚀 发布到 NPM..."
npm publish --access public --verbose

echo "🎉 @btc-connect/core 发布成功！"
echo ""
echo "📋 后续步骤："
echo "1. 作用域 @btc-connect 已初始化"
echo "2. CI/CD 现在可以正常发布其他包"
echo "3. 可以触发 GitHub Actions 进行自动发布"
echo ""
echo "🔗 查看发布包: https://www.npmjs.com/package/@btc-connect/core"