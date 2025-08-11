# GEMINI.md

## Project Overview

This project, `btc-connect`, is a wallet connection toolkit designed for Bitcoin Web3 applications. It provides a unified interface for connecting to various Bitcoin wallets, including UniSat, OKX Wallet, and Xverse.

The project is structured as a monorepo and consists of the following main packages:

*   `@btc-connect/core`: A framework-agnostic core module that handles wallet adapters, connection management, and event handling.
*   `@btc-connect/react`: A module that provides React Hooks and a Context Provider for easy integration with React applications.
*   `@btc-connect/vue`: A module that offers Vue Composables and a plugin system for seamless use in Vue applications.
*   `@btc-connect/design-system`: A package for the design system and theming.
*   `@btc-connect/shared`: A package for shared utilities and types.
*   `@btc-connect/types`: A package for TypeScript type definitions.

The project also includes example applications for React and Vue in the `examples` directory.

## Building and Running

The project uses `bun` for package management and script execution.

*   **Install dependencies:**
    ```bash
    bun install
    ```

*   **Build all packages:**
    ```bash
    bun run build
    ```

*   **Run all packages in development mode:**
    ```bash
    bun run dev
    ```

*   **Run tests:**
    ```bash
    bun test
    ```

*   **Lint and format code:**
    ```bash
    bun run lint
    bun run format
    ```

*   **Type-check the code:**
    ```bash
    bun run typecheck
    ```

## Development Conventions

*   **Coding Style:** The project uses Biome for linting and formatting. Run `bun run lint` and `bun run format` to ensure code style consistency.
*   **Testing:** The project uses `bun test` for running tests.
*   **Monorepo Structure:** The project is a monorepo with packages located in the `packages` directory. Each package has its own `package.json` and scripts.
*   **Framework Agnostic Core:** The core logic is framework-agnostic, with separate packages for React and Vue integrations.
