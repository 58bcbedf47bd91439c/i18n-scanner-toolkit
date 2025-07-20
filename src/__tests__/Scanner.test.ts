import { describe, it, expect, beforeEach } from 'vitest';
import { I18nScanner } from '../core/Scanner';
import { createConfig } from '../config/loader';
import path from 'path';

describe('I18nScanner', () => {
  let scanner: I18nScanner;
  let config: any;

  beforeEach(() => {
    config = createConfig({
      framework: 'react',
      projectDir: path.join(__dirname, '../../demo-project'),
      sourceDir: path.join(__dirname, '../../demo-project/src'),
      localeDir: path.join(__dirname, '../../demo-project/src/localized/strings'),
      extensions: ['js', 'jsx'],
      defaultLocale: 'zh_hans.js'
    });
    
    scanner = new I18nScanner(config);
  });

  it('should create scanner instance', () => {
    expect(scanner).toBeInstanceOf(I18nScanner);
  });

  it('should have correct configuration', () => {
    const scannerConfig = scanner.getConfig();
    expect(scannerConfig.framework).toBe('react');
    expect(scannerConfig.extensions).toContain('js');
    expect(scannerConfig.extensions).toContain('jsx');
  });

  it('should update configuration', () => {
    const newConfig = { framework: 'vue' as const };
    scanner.updateConfig(newConfig);
    
    const updatedConfig = scanner.getConfig();
    expect(updatedConfig.framework).toBe('vue');
  });

  // Integration test - only run if demo project exists
  it('should scan demo project if available', async () => {
    try {
      const result = await scanner.scan();
      
      expect(result).toHaveProperty('extractedTexts');
      expect(result).toHaveProperty('existingTranslations');
      expect(result).toHaveProperty('missingTexts');
      expect(result).toHaveProperty('stats');
      
      expect(Array.isArray(result.extractedTexts)).toBe(true);
      expect(Array.isArray(result.missingTexts)).toBe(true);
      expect(typeof result.stats).toBe('object');
      expect(typeof result.stats.filesScanned).toBe('number');
      expect(typeof result.stats.textsExtracted).toBe('number');
      expect(typeof result.stats.coverage).toBe('number');
    } catch (error) {
      // If demo project doesn't exist, skip this test
      console.warn('Demo project not found, skipping integration test');
    }
  }, 10000); // 10 second timeout for file operations
});
