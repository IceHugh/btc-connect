#!/usr/bin/env python3
"""
btc-connect包安装脚本 v2.1
自动安装最新版本的btc-connect包（最低要求v0.4.0+），支持网络切换功能和Vue架构优化
"""
import subprocess
import sys
import json
import re
from pathlib import Path

# 🆕 最低版本要求
MIN_VERSIONS = {
    "@btc-connect/core": "0.4.0",
    "@btc-connect/react": "0.4.0",
    "@btc-connect/vue": "0.4.0"
}

def get_latest_version(package_name):
    """获取指定包的最新版本"""
    try:
        result = subprocess.run(['npm', 'view', package_name, 'version'],
                              capture_output=True, text=True, timeout=30)
        if result.returncode == 0:
            return result.stdout.strip()
    except (subprocess.TimeoutExpired, subprocess.CalledProcessError):
        pass
    return "latest"  # 总是安装最新版本

def detect_project_type():
    """检测项目类型，支持Nuxt 3"""
    project_path = Path(".")
    package_json = project_path / "package.json"

    if package_json.exists():
        try:
            with open(package_json) as f:
                data = json.load(f)
                deps = data.get("dependencies", {})
                dev_deps = data.get("devDependencies", {})

                # 🆕 更精确的Nuxt 3检测
                if "next" in deps or "next" in dev_deps:
                    return "nextjs"
                elif "nuxt" in deps or "nuxt" in dev_deps:
                    # 检查是否为Nuxt 3
                    nuxt_version = deps.get("nuxt") or dev_deps.get("nuxt")
                    if nuxt_version and re.match(r'^[3-9]\.', nuxt_version):
                        return "nuxt3"
                    return "nuxt"
                elif "react" in deps or "react" in dev_deps:
                    return "react"
                elif "vue" in deps or "vue" in dev_deps:
                    return "vue"
        except:
            pass

    return "unknown"

def install_btc_connect(project_type="auto", package_manager="auto"):
    """安装btc-connect包"""

    # 检测项目类型
    if project_type == "auto":
        project_type = detect_project_type()
        print(f"检测到项目类型: {project_type}")

    # 检测包管理器，🆕 优先推荐Bun
    if package_manager == "auto":
        if Path("bun.lockb").exists():
            package_manager = "bun"
        elif Path("yarn.lock").exists():
            package_manager = "yarn"
        elif Path("package-lock.json").exists():
            package_manager = "npm"
        else:
            package_manager = "bun"  # 🆕 默认推荐使用bun
        print(f"使用包管理器: {package_manager}")

    # 获取最新版本信息（仅用于显示）
    core_latest = get_latest_version("@btc-connect/core")
    print(f"🆕 BTC-Connect Core 最新版本: {core_latest}")

    # 确定要安装的包 - 总是安装最新版本
    packages = []
    packages.append("@btc-connect/core@latest")

    if project_type in ["react", "nextjs"]:
        react_latest = get_latest_version("@btc-connect/react")
        print(f"🆕 BTC-Connect React 最新版本: {react_latest}")
        packages.append("@btc-connect/react@latest")

    # 🆕 支持Nuxt 3和Vue v0.4.0+
    if project_type in ["vue", "nuxt", "nuxt3"]:
        vue_latest = get_latest_version("@btc-connect/vue")
        print(f"🆕 BTC-Connect Vue 最新版本: {vue_latest} (架构优化版本)")
        packages.append("@btc-connect/vue@latest")

        # 🆕 特殊说明Nuxt 3支持
        if project_type == "nuxt3":
            print("📝 检测到Nuxt 3项目，将使用客户端插件模式配置")

    # 安装包
    install_cmd = {
        "npm": ["npm", "install"],
        "yarn": ["yarn", "add"],
        "bun": ["bun", "add"]
    }

    cmd = install_cmd[package_manager] + packages

    print(f"执行安装命令: {' '.join(cmd)}")

    try:
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        print("✅ 安装成功！")

        # 显示安装的包
        for pkg in packages:
            print(f"  - {pkg}")

        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ 安装失败: {e}")
        if e.stderr:
            print(f"错误信息: {e.stderr}")
        return False

def check_installation():
    """检查安装结果和版本兼容性"""
    package_json = Path("package.json")
    if not package_json.exists():
        print("❌ 未找到package.json文件")
        return False

    try:
        with open(package_json) as f:
            data = json.load(f)
            deps = data.get("dependencies", {})

            btc_packages = []
            version_issues = []

            for pkg in ["@btc-connect/core", "@btc-connect/react", "@btc-connect/vue"]:
                if pkg in deps:
                    version = deps[pkg]
                    btc_packages.append(f"{pkg}: {version}")

                    # 检查版本是否满足最低要求
                    if pkg in MIN_VERSIONS:
                        min_version = MIN_VERSIONS[pkg]
                        # 简单版本比较（去除^或~前缀）
                        installed_version = version.lstrip('^~')
                        if installed_version == "latest":
                            continue  # latest版本总是满足要求

                        # 这里可以添加更复杂的版本比较逻辑
                        # 简化处理：如果明确指定版本且低于最低版本，则警告
                        if installed_version < min_version.replace('v', ''):
                            version_issues.append(f"{pkg}: {version} (建议 >= {min_version})")

            if btc_packages:
                print("✅ 已安装的btc-connect包:")
                for pkg in btc_packages:
                    print(f"  - {pkg}")

                if version_issues:
                    print("\n⚠️ 版本兼容性提醒:")
                    for issue in version_issues:
                        print(f"  - {issue}")
                    print("\n💡 建议使用 'npm update' 或 'bun update' 更新到最新版本")

                return True
            else:
                print("❌ 未找到btc-connect包")
                return False
    except Exception as e:
        print(f"❌ 检查安装结果失败: {e}")
        return False

def main():
    """主函数"""
    print("=== BTC-Connect 包安装工具 ===\n")

    # 解析命令行参数
    project_type = "auto"
    package_manager = "auto"

    if len(sys.argv) > 1:
        if sys.argv[1] in ["react", "vue", "nextjs", "nuxt", "nuxt3", "core"]:
            project_type = sys.argv[1]

    if len(sys.argv) > 2:
        if sys.argv[2] in ["npm", "yarn", "bun", "pnpm"]:
            package_manager = sys.argv[2]

    # 执行安装
    success = install_btc_connect(project_type, package_manager)

    if success:
        print("\n=== 验证安装 ===")
        check_installation()

        print("\n=== 🚀 下一步 ===")
        print("1. 📖 查看框架配置指南: references/framework_setup.md")
        print("2. 🌐 如需SSR支持，查看: references/ssr_config.md")
        print("3. 🔄 网络切换功能，查看: references/network_switching.md")
        print("4. 👛 集成钱包，查看: references/unisat_integration.md 或 references/okx_integration.md")
        print("5. 📝 查看代码示例: assets/code_examples/")
        print("6. 🧪 运行测试: python scripts/test_wallet_connection.py")
    else:
        print("\n❌ 安装失败，请检查错误信息并重试")
        sys.exit(1)

if __name__ == "__main__":
    main()