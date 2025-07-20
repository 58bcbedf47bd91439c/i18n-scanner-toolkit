import { describe, it, expect } from 'vitest';
import { createConfig, validateConfig, mergeConfigs } from '../config/loader';
import { presets } from '../presets';

describe('Configuration', () => {
  describe('createConfig', () => {
    it('should create default config', () => {
      const config = createConfig({});
      
      expect(config).toHaveProperty('projectDir');
      expect(config).toHaveProperty('sourceDir');
      expect(config).toHaveProperty('localeDir');
      expect(config).toHaveProperty('extensions');
      expect(config).toHaveProperty('ignoreDirs');
      expect(config).toHaveProperty('defaultLocale');
    });

    it('should merge with React preset', () => {
      const config = createConfig({
        framework: 'react',
        projectDir: './test-project'
      });
      
      expect(config.framework).toBe('react');
      expect(config.extensions).toContain('jsx');
      expect(config.extensions).toContain('tsx');
    });

    it('should merge with Vue preset', () => {
      const config = createConfig({
        framework: 'vue',
        projectDir: './test-project'
      });
      
      expect(config.framework).toBe('vue');
      expect(config.extensions).toContain('vue');
    });

    it('should override preset with user config', () => {
      const config = createConfig({
        framework: 'react',
        projectDir: './test-project',
        extensions: ['js', 'ts'] // Override preset extensions
      });
      
      expect(config.extensions).toEqual(['js', 'ts']);
      expect(config.extensions).not.toContain('jsx');
    });
  });

  describe('validateConfig', () => {
    it('should validate valid config', () => {
      const config = createConfig({
        projectDir: __dirname, // Use current directory which exists
        sourceDir: __dirname,
        localeDir: __dirname
      });
      
      const result = validateConfig(config);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required fields', () => {
      const config = createConfig({});
      config.projectDir = ''; // Invalid
      
      const result = validateConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should detect non-existent directories', () => {
      const config = createConfig({
        projectDir: '/non/existent/directory',
        sourceDir: '/non/existent/source',
        localeDir: '/non/existent/locale'
      });
      
      const result = validateConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors.some(error => error.includes('does not exist'))).toBe(true);
    });
  });

  describe('mergeConfigs', () => {
    it('should merge multiple configs', () => {
      const config1 = { projectDir: './project1', extensions: ['js'] };
      const config2 = { sourceDir: 'src', extensions: ['ts'] };
      const config3 = { localeDir: 'localized' };
      
      const merged = mergeConfigs(config1, config2, config3);
      
      expect(merged.projectDir).toBe('./project1');
      expect(merged.sourceDir).toBe('src');
      expect(merged.localeDir).toBe('localized');
      expect(merged.extensions).toEqual(['ts']); // Last one wins
    });
  });

  describe('presets', () => {
    it('should have React preset', () => {
      expect(presets.react).toBeDefined();
      expect(presets.react.name).toBe('react');
      expect(presets.react.config.extensions).toContain('jsx');
    });

    it('should have Vue preset', () => {
      expect(presets.vue).toBeDefined();
      expect(presets.vue.name).toBe('vue');
      expect(presets.vue.config.extensions).toContain('vue');
    });

    it('should have Angular preset', () => {
      expect(presets.angular).toBeDefined();
      expect(presets.angular.name).toBe('angular');
      expect(presets.angular.config.extensions).toContain('html');
    });

    it('should have custom preset', () => {
      expect(presets.custom).toBeDefined();
      expect(presets.custom.name).toBe('custom');
    });
  });
});
