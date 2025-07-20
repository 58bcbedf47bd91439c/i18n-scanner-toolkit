import path from 'path';
import { ExtractedText, I18nConfig } from '../types';
import { presets } from '../presets';

/**
 * Extract texts from file content
 */
export async function extractTextsFromFile(
  content: string,
  filePath: string,
  config: I18nConfig
): Promise<ExtractedText[]> {
  const ext = path.extname(filePath).toLowerCase().slice(1);

  // Use framework-specific extractors if available
  if (config.framework && config.framework in presets) {
    const preset = presets[config.framework as keyof typeof presets];

    for (const extractor of preset.extractors) {
      if (extractor.extensions.includes(ext)) {
        return extractor.extract(content, filePath);
      }
    }
  }

  // Fallback to regex-based extraction
  return extractWithRegex(content, filePath, config);
}

/**
 * Extract texts using regex pattern
 */
function extractWithRegex(
  content: string,
  filePath: string,
  config: I18nConfig
): ExtractedText[] {
  const texts: ExtractedText[] = [];
  const pattern = typeof config.extractPattern === 'string'
    ? new RegExp(config.extractPattern, 'g')
    : config.extractPattern;

  let match;
  while ((match = pattern.exec(content)) !== null) {
    const text = match[1];
    if (!text) continue;

    const lines = content.substring(0, match.index).split('\n');
    const line = lines.length;
    const column = lines[lines.length - 1]?.length || 0;

    texts.push({
      text,
      key: text, // Will be generated later
      filePath,
      line,
      column,
      context: getContext(content, match.index)
    });
  }

  return texts;
}

/**
 * Get context around a match
 */
function getContext(content: string, index: number, contextLength = 50): string {
  const start = Math.max(0, index - contextLength);
  const end = Math.min(content.length, index + contextLength);
  return content.substring(start, end).replace(/\n/g, ' ').trim();
}

/**
 * Extract texts from Vue single file component
 */
export function extractFromVue(content: string, filePath: string): ExtractedText[] {
  const texts: ExtractedText[] = [];

  // Extract from template section
  const templateMatch = content.match(/<template[^>]*>([\s\S]*?)<\/template>/);
  if (templateMatch) {
    const templateContent = templateMatch[1];
    const templateTexts = extractVueTemplateTexts(templateContent || '', filePath);
    texts.push(...templateTexts);
  }

  // Extract from script section
  const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/);
  if (scriptMatch) {
    const scriptContent = scriptMatch[1];
    const scriptTexts = extractVueScriptTexts(scriptContent || '', filePath);
    texts.push(...scriptTexts);
  }

  return texts;
}

/**
 * Extract texts from Vue template
 */
function extractVueTemplateTexts(content: string, filePath: string): ExtractedText[] {
  const texts: ExtractedText[] = [];
  const patterns = [
    /\$t\s*\(\s*['"`]([^'"`]+)['"`]/g,
    /v-t\s*=\s*['"`]([^'"`]+)['"`]/g
  ];

  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const text = match[1];
      const lines = content.substring(0, match.index).split('\n');

      texts.push({
        text: text || '',
        key: text || '',
        filePath,
        line: lines.length,
        column: lines[lines.length - 1]?.length || 0,
        context: getContext(content, match.index)
      });
    }
  });

  return texts;
}

/**
 * Extract texts from Vue script
 */
function extractVueScriptTexts(content: string, filePath: string): ExtractedText[] {
  const texts: ExtractedText[] = [];
  const patterns = [
    /this\.\$t\s*\(\s*['"`]([^'"`]+)['"`]/g,
    /\bt\s*\(\s*['"`]([^'"`]+)['"`]/g
  ];

  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const text = match[1];
      const lines = content.substring(0, match.index).split('\n');

      texts.push({
        text: text || '',
        key: text || '',
        filePath,
        line: lines.length,
        column: lines[lines.length - 1]?.length || 0,
        context: getContext(content, match.index)
      });
    }
  });

  return texts;
}

/**
 * Extract texts from React/JSX files
 */
export function extractFromReact(content: string, filePath: string): ExtractedText[] {
  const texts: ExtractedText[] = [];
  const patterns = [
    // t('key')
    /\bt\s*\(\s*['"`]([^'"`]+)['"`]/g,
    // useTranslation hook
    /useTranslation\s*\(\s*['"`]([^'"`]+)['"`]/g,
    // Trans component
    /<Trans[^>]*i18nKey\s*=\s*['"`]([^'"`]+)['"`]/g
  ];

  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const text = match[1];
      const lines = content.substring(0, match.index).split('\n');

      texts.push({
        text: text || '',
        key: text || '',
        filePath,
        line: lines.length,
        column: lines[lines.length - 1]?.length || 0,
        context: getContext(content, match.index)
      });
    }
  });

  return texts;
}
