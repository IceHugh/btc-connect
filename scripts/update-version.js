#!/usr/bin/env node

/**
 * 自动更新版本号脚本
 *
 * 使用方法:
 * node scripts/update-version.js patch  # 更新补丁版本 (0.2.0 -> 0.2.1)
 * node scripts/update-version.js minor  # 更新次版本 (0.2.1 -> 0.3.0)
 * node scripts/update-version.js major  # 更新主版本 (0.2.1 -> 1.0.0)
 * node scripts/update-version.js 1.2.3 # 设置特定版本
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// 项目配置
const PROJECT_ROOT = process.cwd();
const PACKAGES = [
  { name: '@btc-connect/core', path: 'packages/core' },
  { name: '@btc-connect/react', path: 'packages/react' },
  { name: '@btc-connect/vue', path: 'packages/vue' },
];

/**
 * 解析版本号
 */
function parseVersion(version) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) {
    throw new Error(`Invalid version format: ${version}`);
  }
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
  };
}

/**
 * 格式化版本号
 */
function formatVersion(version) {
  return `${version.major}.${version.minor}.${version.patch}`;
}

/**
 * 根据类型更新版本号
 */
function updateVersion(currentVersion, type) {
  const version = parseVersion(currentVersion);

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
      // 如果是特定版本号，直接解析
      return type;
  }

  return formatVersion(version);
}

/**
 * 读取 package.json
 */
function readPackageJson(packagePath) {
  const fullPath = join(PROJECT_ROOT, packagePath, 'package.json');
  const content = readFileSync(fullPath, 'utf8');
  return JSON.parse(content);
}

/**
 * 写入 package.json
 */
function writePackageJson(packagePath, packageJson) {
  const fullPath = join(PROJECT_ROOT, packagePath, 'package.json');
  const content = JSON.stringify(packageJson, null, 2) + '\n';
  writeFileSync(fullPath, 'utf8', content);
}

/**
 * 获取当前版本号
 */
function getCurrentVersion() {
  const corePackage = readPackageJson('packages/core');
  return corePackage.version;
}

/**
 * 更新所有包的版本号
 */
function updateAllVersions(newVersion) {
  console.log(`🔄 更新所有包版本号到: ${newVersion}`);

  const updatedPackages = [];

  for (const pkg of PACKAGES) {
    try {
      const packageJson = readPackageJson(pkg.path);
      const oldVersion = packageJson.version;

      if (oldVersion !== newVersion) {
        packageJson.version = newVersion;
        writePackageJson(pkg.path, packageJson);

        console.log(`✅ ${pkg.name}: ${oldVersion} → ${newVersion}`);
        updatedPackages.push(pkg.name);
      } else {
        console.log(`⏭️  ${pkg.name}: 版本号已是最新 (${newVersion})`);
      }
    } catch (error) {
      console.error(`❌ 更新 ${pkg.name} 失败:`, error.message);
      process.exit(1);
    }
  }

  return updatedPackages;
}

/**
 * 提交版本更新
 */
function commitVersionUpdate(newVersion, updatedPackages) {
  if (updatedPackages.length === 0) {
    console.log('📝 没有包需要更新，跳过提交');
    return;
  }

  console.log('📝 提交版本更新...');

  try {
    // 添加所有修改的文件
    execSync('git add packages/*/package.json', { stdio: 'inherit' });

    // 创建提交信息
    const commitMessage = `chore: 更新所有子包版本号到 v${newVersion}

${updatedPackages.map((pkg) => `- ${pkg}: ${newVersion}`).join('\n')}

准备发布到 NPM`;

    // 提交
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });

    console.log('✅ 版本更新已提交');
  } catch (error) {
    console.error('❌ 提交失败:', error.message);
    process.exit(1);
  }
}

/**
 * 推送到远程仓库
 */
function pushToRemote() {
  try {
    console.log('🚀 推送到远程仓库...');
    execSync('git push origin main', { stdio: 'inherit' });
    console.log('✅ 已推送到远程仓库，将触发 CI/CD 自动发布');
  } catch (error) {
    console.error('❌ 推送失败:', error.message);
    process.exit(1);
  }
}

/**
 * 主函数
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('使用方法:');
    console.log(
      '  node scripts/update-version.js patch  # 更新补丁版本 (0.2.0 -> 0.2.1)',
    );
    console.log(
      '  node scripts/update-version.js minor  # 更新次版本 (0.2.1 -> 0.3.0)',
    );
    console.log(
      '  node scripts/update-version.js major  # 更新主版本 (0.2.1 -> 1.0.0)',
    );
    console.log('  node scripts/update-version.js 1.2.3 # 设置特定版本');
    process.exit(1);
  }

  const versionType = args[0];
  const currentVersion = getCurrentVersion();

  console.log(`📦 当前版本: ${currentVersion}`);
  console.log(`🔧 更新类型: ${versionType}`);

  try {
    const newVersion = updateVersion(currentVersion, versionType);
    const updatedPackages = updateAllVersions(newVersion);

    if (updatedPackages.length > 0) {
      commitVersionUpdate(newVersion, updatedPackages);

      // 询问是否推送到远程仓库
      const shouldPush =
        process.argv.includes('--push') || process.argv.includes('-p');
      if (shouldPush) {
        pushToRemote();
      } else {
        console.log('\n💡 使用 --push 或 -p 参数可以自动推送到远程仓库');
        console.log('   node scripts/update-version.js patch --push');
      }
    }

    console.log('\n🎉 版本更新完成!');
    console.log(`📋 新版本号: ${newVersion}`);
  } catch (error) {
    console.error('❌ 版本更新失败:', error.message);
    process.exit(1);
  }
}

// 运行主函数
main();
