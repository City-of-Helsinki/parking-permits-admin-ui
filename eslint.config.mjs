import js from '@eslint/js';
import importX from 'eslint-plugin-import-x';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['build', 'coverage', 'src/serviceWorker.ts'] },
  js.configs.recommended,
  tseslint.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  jsxA11y.flatConfigs.recommended,
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,
  {
    files: ['**/*.{js,ts,tsx,mts}'],
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { 'react-hooks': reactHooks },
    settings: {
      react: { version: 'detect' },
      'import-x/resolver': { typescript: { project: './tsconfig.json' } },
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react/function-component-definition': [
        'error',
        {
          namedComponents: 'arrow-function',
          unnamedComponents: 'arrow-function',
        },
      ],
      'react/jsx-no-useless-fragment': 'off',
      'react/prop-types': 'off',
      'react/require-default-props': 'off',
      'react/destructuring-assignment': 'off',
      'react/static-property-placement': 'off',
      'react/jsx-props-no-spreading': 'off',
      'react/no-array-index-key': 'error',
      'jsx-a11y/alt-text': 'off',
      'no-unused-vars': 'off',
      'no-console': 'warn',
      'no-magic-numbers': [
        'error',
        {
          ignoreArrayIndexes: true,
          ignore: [1000, -1, 0, 1, 2, 3, 4, 5, 100, 90, 80, 70, 60, 50, 10],
        },
      ],
      'arrow-body-style': ['error', 'as-needed'],
      'line-comment-position': ['error', { position: 'above' }],
      'no-restricted-imports': ['error', { patterns: [' * as'] }],
      'no-underscore-dangle': ['error', { allow: ['__typename'] }],
      'no-case-declarations': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      'import-x/no-named-as-default': 'off',
      'import-x/no-named-as-default-member': 'off',
    },
  }
);
