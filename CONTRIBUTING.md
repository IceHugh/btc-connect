# Contributing to BTC Connect

Thank you for your interest in contributing to BTC Connect! This guide will help you get started with contributing to the project.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Submitting Changes](#submitting-changes)
- [Release Process](#release-process)

## 🚀 Getting Started

### Prerequisites

Before you start contributing, make sure you have the following installed:

- **Node.js** >= 18.0.0
- **Bun** >= 1.0.0
- **Git** (latest version)
- A code editor with TypeScript support (recommended: VS Code)

### Required Knowledge

- TypeScript (strict mode)
- React 18+ (for React package)
- Vue 3+ (for Vue package)
- Bitcoin wallet concepts
- Modern JavaScript (ES2022+)

## 🛠️ Development Setup

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/btc-connect.git
cd btc-connect

# Add the original repository as upstream
git remote add upstream https://github.com/IceHugh/btc-connect.git
```

### 2. Install Dependencies

```bash
# Install dependencies for all packages
bun install

# Build all packages
bun run build

# Run tests to ensure everything works
bun test
```

### 3. Development Mode

```bash
# Start development for all packages
bun dev

# Or work on a specific package
cd packages/core && bun run dev
cd packages/react && bun run dev
cd packages/vue && bun run dev
```

## 📁 Project Structure

```
btc-connect/
├── packages/                 # Core packages
│   ├── core/                # Framework-agnostic core
│   │   ├── src/
│   │   │   ├── adapters/    # Wallet adapters
│   │   │   ├── managers/    # Wallet manager
│   │   │   ├── events/      # Event system
│   │   │   ├── types/       # Type definitions
│   │   │   └── __tests__/   # Test files
│   │   └── package.json
│   ├── react/               # React integration
│   │   ├── src/
│   │   │   ├── components/  # React components
│   │   │   ├── hooks/       # React hooks
│   │   │   ├── context/     # Context providers
│   │   │   └── __tests__/   # Test files
│   │   └── package.json
│   └── vue/                 # Vue integration
│       ├── src/
│       │   ├── components/  # Vue components
│       │   ├── composables/ # Vue composables
│       │   └── __tests__/   # Test files
│       └── package.json
├── examples/                # Usage examples
│   ├── react/              # React example
│   ├── vue-example/        # Vue example
│   └── nextjs/             # Next.js SSR example
├── docs/                   # Additional documentation
└── scripts/                # Build and utility scripts
```

## 🔄 Development Workflow

### 1. Create a Branch

```bash
# Sync with upstream main
git fetch upstream
git checkout main
git merge upstream/main

# Create a new branch for your feature
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 2. Make Your Changes

- Follow the [Code Standards](#code-standards)
- Write tests for new functionality
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run all tests
bun test

# Run tests for specific package
bun test packages/core
bun test packages/react
bun test packages/vue

# Run tests with coverage
bun test --coverage

# Run type checking
bun run typecheck

# Run linting
bun run lint
```

### 4. Commit Your Changes

Follow our [commit message conventions](#commit-message-conventions):

```bash
# Stage your changes
git add .

# Commit with conventional message
git commit -m "feat: add new wallet adapter for XYZ wallet"
```

### 5. Push and Create Pull Request

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create a pull request on GitHub
# Use the PR template and fill in all sections
```

## 📝 Code Standards

### TypeScript

- Use **strict mode** TypeScript
- All functions must have return types
- Use `interface` for object shapes, `type` for unions/primitives
- Prefer `const` over `let` when possible
- Use explicit imports/exports

```typescript
// ✅ Good
interface WalletInfo {
  id: string;
  name: string;
  icon: string;
}

const createWallet = (info: WalletInfo): BTCWalletAdapter => {
  return new WalletAdapter(info);
};

// ❌ Bad
const createWallet = (info: any) => {
  return new WalletAdapter(info);
};
```

### Code Style

We use **Biome** for code formatting and linting:

```bash
# Format code
bun run format

# Check linting
bun run lint

# Fix linting issues
bun run lint:fix
```

**Style guidelines:**
- 2 space indentation
- Single quotes for strings
- No semicolons (Biome will handle this)
- Maximum line length: 100 characters

### Naming Conventions

```typescript
// Files: kebab-case
wallet-adapter.ts
use-wallet.ts
btc-connect-button.tsx

// Variables and functions: camelCase
const walletManager = new BTCWalletManager();
const connectWallet = async (walletId: string) => {};

// Classes and interfaces: PascalCase
class BTCWalletAdapter {}
interface WalletState {}

// Constants: UPPER_SNAKE_CASE
const DEFAULT_TIMEOUT = 5000;
const WALLET_IDS = ['unisat', 'okx', 'xverse'];

// Types: PascalCase for interfaces, camelCase for type aliases
interface WalletInfo {}
type WalletStatus = 'connected' | 'disconnected';
```

## 🧪 Testing Guidelines

### Test Structure

```typescript
// packages/core/src/__tests__/managers.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { BTCWalletManager } from '../managers';

describe('BTCWalletManager', () => {
  let manager: BTCWalletManager;

  beforeEach(() => {
    manager = new BTCWalletManager();
  });

  afterEach(() => {
    manager.destroy();
  });

  describe('connect', () => {
    it('should connect to wallet successfully', async () => {
      const accounts = await manager.connect('unisat');
      expect(accounts).toBeDefined();
      expect(accounts.length).toBeGreaterThan(0);
    });

    it('should throw error for invalid wallet', async () => {
      await expect(manager.connect('invalid')).rejects.toThrow();
    });
  });
});
```

### Testing Requirements

1. **Unit Tests**: Test individual functions and classes
2. **Integration Tests**: Test module interactions
3. **Mock External Dependencies**: Use mocks for wallet APIs
4. **Coverage**: Maintain >90% test coverage
5. **Async Tests**: Use proper async/await patterns

### Test Commands

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test --watch

# Run tests with coverage
bun test --coverage

# Run tests for specific file
bun test packages/core/src/__tests__/managers.test.ts
```

## 📚 Documentation

### Code Documentation

- Use JSDoc comments for all public APIs
- Include parameter types and return types
- Add usage examples for complex functions

```typescript
/**
 * Connects to a Bitcoin wallet
 * @param walletId - The ID of the wallet to connect to
 * @param options - Connection options
 * @returns Promise resolving to account information
 * @throws {WalletNotInstalledError} When wallet is not installed
 * @throws {WalletConnectionError} When connection fails
 *
 * @example
 * ```typescript
 * const accounts = await manager.connect('unisat');
 * console.log('Connected account:', accounts[0].address);
 * ```
 */
async connect(walletId: string, options?: ConnectionOptions): Promise<AccountInfo[]> {
  // implementation
}
```

### README Documentation

- Update README.md for new features
- Update CHANGELOG.md for breaking changes
- Add examples to the `examples/` directory
- Keep documentation in sync with code

## 📤 Submitting Changes

### Pull Request Process

1. **Create Pull Request**
   - Use descriptive title
   - Fill out PR template completely
   - Link related issues

2. **PR Requirements**
   - All tests pass
   - Code follows style guidelines
   - Documentation is updated
   - No breaking changes without proper version bump

3. **Review Process**
   - Maintainers will review your PR
   - Address feedback promptly
   - Keep PR up to date with main branch

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] All tests pass
- [ ] New tests added
- [ ] Coverage maintained

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Examples tested (if applicable)
```

## 🏷️ Version Management

### Semantic Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Process

1. Update version numbers in package.json files
2. Update CHANGELOG.md
3. Create release tag
4. Publish to npm

### Branch Strategy

- `main`: Stable releases
- `develop`: Development branch (if needed)
- `feature/*`: Feature branches
- `fix/*`: Bug fix branches

## 🐛 Bug Reports

### Reporting Bugs

Use the GitHub issue tracker with the following template:

```markdown
**Bug Description**
Clear and concise description of the bug

**To Reproduce**
Steps to reproduce the behavior

**Expected Behavior**
What you expected to happen

**Environment**
- OS: [e.g. macOS 13.0]
- Node.js version: [e.g. 18.17.0]
- Browser: [e.g. Chrome 116]
- Package version: [e.g. 1.2.3]

**Additional Context**
Any other relevant information
```

## 💡 Feature Requests

### Requesting Features

1. Check existing issues for duplicates
2. Use the GitHub issue tracker
3. Provide clear use case and implementation suggestions

```markdown
**Feature Description**
Clear description of the feature

**Use Case**
Why this feature is needed

**Proposed Solution**
How you envision the feature working

**Alternatives Considered**
Other approaches you've thought about
```

## 🤝 Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Assume good intentions

### Getting Help

- **Discussions**: Use GitHub Discussions for questions
- **Issues**: Use issues for bugs and feature requests
- **Discord**: Join our [Discord server](https://discord.gg/btc-connect)
- **Email**: support@btc-connect.dev

## 🏆 Recognition

Contributors are recognized in several ways:

- **Contributors list** in README.md
- **Release notes** mentioning contributions
- **Special recognition** for significant contributions
- **Maintainer access** for consistent contributors

## 📞 Additional Resources

- [Documentation](https://docs.btc-connect.dev)
- [API Reference](https://docs.btc-connect.dev/api)
- [Examples](./examples/)
- [Discord Community](https://discord.gg/btc-connect)

---

Thank you for contributing to BTC Connect! Your contributions help make Bitcoin wallet integration easier for developers worldwide. 🚀