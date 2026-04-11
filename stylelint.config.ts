import type { Config } from 'stylelint';

const config: Config = {
  // 基础规则集
  extends: [
    'stylelint-config-standard',
    'stylelint-config-recess-order', // 属性排序（比 stylelint-order 更现代）
  ],

  // 解析不同语法（关键！）
  overrides: [
    {
      files: ['**/*.less'],
      customSyntax: 'postcss-less',
    },
  ],

  rules: {
    // ======================
    // 基础规范
    // ======================
    'color-named': 'never',
    'color-hex-length': 'short',

    // 字体
    'font-family-no-duplicate-names': true,

    // 数值
    'number-max-precision': 4,

    // 字符串
    'string-quotes': 'single',

    // 长度 0 不带单位
    'length-zero-no-unit': true,

    // 空选择器
    'no-empty-source': true,

    // 重复属性
    'declaration-block-no-duplicate-properties': true,

    // 未知属性（允许一些框架字段）
    'property-no-unknown': [
      true,
      {
        ignoreProperties: [
          '/^--/', // CSS variables
        ],
      },
    ],

    // ======================
    // 关闭与 Prettier 冲突的规则
    // ======================
    indentation: null,
    'max-line-length': null,
  },

  ignoreFiles: ['**/node_modules/**', '**/dist/**', '**/build/**'],
};

export default config;
