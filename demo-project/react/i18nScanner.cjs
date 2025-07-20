const {I18nScanner} = require('./../../dist/index.js');

async function testNewAPI() {
  try {
    console.log('🔍 测试新的 API...');

    const config = {
      "framework": "custom",
      "projectDir": "./",
      "sourceDir": "src",
      "localeDir": "src/localized/strings",
      "extensions": ["js", "jsx", "ts", "tsx"],
      "ignoreDirs": ["node_modules", ".git", "dist", "build"],
      "ignoreKeyPatterns": ["src", "components", "utils", "common", "hooks"],
      "defaultLocale": "zh_hans.js",
      "extractPattern": /\$LS\s*\(\s*["'`]([^"'`]+)["'`]\s*\)/g
    };

    // 创建扫描器实例
    const scanner = new I18nScanner(config);

    console.log('\n📋 测试 1: scanner.scanAll() - 扫描所有文件并返回缺失翻译');
    const missingTranslations = await scanner.scanAll();

    console.log('🔧 缺失翻译的 JSON:');
    console.log(missingTranslations);
return
    console.log('\n📋 测试 2: scanner.export() - 导出 CSV 文件');
    const csvPath = await scanner.export('./missing-translations.csv');
    console.log(`✅ CSV 文件已导出到: ${csvPath}`);

    console.log('\n📋 测试 3: scanner.import() - 从 CSV 导入翻译');
    try {
      await scanner.import('./missing-translations.csv');
      console.log('✅ 成功从 CSV 导入翻译');
    } catch (error) {
      console.log('⚠️  导入测试跳过:', error.message);
    }

    console.log('\n🎉 所有测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error(error.stack);
  }
}

// 运行测试
testNewAPI();
