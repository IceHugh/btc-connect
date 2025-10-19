#!/bin/bash

# 版本号更新脚本
# 使用方法:
# ./scripts/update-version.sh patch  # 更新补丁版本
# ./scripts/update-version.sh minor  # 更新次版本
# ./scripts/update-version.sh major  # 更新主版本
# ./scripts/update-version.sh 1.2.3 # 设置特定版本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 检查参数
if [ $# -eq 0 ] || [[ "$1" == "--help" || "$1" == "-h" ]]; then
    echo "使用方法:"
    echo "  $0 patch                    # 更新补丁版本 (0.2.0 -> 0.2.1)"
    echo "  $0 minor                    # 更新次版本 (0.2.1 -> 0.3.0)"
    echo "  $0 major                    # 更新主版本 (0.2.1 -> 1.0.0)"
    echo "  $0 1.2.3                   # 设置特定版本"
    echo "  $0 patch --push            # 更新并推送到远程"
    echo ""
    echo "示例:"
    echo "  $0 patch --push            # 补丁版本更新并推送"
    exit 0
fi

VERSION_TYPE=$1
PUSH_TO_REMOTE=false

# 检查是否需要推送
if [[ "$2" == "--push" || "$2" == "-p" ]]; then
    PUSH_TO_REMOTE=true
fi

# 获取当前版本
CURRENT_VERSION=$(node -p "require('./packages/core/package.json').version")
print_info "当前版本: $CURRENT_VERSION"
print_info "更新类型: $VERSION_TYPE"

# 计算新版本号
NEW_VERSION=$(node -e "
const current = '$CURRENT_VERSION';
const type = '$VERSION_TYPE';

function parseVersion(v) {
  const match = v.match(/^(\\d+)\\.(\\d+)\\.(\\d+)/);
  if (!match) throw new Error('Invalid version: ' + v);
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10)
  };
}

function formatVersion(v) {
  return v.major + '.' + v.minor + '.' + v.patch;
}

function updateVersion(current, type) {
  const version = parseVersion(current);

  if (type.match(/^\\d+\\.\\d+\\.\\d+$/)) {
    return type; // 特定版本号
  }

  switch (type) {
    case 'major':
      version.major += 1;
      version.minor = 0;
      version.patch = 0;
      break;
    case 'minor':
      version.minor += 1;
      version.patch = 0;
      break;
    case 'patch':
      version.patch += 1;
      break;
    default:
      throw new Error('Invalid version type: ' + type);
  }

  return formatVersion(version);
}

console.log(updateVersion(current, type));
")

print_info "新版本: $NEW_VERSION"

# 更新各个包的版本号
PACKAGES=("packages/core" "packages/react" "packages/vue")
UPDATED_PACKAGES=()

for package_path in "${PACKAGES[@]}"; do
    package_file="$package_path/package.json"

    if [ -f "$package_file" ]; then
        # 读取当前版本
        current_pkg_version=$(node -p "require('./$package_file').version")

        if [ "$current_pkg_version" != "$NEW_VERSION" ]; then
            # 更新版本号
            if [[ "$OSTYPE" == "darwin"* ]]; then
                # macOS
                sed -i '' "s/\"version\": \"$current_pkg_version\"/\"version\": \"$NEW_VERSION\"/" "$package_file"
            else
                # Linux
                sed -i "s/\"version\": \"$current_pkg_version\"/\"version\": \"$NEW_VERSION\"/" "$package_file"
            fi

            package_name=$(node -p "require('./$package_file').name")
            print_success "$package_name: $current_pkg_version → $NEW_VERSION"
            UPDATED_PACKAGES+=("$package_name")
        else
            package_name=$(node -p "require('./$package_file').name")
            print_warning "$package_name: 版本号已是最新 ($NEW_VERSION)"
        fi
    else
        print_error "包文件不存在: $package_file"
        exit 1
    fi
done

# 如果有更新，提交更改
if [ ${#UPDATED_PACKAGES[@]} -gt 0 ]; then
    print_info "提交版本更新..."

    # 添加修改的文件
    git add packages/*/package.json

    # 创建提交信息
    COMMIT_MESSAGE="chore: 更新所有子包版本号到 v$NEW_VERSION

$(printf '  - %s\n' "${UPDATED_PACKAGES[@]}")准备发布到 NPM"

    # 提交
    git commit -m "$COMMIT_MESSAGE"
    print_success "版本更新已提交"

    # 推送到远程仓库
    if [ "$PUSH_TO_REMOTE" = true ]; then
        print_info "推送到远程仓库..."
        git push origin main
        print_success "已推送到远程仓库，将触发 CI/CD 自动发布"
    else
        print_warning "使用 --push 参数可以自动推送到远程仓库"
        print_info "示例: $0 $VERSION_TYPE --push"
    fi
else
    print_info "没有包需要更新"
fi

print_success "版本更新完成!"
print_info "新版本号: $NEW_VERSION"