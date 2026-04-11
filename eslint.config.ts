import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';

import type { Plugin } from '@eslint/config-helpers';
import { defineConfig } from 'eslint/config';

export default defineConfig(
  // 忽略文件
  {
    ignores: ['**/dist/**', '**/build/**', '**/node_modules/**', '**/.turbo/**'],
  },

  // 基础 JS 规则
  js.configs.recommended,

  // TypeScript 推荐规则
  ...tseslint.configs.recommended,

  // 通用规则
  {
    files: ['**/*.{js,ts,jsx,tsx}'],
    plugins: {
      import: importPlugin,
      'unused-imports': unusedImports,
    },
    rules: {
      // 🚫 禁止未使用变量（交给 unused-imports）
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',

      // ✅ 自动删除未使用 import
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

      // import 排序
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
          'newlines-between': 'always',
        },
      ],

      // 代码风格（配合 Prettier）
      'no-console': 'warn',
      'no-debugger': 'warn',
    },
  },

  // React（可选，如果你用 React）
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: {
      react: reactPlugin as Plugin,
      'react-hooks': reactHooks as Plugin,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,

      // React 17+ 不需要 import React
      'react/react-in-jsx-scope': 'off',
    },
  },

  // TypeScript 特殊规则（加强版）
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/consistent-type-imports': 'warn',
      '@typescript-eslint/no-explicit-any': 'off', // 可按团队要求调整
    },
  },
);
