import { cosmiconfigSync } from 'cosmiconfig';
import path from 'path';
import { I18nConfig } from '../types';
import { presets } from '../presets';

const moduleName = 'i18n-scanner';

/**
 * Default configuration - matches localized-tool behavior
 */
const defaultConfig: I18nConfig = {
  projectDir: process.cwd(), // Always current working directory
  sourceDir: 'demo-project/react/src', // 相对于当前目录
  localeDir: 'demo-project/react/src/localized/strings',
  extensions: ['js', 'jsx', 'ts', 'tsx'],
  ignoreDirs: ['node_modules', '.git', 'dist', 'build'],
  ignoreKeyPatterns: ['src', 'components'],
  defaultLocale: 'zh_hans.js',
  extractPattern: /\$LS\s*\(\s*["'`]([^"'`]+)["'`]\s*\)/g,
  framework: 'custom' // Use custom pattern for $LS
};

/**
 * Load configuration with smart defaults for current project
 */
export async function loadConfig(searchFrom?: string): Promise<I18nConfig> {
  const projectDir = searchFrom || process.cwd();

  // Start with default config for current project
  let finalConfig = {
    ...defaultConfig,
    projectDir
  };

  // Auto-detect framework if not specified
  if (!finalConfig.framework) {
    const { detectFramework } = await import('../utils/frameworkDetector');
    finalConfig.framework = await detectFramework(projectDir) as any;
  }

  // Apply framework preset
  if (finalConfig.framework && presets[finalConfig.framework as keyof typeof presets]) {
    const presetConfig = presets[finalConfig.framework as keyof typeof presets].config;
    finalConfig = {
      ...finalConfig,
      ...presetConfig,
      projectDir // Keep current project dir
    };
  }

  // Look for user configuration (optional)
  const explorer = cosmiconfigSync(moduleName, {
    searchPlaces: [
      'package.json',
      `.${moduleName}rc`,
      `.${moduleName}rc.json`,
      `${moduleName}.config.js`,
      `${moduleName}.config.json`
    ]
  });

  const result = explorer.search(projectDir);
  if (result?.config) {
    finalConfig = {
      ...finalConfig,
      ...result.config,
      projectDir // Always use current project
    };
  }

  // Resolve paths relative to project directory
  finalConfig.sourceDir = path.resolve(finalConfig.projectDir, finalConfig.sourceDir);
  finalConfig.localeDir = path.resolve(finalConfig.projectDir, finalConfig.localeDir);

  return finalConfig;
}

/**
 * Create configuration programmatically
 */
export function createConfig(config: Partial<I18nConfig>): I18nConfig {
  let presetConfig = {};

  if (config.framework && presets[config.framework as keyof typeof presets]) {
    presetConfig = presets[config.framework as keyof typeof presets].config;
  }

  const finalConfig = {
    ...defaultConfig,
    ...presetConfig,
    ...config
  };

  // Resolve paths
  if (config.projectDir) {
    finalConfig.sourceDir = path.resolve(config.projectDir, finalConfig.sourceDir);
    finalConfig.localeDir = path.resolve(config.projectDir, finalConfig.localeDir);
  }

  return finalConfig;
}

/**
 * Validate configuration
 */
export function validateConfig(config: I18nConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required fields
  if (!config.projectDir) {
    errors.push('projectDir is required');
  }

  if (!config.sourceDir) {
    errors.push('sourceDir is required');
  }

  if (!config.localeDir) {
    errors.push('localeDir is required');
  }

  if (!config.extensions || config.extensions.length === 0) {
    errors.push('extensions array cannot be empty');
  }

  if (!config.extractPattern) {
    errors.push('extractPattern is required');
  }

  // Check if directories exist
  try {
    const fs = require('fs');

    if (!fs.existsSync(config.projectDir)) {
      errors.push(`projectDir does not exist: ${config.projectDir}`);
    }

    if (!fs.existsSync(config.sourceDir)) {
      errors.push(`sourceDir does not exist: ${config.sourceDir}`);
    }

    // localeDir might not exist yet, so we don't check it
  } catch (error) {
    errors.push(`Error checking directories: ${error}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Generate example configuration file
 */
export function generateExampleConfig(framework: string = 'react'): string {
  const preset = presets[framework as keyof typeof presets];

  const config = {
    framework,
    projectDir: './my-project',
    sourceDir: 'src',
    localeDir: 'src/localized',
    extensions: preset?.config.extensions || ['js', 'jsx', 'ts', 'tsx'],
    ignoreDirs: ['node_modules', '.git', 'dist', 'build'],
    ignoreKeyPatterns: ['components', 'utils', 'common'],
    defaultLocale: preset?.config.defaultLocale || 'en.json',
    output: {
      format: 'excel',
      filePath: './i18n-report.xlsx',
      includeStats: true,
      includeContext: true
    }
  };

  return JSON.stringify(config, null, 2);
}

/**
 * Merge multiple configurations
 */
export function mergeConfigs(...configs: Partial<I18nConfig>[]): I18nConfig {
  return configs.reduce((merged, config) => ({
    ...merged,
    ...config
  }), defaultConfig) as I18nConfig;
}
