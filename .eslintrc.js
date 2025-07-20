module.exports = {
  root: true,
  env: {
    node: true,
    es2020: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  rules: {
    'prefer-const': 'error',
    'no-var': 'error',
    'no-unused-vars': 'off' // 关闭 JS 的未使用变量检查
  },
  ignorePatterns: [
    'dist/',
    'node_modules/',
    'demo-project/',
    'examples/',
    'scripts/',
    '**/*.js' // 忽略所有 JS 文件，只检查 TS
  ]
};
