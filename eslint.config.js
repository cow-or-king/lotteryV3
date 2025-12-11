/**
 * ESLint v9 Configuration
 * Configuration moderne avec flat config
 */

import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import nextPlugin from '@next/eslint-plugin-next';

export default [
  // Configuration de base JavaScript
  js.configs.recommended,

  // Configuration globale
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'dist/**',
      'build/**',
      '.turbo/**',
      'coverage/**',
      '**/*.config.js',
      '**/*.config.mjs',
      'generated/**',
      // Phase 2 - Quick Wins
      'scripts/**', // Scripts Node.js
      'prisma/**', // Scripts Prisma
      '*.config.js', // Fichiers de config
      '*.config.ts', // Fichiers de config TS
      'src/generated/**', // Fichiers générés
      // Temporarily ignore test files to focus on source code
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.spec.ts',
      '**/*.spec.tsx',
      'src/test/**',
      'e2e/**',
    ],
  },

  // Configuration TypeScript
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.json',
      },
      globals: {
        React: 'readonly',
        NodeJS: 'readonly',
        JSX: 'readonly',
        // Phase 2 - Globaux Node.js
        process: 'readonly',
        Buffer: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        // Phase 2 - Globaux Browser
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        fetch: 'readonly',
        crypto: 'readonly',
        global: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      '@next/next': nextPlugin,
    },
    rules: {
      // TypeScript Rules - ZERO any types
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // React Rules
      'react/react-in-jsx-scope': 'off', // Next.js n'en a pas besoin
      'react/prop-types': 'off', // TypeScript gère ça
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',

      // Code Quality Rules
      'max-lines': [
        'warn',
        {
          max: 400,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      complexity: ['warn', 15],

      // Best Practices
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'no-debugger': 'warn',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  // Configuration spécifique pour les fichiers de test
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },
];
