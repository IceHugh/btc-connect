#!/usr/bin/env python3
"""
版本检查脚本
用于检查btc-connect包的版本兼容性
"""
import subprocess
import sys
import json
from pathlib import Path
from typing import Dict, List, Optional, Tuple

def get_package_info(package_name: str) -> Optional[Dict]:
    """获取包的详细信息"""
    try:
        result = subprocess.run(['npm', 'view', package_name, '--json'],
                              capture_output=True, text=True, timeout=30)
        if result.returncode == 0:
            return json.loads(result.stdout)
    except (subprocess.TimeoutExpired, subprocess.CalledProcessError, json.JSONDecodeError):
        pass
    return None

def get_installed_version(package_name: str) -> Optional[str]:
    """获取已安装的包版本"""
    try:
        result = subprocess.run(['npm', 'list', package_name, '--json'],
                              capture_output=True, text=True, timeout=30)
        if result.returncode == 0:
            data = json.loads(result.stdout)

            # 在依赖树中查找包
            if 'dependencies' in data:
                def find_package(deps, target):
                    for name, info in deps.items():
                        if name == target:
                            return info.get('version')
                        if 'dependencies' in info:
                            result = find_package(info['dependencies'], target)
                            if result:
                                return result
                    return None

                return find_package(data, package_name)
    except (subprocess.TimeoutExpired, subprocess.CalledProcessError, json.JSONDecodeError):
        pass
    return None

def check_version_compatibility(core_version: str, react_version: str, vue_version: str) -> List[str]:
    """检查版本兼容性"""
    issues = []

    # 移除版本前缀 (^, ~, >=)
    def clean_version(version):
        return version.lstrip('^~>=').split('-')[0]

    core_clean = clean_version(core_version)
    react_clean = clean_version(react_version) if react_version else None
    vue_clean = clean_version(vue_version) if vue_version else None

    # 检查主版本号一致性
    def get_major(version):
        return int(version.split('.')[0]) if version else 0

    def get_minor(version):
        return int(version.split('.')[1]) if version and len(version.split('.')) > 1 else 0

    core_major = get_major(core_clean)
    core_minor = get_minor(core_clean)

    # React包兼容性检查
    if react_clean:
        react_major = get_major(react_clean)
        react_minor = get_minor(react_clean)

        if react_major != core_major:
            issues.append(f"React包主版本({react_major})与core包主版本({core_major})不一致")
        elif abs(react_minor - core_minor) > 2:
            issues.append(f"React包版本({react_clean})与core包版本({core_clean})差异较大")

    # Vue包兼容性检查
    if vue_clean:
        vue_major = get_major(vue_clean)
        vue_minor = get_minor(vue_clean)

        if vue_major != core_major:
            issues.append(f"Vue包主版本({vue_major})与core包主版本({core_major})不一致")
        elif abs(vue_minor - core_minor) > 2:
            issues.append(f"Vue包版本({vue_clean})与core包版本({core_clean})差异较大")

    return issues

def format_version_info(package_name: str, installed: Optional[str], latest: Optional[str]) -> str:
    """格式化版本信息"""
    if installed and latest:
        if installed == latest:
            return f"✅ {package_name}: {installed} (最新)"
        else:
            return f"⚠️  {package_name}: {installed} (最新: {latest})"
    elif installed:
        return f"✅ {package_name}: {installed}"
    elif latest:
        return f"❌ {package_name}: 未安装 (最新: {latest})"
    else:
        return f"❌ {package_name}: 未找到版本信息"

def check_btc_connect_versions() -> Dict[str, Dict]:
    """检查btc-connect相关包的版本"""
    packages = ["@btc-connect/core", "@btc-connect/react", "@btc-connect/vue"]
    results = {}

    print("🔍 检查btc-connect包版本...")

    for package in packages:
        print(f"\n📦 检查 {package}...")

        # 获取最新版本信息
        package_info = get_package_info(package)
        latest_version = package_info.get('version') if package_info else None

        # 获取已安装版本
        installed_version = get_installed_version(package)

        # 存储结果
        results[package] = {
            'installed': installed_version,
            'latest': latest_version,
            'info': package_info or {}
        }

        # 显示结果
        status = format_version_info(package, installed_version, latest_version)
        print(f"   {status}")

        # 显示详细信息
        if package_info:
            description = package_info.get('description', '')
            if description:
                print(f"   📝 {description[:100]}...")

    return results

def analyze_dependency_conflicts() -> List[str]:
    """分析依赖冲突"""
    conflicts = []

    try:
        # 读取package.json
        package_json = Path("package.json")
        if not package_json.exists():
            return ["未找到package.json文件"]

        with open(package_json) as f:
            data = json.load(f)

        # 检查dependencies和devDependencies
        all_deps = {}
        for dep_type in ['dependencies', 'devDependencies']:
            if dep_type in data:
                all_deps.update(data[dep_type])

        # 检查React版本冲突
        if 'react' in all_deps and '@btc-connect/react' in all_deps:
            react_version = all_deps['react']
            btc_react_version = all_deps['@btc-connect/react']

            # 简单的React版本兼容性检查
            if not any(v in react_version for v in ['^18', '^19', '^17']):
                conflicts.append(f"React版本({react_version})可能与btc-connect不兼容，建议使用React 18+")

        # 检查Vue版本冲突
        if 'vue' in all_deps and '@btc-connect/vue' in all_deps:
            vue_version = all_deps['vue']
            btc_vue_version = all_deps['@btc-connect/vue']

            # 简单的Vue版本兼容性检查
            if not any(v in vue_version for v in ['^3', '^2']):
                conflicts.append(f"Vue版本({vue_version})可能与btc-connect不兼容，建议使用Vue 3")

        # 检查TypeScript版本
        if 'typescript' in all_deps:
            ts_version = all_deps['typescript']
            if not any(v in ts_version for v in ['^5', '^4']):
                conflicts.append(f"TypeScript版本({ts_version})可能较旧，建议升级到TypeScript 5")

    except Exception as e:
        conflicts.append(f"分析依赖冲突时出错: {e}")

    return conflicts

def generate_update_recommendations(results: Dict[str, Dict]) -> List[str]:
    """生成更新建议"""
    recommendations = []

    for package, info in results.items():
        installed = info.get('installed')
        latest = info.get('latest')

        if not installed:
            recommendations.append(f"安装 {package}: npm install {package}")
        elif installed != latest:
            recommendations.append(f"更新 {package}: npm install {package}@latest")

    return recommendations

def check_peer_dependencies() -> Dict[str, List[str]]:
    """检查peer dependencies"""
    peer_deps = {}

    # btc-connect包的典型peer dependencies
    expected_peers = {
        '@btc-connect/react': ['react', 'react-dom'],
        '@btc-connect/vue': ['vue'],
    }

    try:
        # 读取package.json
        package_json = Path("package.json")
        if package_json.exists():
            with open(package_json) as f:
                data = json.load(f)

            all_deps = {}
            for dep_type in ['dependencies', 'devDependencies', 'peerDependencies']:
                if dep_type in data:
                    all_deps.update(data[dep_type])

            for btc_package, required_peers in expected_peers.items():
                missing_peers = []
                if btc_package in all_deps:
                    for peer in required_peers:
                        if peer not in all_deps:
                            missing_peers.append(peer)

                if missing_peers:
                    peer_deps[btc_package] = missing_peers

    except Exception:
        pass

    return peer_deps

def main():
    """主函数"""
    print("=== BTC-Connect 版本检查工具 ===\n")

    # 检查包版本
    results = check_btc_connect_versions()

    print("\n" + "="*50)
    print("📊 版本兼容性分析")

    # 提取版本信息
    core_version = results.get('@btc-connect/core', {}).get('installed')
    react_version = results.get('@btc-connect/react', {}).get('installed')
    vue_version = results.get('@btc-connect/vue', {}).get('installed')

    if core_version:
        # 检查兼容性
        compatibility_issues = check_version_compatibility(
            core_version, react_version, vue_version
        )

        if compatibility_issues:
            print("\n⚠️  发现兼容性问题:")
            for issue in compatibility_issues:
                print(f"   - {issue}")
        else:
            print("\n✅ 版本兼容性检查通过")

    # 检查依赖冲突
    print("\n" + "="*50)
    print("🔍 依赖冲突分析")
    conflicts = analyze_dependency_conflicts()
    if conflicts:
        for conflict in conflicts:
            print(f"   - {conflict}")
    else:
        print("✅ 未发现明显的依赖冲突")

    # 检查peer dependencies
    print("\n" + "="*50)
    print("👥 Peer Dependencies 检查")
    peer_issues = check_peer_dependencies()
    if peer_issues:
        for package, missing in peer_issues.items():
            print(f"   - {package} 缺少peer dependencies: {', '.join(missing)}")
    else:
        print("✅ Peer dependencies 检查通过")

    # 生成更新建议
    print("\n" + "="*50)
    print("💡 更新建议")
    recommendations = generate_update_recommendations(results)
    if recommendations:
        for rec in recommendations:
            print(f"   - {rec}")
    else:
        print("✅ 所有包都是最新版本")

    # 总结
    print("\n" + "="*50)
    print("📋 总结")

    installed_count = sum(1 for info in results.values() if info.get('installed'))
    total_count = len(results)

    print(f"已安装包: {installed_count}/{total_count}")

    if installed_count == total_count:
        core_latest = results.get('@btc-connect/core', {}).get('latest')
        if core_version == core_latest:
            print("✅ 所有包都是最新版本")
        else:
            print("⚠️  有包可以更新")
    else:
        print("❌ 有包未安装")

    # 下一步建议
    print("\n🎯 下一步:")
    if installed_count < total_count:
        print("   1. 安装缺失的btc-connect包")
        print("   2. 运行: python scripts/install_packages.py")
    elif compatibility_issues or conflicts:
        print("   1. 解决兼容性问题")
        print("   2. 更新相关依赖")
    else:
        print("   1. 查看集成指南: references/framework_setup.md")
        print("   2. 开始集成btc-connect功能")

if __name__ == "__main__":
    main()