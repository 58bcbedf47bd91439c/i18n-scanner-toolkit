import { promises as fs } from 'fs';
import { ScanResult } from '../types';

export class JsonExporter {
  async export(result: ScanResult, outputPath: string): Promise<void> {
    const exportData = {
      timestamp: new Date().toISOString(),
      statistics: result.stats,
      missingTexts: result.missingTexts.map(missing => ({
        text: missing.text,
        suggestedKey: missing.suggestedKey,
        occurrences: missing.occurrences.length,
        files: missing.occurrences.map(occ => ({
          file: occ.filePath,
          line: occ.line,
          column: occ.column,
          context: occ.context
        }))
      })),
      existingTranslations: Object.fromEntries(
        Object.entries(result.existingTranslations).map(([locale, langFile]) => [
          locale,
          {
            locale: langFile.locale,
            format: langFile.format,
            filePath: langFile.filePath,
            translationCount: Object.keys(langFile.translations).length,
            translations: langFile.translations
          }
        ])
      ),
      extractedTexts: result.extractedTexts.map(text => ({
        text: text.text,
        key: text.key,
        file: text.filePath,
        line: text.line,
        column: text.column,
        context: text.context
      }))
    };

    await fs.writeFile(outputPath, JSON.stringify(exportData, null, 2), 'utf-8');
  }
}
