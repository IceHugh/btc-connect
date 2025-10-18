/**
 * Bun 专用测试配置
 */

// 设置测试环境
import { GlobalRegistrator } from '@happy-dom/global-registrator';

// 初始化 happy-dom
GlobalRegistrator.register();

// 全局测试设置
global.setTimeout = global.setTimeout || setTimeout;
global.clearTimeout = global.clearTimeout || clearTimeout;

// Mock console methods for testing
const originalConsole = global.console;

beforeAll(() => {
  global.console = {
    ...originalConsole,
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
});

afterAll(() => {
  global.console = originalConsole;
  // 清理 happy-dom
  GlobalRegistrator.unregister();
});