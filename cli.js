#!/usr/bin/env node

// 简单的 CLI 启动器，调用编译后的主库
const { runInteractiveMenu } = require('./dist/index.js');

// 启动交互式菜单
runInteractiveMenu().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
