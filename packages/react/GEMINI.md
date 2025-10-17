# GEMINI.md

## Project Overview

This package, `@btc-connect/react`, is a React-specific module for the `btc-connect` project. It provides React Hooks and a Context Provider to facilitate the integration of Bitcoin wallet connectivity into React applications. The package is written in TypeScript and uses Vite for building.

## Building and Running

The project uses `bun` for package management and script execution.

*   **Install dependencies:**
    ```bash
    bun install
    ```

*   **Build the package:**
    ```bash
    bun run build
    ```

*   **Run in development mode (with watch):**
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

*   **Coding Style:** The project uses Biome for linting and formatting.
*   **Module Format:** The package is an ES Module.
*   **Dependencies:** It has peer dependencies on `@btc-connect/core`, `react`, and `react-dom`.
*   **Build Process:** Vite is used to build the project, and `vite-plugin-dts` generates the TypeScript declaration files.
