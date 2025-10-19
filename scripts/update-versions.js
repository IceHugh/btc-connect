#!/usr/bin/env node

// 版本管理脚本
// 用于同步所有包的版本号，确保版本一致性

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

const packages = ['core', 'react', 'vue'];

function getCurrentVersion(packageName) {
  try {
    const version = execSync(`npm view @btc-connect/${packageName} version`, {
      encoding: 'utf8',
      stdio: 'pipe'
    }).trim();
    return version;
  } catch (error) {
    console.log(`⚠️  @btc-connect/${packageName} 在 NPM 上不存在`);
    return null;
  }
}

function getNextVersion(currentVersion, type = 'patch') {
  if (!currentVersion) return '1.0.0';

  const [major, minor, patch] = currentVersion.split('.').map(Number);

  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
    default:
      return `${major}.${minor}.${patch + 1}`;
  }
}

function updatePackageVersion(packagePath, newVersion) {
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
  packageJson.version = newVersion;
  writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  console.log(`✅ 更新 ${packagePath} 到版本 ${newVersion}`);
}

function main() {
  console.log('🔍 检查当前 NPM 版本...');

  const versions = {};
  let maxVersion = '0.0.0';

  // 获取所有包的当前版本
  for (const pkg of packages) {
    const currentVersion = getCurrentVersion(pkg);
    if (currentVersion) {
      versions[pkg] = currentVersion;
      // 更新最大版本
      if (currentVersion.localeCompare(maxVersion, undefined, { numeric: true }) > 0) {
        maxVersion = currentVersion;
      }
    }
  }

  console.log('📋 当前版本状态:');
  Object.entries(versions).forEach(([pkg, version]) => {
    console.log(`  @btc-connect/${pkg}: ${version}`);
  });

  if (Object.keys(versions).length === 0) {
    console.log('ℹ️  所有包都是新包，使用版本 1.0.0');
    maxVersion = '1.0.0';
  } else {
    console.log(`🔢 最高版本: ${maxVersion}`);
  }

  // 获取下一个版本
  const nextVersion = getNextVersion(maxVersion, 'patch');
  console.log(`🚀 建议下一个版本: ${nextVersion}`);

  // 更新所有包的版本
  console.log('📝 更新本地包版本...');
  for (const pkg of packages) {
    const packagePath = `packages/${pkg}/package.json`;
    updatePackageVersion(packagePath, nextVersion);
  }

  console.log('✅ 版本更新完成！');
  console.log('');
  console.log('📋 后续步骤:');
  console.log('1. 提交版本更新: git add . && git commit -m "chore: 更新版本号到 ' + nextVersion + '"');
  console.log('2. 推送到 main 分支触发 CI/CD: git push origin main');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { getCurrentVersion, getNextVersion, updatePackageVersion };