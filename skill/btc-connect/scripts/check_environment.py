#!/usr/bin/env python3
"""
项目环境检查脚本
用于检查当前项目的环境和btc-connect集成状态
"""
import os
import json
import subprocess
from pathlib import Path

def detect_project_type():
    """检测项目类型"""
    project_path = Path(".")
    package_json = project_path / "package.json"

    if package_json.exists():
        try:
            with open(package_json) as f:
                data = json.load(f)
                deps = data.get("dependencies", {})
                dev_deps = data.get("devDependencies", {})

                all_deps = {**deps, **dev_deps}

                if "next" in all_deps:
                    return "nextjs"
                elif "nuxt" in all_deps:
                    return "nuxt"
                elif "react" in all_deps:
                    return "react"
                elif "vue" in all_deps:
                    return "vue"
                elif any("express" in key for key in all_deps):
                    return "nodejs"
        except:
            pass

    return "unknown"

def detect_package_manager():
    """检测包管理器"""
    if Path("bun.lockb").exists():
        return "bun"
    elif Path("yarn.lock").exists():
        return "yarn"
    elif Path("package-lock.json").exists():
        return "npm"
    else:
        # 检查命令是否可用
        for pm in ["bun", "yarn", "npm"]:
            try:
                subprocess.run([pm, "--version"],
                             capture_output=True, check=True, timeout=5)
                return pm
            except:
                continue
        return "unknown"

def check_btc_connect_installed():
    """检查btc-connect是否已安装"""
    package_json = Path("package.json")
    if not package_json.exists():
        return False, {}

    try:
        with open(package_json) as f:
            data = json.load(f)
            deps = data.get("dependencies", {})
            dev_deps = data.get("devDependencies", {})

            all_deps = {**deps, **dev_deps}

            btc_packages = {}
            for pkg in ["@btc-connect/core", "@btc-connect/react", "@btc-connect/vue"]:
                if pkg in all_deps:
                    btc_packages[pkg] = all_deps[pkg]

            return len(btc_packages) > 0, btc_packages
    except:
        return False, {}

def check_configuration_files():
    """检查配置文件"""
    configs = {
        "typescript": "tsconfig.json",
        "vite": "vite.config.js",
        "webpack": "webpack.config.js",
        "next": "next.config.js",
        "nuxt": "nuxt.config.ts"
    }

    found = {}
    for name, file in configs.items():
        if Path(file).exists():
            found[name] = file

    return found

def check_ssr_setup():
    """检查SSR设置"""
    project_type = detect_project_type()
    ssr_indicators = []

    if project_type == "nextjs":
        # 检查Next.js SSR指示器
        if Path("pages").exists():
            ssr_indicators.append("pages directory (SSR)")
        if Path("app").exists():
            ssr_indicators.append("app directory (App Router)")

    elif project_type == "nuxt":
        # 检查Nuxt SSR指示器
        if Path("pages").exists():
            ssr_indicators.append("pages directory")
        if Path("server").exists():
            ssr_indicators.append("server directory")

    return ssr_indicators

def analyze_btc_connect_usage():
    """分析btc-connect的使用情况"""
    usage = {
        "imports": [],
        "providers": [],
        "hooks": [],
        "composables": []
    }

    # 搜索代码文件
    code_extensions = [".js", ".jsx", ".ts", ".tsx", ".vue"]
    for ext in code_extensions:
        for file_path in Path(".").rglob(f"*{ext}"):
            if "node_modules" in str(file_path):
                continue

            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                    # 检查导入
                    if "@btc-connect" in content:
                        usage["imports"].append(str(file_path))

                    # 检查React Provider
                    if "BTCWalletProvider" in content:
                        usage["providers"].append(str(file_path))

                    # 检查React Hooks
                    hooks = ["useWallet", "useNetwork", "useAccount", "useSignature", "useTransactions"]
                    for hook in hooks:
                        if hook in content:
                            usage["hooks"].append(str(file_path))
                            break

                    # 检查Vue Composables
                    composables = ["useWallet", "useNetwork", "useAccount"]
                    for comp in composables:
                        if comp in content:
                            usage["composables"].append(str(file_path))
                            break

            except:
                continue

    return usage

def generate_report():
    """生成环境报告"""
    print("=== BTC-Connect 环境检查报告 ===\n")

    # 项目信息
    project_type = detect_project_type()
    package_manager = detect_package_manager()

    print(f"📁 项目类型: {project_type}")
    print(f"📦 包管理器: {package_manager}")
    print()

    # BTC-Connect 安装状态
    print("=== BTC-Connect 安装状态 ===")
    installed, packages = check_btc_connect_installed()

    if installed:
        print("✅ 已安装的btc-connect包:")
        for pkg, version in packages.items():
            print(f"  - {pkg}: {version}")
    else:
        print("❌ 未检测到btc-connect包安装")
        print("💡 运行以下命令安装:")
        print("   python scripts/install_packages.py")
    print()

    # 配置文件检查
    print("=== 配置文件 ===")
    configs = check_configuration_files()
    if configs:
        for config_type, file in configs.items():
            print(f"✅ {config_type}: {file}")
    else:
        print("❌ 未找到常见配置文件")
    print()

    # SSR设置检查
    print("=== SSR 环境检查 ===")
    ssr_indicators = check_ssr_setup()
    if ssr_indicators:
        print("✅ 检测到SSR环境:")
        for indicator in ssr_indicators:
            print(f"  - {indicator}")
    else:
        print("ℹ️  未检测到SSR环境或配置")
    print()

    # 使用情况分析
    print("=== BTC-Connect 使用情况 ===")
    usage = analyze_btc_connect_usage()

    if usage["imports"]:
        print(f"✅ 在 {len(usage['imports'])} 个文件中找到btc-connect导入:")
        for file in usage["imports"][:5]:  # 只显示前5个
            print(f"  - {file}")
        if len(usage["imports"]) > 5:
            print(f"  ... 还有 {len(usage['imports']) - 5} 个文件")
    else:
        print("❌ 未找到btc-connect的使用")

    if usage["providers"]:
        print(f"✅ 在 {len(usage['providers'])} 个文件中找到Provider配置:")
        for file in usage["providers"]:
            print(f"  - {file}")

    if usage["hooks"]:
        print(f"✅ 在 {len(usage['hooks'])} 个文件中找到React Hooks使用:")
        for file in usage["hooks"][:3]:
            print(f"  - {file}")

    if usage["composables"]:
        print(f"✅ 在 {len(usage['composables'])} 个文件中找到Vue Composables使用:")
        for file in usage["composables"][:3]:
            print(f"  - {file}")

    print()

    # 建议
    print("=== 建议 ===")
    if not installed:
        print("💡 安装btc-connect包")
        print("   运行: python scripts/install_packages.py")
        print()

    if project_type in ["nextjs", "nuxt"] and not usage["imports"]:
        print("💡 配置SSR环境")
        print("   查看文档: references/ssr_config.md")
        print()

    if installed and not usage["imports"]:
        print("💡 开始集成btc-connect")
        print("   查看文档: references/framework_setup.md")
        print()

    if installed and usage["imports"]:
        print("✅ 项目已配置btc-connect")
        print("   如遇问题，查看: references/troubleshooting.md")
        print()

def main():
    """主函数"""
    try:
        generate_report()
    except KeyboardInterrupt:
        print("\n检查已中断")
    except Exception as e:
        print(f"❌ 检查过程中出现错误: {e}")

if __name__ == "__main__":
    main()