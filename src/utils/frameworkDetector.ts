import { promises as fs } from 'fs';
import path from 'path';

/**
 * Detect framework based on project files and dependencies
 */
export async function detectFramework(projectDir: string): Promise<string> {
  try {
    // Check package.json for dependencies
    const packageJsonPath = path.join(projectDir, 'package.json');
    
    if (await fs.access(packageJsonPath).then(() => true).catch(() => false)) {
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };

      // React detection
      if (dependencies.react || dependencies['react-dom']) {
        return 'react';
      }

      // Vue detection
      if (dependencies.vue || dependencies['@vue/cli-service']) {
        return 'vue';
      }

      // Angular detection
      if (dependencies['@angular/core'] || dependencies['@angular/cli']) {
        return 'angular';
      }

      // Svelte detection
      if (dependencies.svelte || dependencies['@sveltejs/kit']) {
        return 'svelte';
      }
    }

    // Check for framework-specific files
    const files = await fs.readdir(projectDir);
    
    // Vue project indicators
    if (files.includes('vue.config.js') || files.includes('nuxt.config.js')) {
      return 'vue';
    }

    // Angular project indicators
    if (files.includes('angular.json')) {
      return 'angular';
    }

    // Next.js (React) indicators
    if (files.includes('next.config.js')) {
      return 'react';
    }

    // Check for file extensions in src directory
    const srcDir = path.join(projectDir, 'src');
    if (await fs.access(srcDir).then(() => true).catch(() => false)) {
      const srcFiles = await fs.readdir(srcDir, { recursive: true });
      const extensions = srcFiles
        .filter(file => typeof file === 'string')
        .map(file => path.extname(file as string))
        .filter(ext => ext);

      if (extensions.includes('.vue')) {
        return 'vue';
      }

      if (extensions.includes('.tsx') || extensions.includes('.jsx')) {
        return 'react';
      }
    }

    // Default fallback
    return 'custom';
  } catch (error) {
    console.warn('Failed to detect framework:', error);
    return 'custom';
  }
}
