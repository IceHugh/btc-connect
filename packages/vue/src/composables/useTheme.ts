import type {
  Theme,
  ThemeConfig,
  ThemeMode,
  UseThemeReturn,
} from '@btc-connect/core';
import { computed, onUnmounted, ref, watch } from 'vue';
import { useWalletContext } from '../walletContext';

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
 * 主题管理 Composable
 *
 * 提供完整的主题管理功能，包括模式切换、系统主题跟随、自定义主题等
 *
 * @example
 * ```vue
 * <script setup>
 * import { useTheme } from '@btc-connect/vue';
 *
 * const {
 *   theme,
 *   themeConfig,
 *   setTheme,
 *   setThemeMode,
 *   setCustomTheme,
 *   resetTheme,
 *   isDark,
 *   systemTheme
 * } = useTheme();
 *
 * // 切换到暗色主题
 * const switchToDark = () => {
 *   setThemeMode('dark');
 * };
 *
 * // 切换到亮色主题
 * const switchToLight = () => {
 *   setThemeMode('light');
 * };
 *
 * // 跟随系统主题
 * const followSystem = () => {
 *   setThemeMode('auto');
 * };
 *
 * // 设置自定义主题
 * const setCustomColor = () => {
 *   setCustomTheme({
 *     primary: '#ff6b6b',
 *     background: '#f8f9fa'
 *   });
 * };
 * </script>
 *
 * <template>
 *   <div :class="{ 'dark-theme': isDark, 'light-theme': !isDark }">
 *     <p>当前主题: {{ theme.mode }}</p>
 *     <p>是否暗色: {{ isDark ? '是' : '否' }}</p>
 *     <p>系统主题: {{ systemTheme }}</p>
 *   </div>
 * </template>
 * ```
 */
export function useTheme(): UseThemeReturn {
  const { theme: currentTheme } = useWalletContext();
  const customConfig = ref<Partial<ThemeConfig>>({});

  // 检测系统主题
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';

    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  };

  // 计算实际主题
  const theme = computed<Theme>(() => {
    const config = { ...DEFAULT_THEME_CONFIG, ...customConfig.value };
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
  });

  // 完整的主题配置
  const themeConfig = computed<ThemeConfig>(() => theme.value.config);

  // 设置主题（部分更新）
  const setTheme = (newTheme: Partial<Theme>) => {
    const updatedConfig = { ...customConfig.value };

    if (newTheme.mode !== undefined) {
      updatedConfig.mode = newTheme.mode;
    }

    if (newTheme.config) {
      Object.assign(updatedConfig, newTheme.config);
    }

    customConfig.value = updatedConfig;
  };

  // 切换主题模式
  const setThemeMode = (mode: ThemeMode) => {
    setTheme({ mode });
  };

  // 设置自定义主题
  const setCustomTheme = (config: Partial<ThemeConfig>) => {
    customConfig.value = { ...customConfig.value, ...config };
  };

  // 重置主题
  const resetTheme = () => {
    customConfig.value = {};
  };

  // 切换主题模式（在 light/dark 之间切换）
  const _toggleTheme = () => {
    if (theme.value.mode === 'light') {
      setThemeMode('dark');
    } else if (theme.value.mode === 'dark') {
      setThemeMode('auto');
    } else {
      setThemeMode('light');
    }
  };

  // 监听系统主题变化
  const handleSystemThemeChange = () => {
    // 重新计算主题以响应系统主题变化
    customConfig.value = { ...customConfig.value };
  };

  // 添加系统主题监听器
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
    } else {
      // 兼容旧版浏览器
      mediaQuery.addListener(handleSystemThemeChange);
    }

    // 组件卸载时清理监听器
    onUnmounted(() => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      } else {
        mediaQuery.removeListener(handleSystemThemeChange);
      }
    });
  }

  // 应用主题到 DOM
  const applyThemeToDOM = () => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const currentTheme = theme.value;

    // 设置主题类
    root.classList.remove('theme-light', 'theme-dark', 'theme-auto');
    root.classList.add(`theme-${currentTheme.mode}`);

    // 设置暗色主题标识
    if (currentTheme.isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // 设置 CSS 变量
    const config = currentTheme.config;
    root.style.setProperty('--btc-theme-primary', config.primary || '#f7931a');
    root.style.setProperty(
      '--btc-theme-background',
      config.background || '#ffffff',
    );
    root.style.setProperty('--btc-theme-text', config.text || '#212529');
    root.style.setProperty('--btc-theme-border', config.border || '#dee2e6');
  };

  // 监听主题变化并应用到 DOM
  watch(theme, applyThemeToDOM, { immediate: true });

  return {
    theme: theme.value,
    themeConfig: themeConfig.value,
    setTheme,
    setThemeMode,
    setCustomTheme,
    resetTheme,
    isDark: theme.value.isDark,
    systemTheme: theme.value.systemTheme,
  };
}

/**
 * 高级主题管理 Composable
 *
 * 提供更高级的主题功能，包括主题预设、动画过渡等
 *
 * @example
 * ```vue
 * <script setup>
 * import { useThemeAdvanced } from '@btc-connect/vue';
 *
 * const {
 *   themePresets,
 *   applyPreset,
 *   savePreset,
 *   deletePreset,
 *   exportTheme,
 *   importTheme,
 *   animateThemeChange
 * } = useThemeAdvanced();
 *
 * // 应用预设主题
 * const applyDarkPreset = () => {
 *   applyPreset('dark-pro');
 * };
 *
 * // 保存当前主题为预设
 * const saveCurrentTheme = () => {
 *   savePreset('my-custom', {
 *     name: '我的自定义主题',
 *     config: { primary: '#ff6b6b' }
 *   });
 * };
 * </script>
 * ```
 */
export function useThemeAdvanced() {
  const { theme, setCustomTheme, resetTheme } = useTheme();

  // 主题预设
  const themePresets = ref<
    Record<string, { name: string; config: ThemeConfig }>
  >({
    light: {
      name: '亮色主题',
      config: {
        mode: 'light',
        followSystem: false,
        primary: '#f7931a',
        background: '#ffffff',
        text: '#212529',
        border: '#dee2e6',
      },
    },
    dark: {
      name: '暗色主题',
      config: {
        mode: 'dark',
        followSystem: false,
        primary: '#f7931a',
        background: '#1a1a1a',
        text: '#ffffff',
        border: '#404040',
      },
    },
    auto: {
      name: '自动主题',
      config: {
        mode: 'auto',
        followSystem: true,
        primary: '#f7931a',
        background: '#ffffff',
        text: '#212529',
        border: '#dee2e6',
      },
    },
    blue: {
      name: '蓝色主题',
      config: {
        mode: 'light',
        followSystem: false,
        primary: '#007bff',
        background: '#ffffff',
        text: '#212529',
        border: '#dee2e6',
      },
    },
    green: {
      name: '绿色主题',
      config: {
        mode: 'light',
        followSystem: false,
        primary: '#28a745',
        background: '#ffffff',
        text: '#212529',
        border: '#dee2e6',
      },
    },
  });

  // 应用预设主题
  const applyPreset = (presetId: string) => {
    const preset = themePresets.value[presetId];
    if (preset) {
      setCustomTheme(preset.config);
    }
  };

  // 保存新预设
  const savePreset = (
    presetId: string,
    preset: { name: string; config: ThemeConfig },
  ) => {
    themePresets.value[presetId] = preset;

    // 保存到本地存储
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(
        'btc-theme-presets',
        JSON.stringify(themePresets.value),
      );
    }
  };

  // 删除预设
  const deletePreset = (presetId: string) => {
    delete themePresets.value[presetId];

    // 更新本地存储
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(
        'btc-theme-presets',
        JSON.stringify(themePresets.value),
      );
    }
  };

  // 导出主题配置
  const exportTheme = () => {
    const currentTheme = theme;
    const themeData = {
      version: '1.0.0',
      theme: currentTheme.config,
      presets: themePresets.value,
      exportTime: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(themeData, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `btc-theme-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 导入主题配置
  const importTheme = (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const themeData = JSON.parse(e.target?.result as string);

          if (themeData.theme) {
            setCustomTheme(themeData.theme);
          }

          if (themeData.presets) {
            themePresets.value = {
              ...themePresets.value,
              ...themeData.presets,
            };
          }

          resolve(themeData);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsText(file);
    });
  };

  // 动画过渡主题切换
  const animateThemeChange = (
    newTheme: Partial<ThemeConfig>,
    duration: number = 300,
  ) => {
    if (typeof document === 'undefined') return Promise.resolve();

    const root = document.documentElement;
    root.style.transition = `all ${duration}ms ease-in-out`;

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setCustomTheme(newTheme);

        setTimeout(() => {
          root.style.transition = '';
          resolve();
        }, duration);
      }, 50);
    });
  };

  // 初始化：从本地存储加载预设
  if (typeof localStorage !== 'undefined') {
    try {
      const savedPresets = localStorage.getItem('btc-theme-presets');
      if (savedPresets) {
        const parsed = JSON.parse(savedPresets);
        themePresets.value = { ...themePresets.value, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load theme presets from localStorage:', error);
    }
  }

  return {
    themePresets,
    applyPreset,
    savePreset,
    deletePreset,
    exportTheme,
    importTheme,
    animateThemeChange,
  };
}
