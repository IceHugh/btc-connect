import type {
  Theme,
  ThemeConfig,
  ThemeMode,
  UseThemeReturn,
} from '@btc-connect/core';
import { useCallback, useEffect, useMemo, useState } from 'react';

/**
 * 默认主题配置
 */
const DEFAULT_THEME_CONFIG: ThemeConfig = {
  mode: 'light',
  followSystem: false,
  primary: '#f7931a',
  background: '#ffffff',
  text: '#212529',
  border: '#dee2e6',
};

/**
 * 主题管理 Hook
 *
 * 提供完整的主题管理功能，包括模式切换、系统主题跟随、自定义主题等
 *
 * @example
 * ```tsx
 * function ThemeExample() {
 *   const {
 *     theme,
 *     themeConfig,
 *     setTheme,
 *     setThemeMode,
 *     setCustomTheme,
 *     resetTheme,
 *     isDark
 *   } = useTheme();
 *
 *   return (
 *     <div>
 *       <p>Current theme: {theme.mode}</p>
 *       <p>Is dark: {isDark ? 'Yes' : 'No'}</p>
 *
 *       <button onClick={() => setThemeMode('dark')}>
 *         Switch to Dark
 *       </button>
 *
 *       <button onClick={() => setThemeMode('light')}>
 *         Switch to Light
 *       </button>
 *
 *       <button onClick={() => setThemeMode('auto')}>
 *         Follow System
 *       </button>
 *
 *       <button onClick={() => setCustomTheme({
 *         colors: { primary: '#ff6b6b' }
 *       })}>
 *         Custom Theme
 *       </button>
 *
 *       <button onClick={resetTheme}>
 *         Reset Theme
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTheme(): UseThemeReturn {
  const [customConfig, setCustomConfig] = useState<Partial<ThemeConfig>>({});

  // 检测系统主题
  const getSystemTheme = useCallback((): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';

    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }, []);

  // 计算实际主题
  const theme = useMemo<Theme>(() => {
    const config = { ...DEFAULT_THEME_CONFIG, ...customConfig };
    const systemTheme = getSystemTheme();

    let mode: ThemeMode;
    let isDark: boolean;

    if (config.mode === 'auto') {
      mode = systemTheme;
      isDark = systemTheme === 'dark';
    } else {
      mode = config.mode;
      isDark = mode === 'dark';
    }

    return {
      mode,
      isDark,
      systemTheme,
      config,
    };
  }, [customConfig, getSystemTheme]);

  // 完整的主题配置
  const themeConfig = useMemo<ThemeConfig>(() => theme.config, [theme]);

  // 设置主题（部分更新）
  const setTheme = useCallback((newTheme: Partial<Theme>) => {
    setCustomConfig((prev: any) => {
      const updatedConfig = { ...prev };

      if (newTheme.mode !== undefined) {
        updatedConfig.mode = newTheme.mode;
      }

      if (newTheme.config) {
        Object.assign(updatedConfig, newTheme.config);
      }

      return updatedConfig;
    });
  }, []);

  // 切换主题模式
  const setThemeMode = useCallback(
    (mode: ThemeMode) => {
      setTheme({ mode });
    },
    [setTheme],
  );

  // 设置自定义主题
  const setCustomTheme = useCallback((config: Partial<ThemeConfig>) => {
    setCustomConfig((prev: any) => ({ ...prev, ...config }));
  }, []);

  // 重置主题
  const resetTheme = useCallback(() => {
    setCustomConfig({});
  }, []);

  // 监听系统主题变化
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      // 重新计算主题以响应系统主题变化
      setCustomConfig((prev: any) => ({ ...prev }));
    };

    // 添加监听器
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // 兼容旧版浏览器
      mediaQuery.addListener(handleChange);
    }

    // 清理监听器
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return {
    theme,
    themeConfig,
    setTheme,
    setThemeMode,
    setCustomTheme,
    resetTheme,
    isDark: theme.isDark,
    systemTheme: theme.systemTheme,
  };
}
