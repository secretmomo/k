import type { Config } from 'prettier';

const config: Config = {
  // 基础格式
  semi: true, // 结尾分号
  singleQuote: true, // 单引号
  printWidth: 100, // 每行最大长度
  tabWidth: 2, // 缩进
  useTabs: false,

  // 代码风格
  trailingComma: 'all', // 多行逗号
  bracketSpacing: true, // { foo: bar }
  arrowParens: 'always', // (x) => {}

  // JSX
  jsxSingleQuote: false,
  jsxBracketSameLine: false,

  // HTML / Vue
  htmlWhitespaceSensitivity: 'ignore',

  // 换行
  endOfLine: 'lf',

  // Markdown
  proseWrap: 'preserve',

  // 文件覆盖（monorepo 很关键）
  overrides: [
    {
      files: '*.md',
      options: {
        printWidth: 80,
        proseWrap: 'always',
      },
    },
    {
      files: '*.json',
      options: {
        printWidth: 80,
      },
    },
    {
      files: '*.yml',
      options: {
        tabWidth: 2,
      },
    },
  ],
};

export default config;
