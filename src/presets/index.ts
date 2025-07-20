import { FrameworkPreset, ExtractedText } from '../types';

/**
 * React framework preset
 */
export const ReactPreset: FrameworkPreset = {
  name: 'react',
  config: {
    extensions: ['js', 'jsx', 'ts', 'tsx'],
    ignoreDirs: ['node_modules', '.git', 'dist', 'build', '.next'],
    extractPattern: /(?:useTranslation|t)\s*\(\s*['"`]([^'"`]+)['"`]/g,
    defaultLocale: 'en.json'
  },
  extractors: [
    {
      name: 'react-i18next',
      extensions: ['js', 'jsx', 'ts', 'tsx'],
      extract: (content: string, filePath: string): ExtractedText[] => {
        const texts: ExtractedText[] = [];
        const patterns = [
          // t('key') or t("key")
          /\bt\s*\(\s*['"`]([^'"`]+)['"`]/g,
          // useTranslation hook
          /useTranslation\s*\(\s*['"`]([^'"`]+)['"`]/g,
          // Trans component
          /<Trans[^>]*i18nKey\s*=\s*['"`]([^'"`]+)['"`]/g,
          // Translation function calls
          /(?:translate|i18n\.t)\s*\(\s*['"`]([^'"`]+)['"`]/g
        ];

        patterns.forEach(pattern => {
          let match;
          while ((match = pattern.exec(content)) !== null) {
            const text = match[1];
            const lines = content.substring(0, match.index).split('\n');
            texts.push({
              text,
              key: text, // In react-i18next, key is often the same as text
              filePath,
              line: lines.length,
              column: lines[lines.length - 1]?.length || 0,
              context: getContext(content, match.index)
            });
          }
        });

        return texts;
      }
    }
  ]
};

/**
 * Vue framework preset
 */
export const VuePreset: FrameworkPreset = {
  name: 'vue',
  config: {
    extensions: ['vue', 'js', 'ts'],
    ignoreDirs: ['node_modules', '.git', 'dist', 'build'],
    extractPattern: /\$t\s*\(\s*['"`]([^'"`]+)['"`]/g,
    defaultLocale: 'zh-CN.js'
  },
  extractors: [
    {
      name: 'vue-i18n',
      extensions: ['vue', 'js', 'ts'],
      extract: (content: string, filePath: string): ExtractedText[] => {
        const texts: ExtractedText[] = [];
        const patterns = [
          // $t('key') in templates
          /\$t\s*\(\s*['"`]([^'"`]+)['"`]/g,
          // this.$t('key') in script
          /this\.\$t\s*\(\s*['"`]([^'"`]+)['"`]/g,
          // t('key') with composition API
          /\bt\s*\(\s*['"`]([^'"`]+)['"`]/g,
          // i18n.global.t('key')
          /i18n\.global\.t\s*\(\s*['"`]([^'"`]+)['"`]/g
        ];

        patterns.forEach(pattern => {
          let match;
          while ((match = pattern.exec(content)) !== null) {
            const text = match[1];
            const lines = content.substring(0, match.index).split('\n');
            texts.push({
              text,
              key: text,
              filePath,
              line: lines.length,
              column: lines[lines.length - 1]?.length || 0,
              context: getContext(content, match.index)
            });
          }
        });

        return texts;
      }
    }
  ]
};

/**
 * Angular framework preset
 */
export const AngularPreset: FrameworkPreset = {
  name: 'angular',
  config: {
    extensions: ['ts', 'html'],
    ignoreDirs: ['node_modules', '.git', 'dist', 'build'],
    extractPattern: /(?:translate\.get|translate\.instant)\s*\(\s*['"`]([^'"`]+)['"`]/g,
    defaultLocale: 'en.json'
  },
  extractors: [
    {
      name: 'ngx-translate',
      extensions: ['ts', 'html'],
      extract: (content: string, filePath: string): ExtractedText[] => {
        const texts: ExtractedText[] = [];
        const patterns = [
          // translate.get('key')
          /translate\.get\s*\(\s*['"`]([^'"`]+)['"`]/g,
          // translate.instant('key')
          /translate\.instant\s*\(\s*['"`]([^'"`]+)['"`]/g,
          // | translate pipe in templates
          /['"`]([^'"`]+)['"`]\s*\|\s*translate/g,
          // translate directive
          /translate\s*=\s*['"`]([^'"`]+)['"`]/g
        ];

        patterns.forEach(pattern => {
          let match;
          while ((match = pattern.exec(content)) !== null) {
            const text = match[1];
            const lines = content.substring(0, match.index).split('\n');
            texts.push({
              text,
              key: text,
              filePath,
              line: lines.length,
              column: lines[lines.length - 1]?.length || 0,
              context: getContext(content, match.index)
            });
          }
        });

        return texts;
      }
    }
  ]
};

/**
 * Custom preset for legacy projects
 */
export const CustomPreset: FrameworkPreset = {
  name: 'custom',
  config: {
    extensions: ['js', 'jsx', 'ts', 'tsx', 'vue'],
    ignoreDirs: ['node_modules', '.git', 'dist', 'build'],
    extractPattern: /\$LS\s*\(\s*['"`]([^'"`]+)['"`]/g,
    defaultLocale: 'zh_hans.js'
  },
  extractors: [
    {
      name: 'custom-extractor',
      extensions: ['js', 'jsx', 'ts', 'tsx', 'vue'],
      extract: (content: string, filePath: string): ExtractedText[] => {
        const texts: ExtractedText[] = [];
        const patterns = [
          // $LS('text') - legacy pattern
          /\$LS\s*\(\s*['"`]([^'"`]+)['"`]/g,
          // $LSALL('text') - server pattern
          /\$LSALL\s*\(\s*['"`]([^'"`]+)['"`]/g,
          // YYLocalized('text') - iOS pattern
          /YYLocalized\s*\(\s*@?['"`]([^'"`]+)['"`]/g
        ];

        patterns.forEach(pattern => {
          let match;
          while ((match = pattern.exec(content)) !== null) {
            const text = match[1];
            const lines = content.substring(0, match.index).split('\n');
            texts.push({
              text,
              key: generateKeyFromText(text, filePath || ''),
              filePath,
              line: lines.length,
              column: lines[lines.length - 1]?.length || 0,
              context: getContext(content, match.index)
            });
          }
        });

        return texts;
      }
    }
  ]
};

/**
 * Get context around a match
 */
function getContext(content: string, index: number, contextLength = 50): string {
  const start = Math.max(0, index - contextLength);
  const end = Math.min(content.length, index + contextLength);
  return content.substring(start, end).replace(/\n/g, ' ').trim();
}

/**
 * Generate key from text for legacy projects
 */
function generateKeyFromText(text: string, filePath: string): string {
  // Simple key generation - can be enhanced
  const filename = filePath.split('/').pop()?.replace(/\.[^.]+$/, '') || 'unknown';
  const textKey = text
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '_')
    .toLowerCase()
    .substring(0, 20);

  return `${filename}_${textKey}`;
}

export const presets = {
  react: ReactPreset,
  vue: VuePreset,
  angular: AngularPreset,
  custom: CustomPreset
};
