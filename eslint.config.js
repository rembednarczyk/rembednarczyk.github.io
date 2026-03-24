import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import importPlugin from 'eslint-plugin-import';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      jsxA11y.flatConfigs.recommended,
      react.configs.flat.recommended,
      react.configs.flat['jsx-runtime'],
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'import': importPlugin,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // 1. KRYTYCZNE: Lighthouse 100/100/100/100
      // Zakaz console.log
      'no-console': ['error', { allow: ['warn', 'error'] }],
      // rel="noopener noreferrer" dla zewnętrznych linków
      'react/jsx-no-target-blank': 'error',
      // Wymagaj aria-label dla elementów interaktywnych bez tekstu (np. ikon)
      'jsx-a11y/control-has-associated-label': 'error',
      'jsx-a11y/anchor-has-content': 'error',
      
      // 3. Stylizacja (UI/UX)
      // Brak animacji margin/padding/width we Framer Motion - zapobieganie Layout Thrashing
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXAttribute[name.name='animate'] > JSXExpressionContainer > ObjectExpression > Property[key.name=/^(margin|padding|width|height|top|left|right|bottom)$/]",
          message: "Do not animate layout properties (margin, padding, width, etc.) as it causes Layout Thrashing. Use transform (x, y, scale) or opacity instead."
        }
      ]
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: true,
        node: true,
      },
    },
  },
  {
    files: ['src/components/ui/**/*.{ts,tsx}'],
    rules: {
      // 2. Architektura i Stack
      // Enforce folder structure: UI components shouldn't import from sections
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/sections/*'],
              message: 'UI components should not import from sections to maintain Single Responsibility Principle and reusability.',
            }
          ],
        },
      ],
    }
  },
  {
    files: ['src/components/sections/HeroSection.tsx'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXAttribute[name.name='loading'][value.value='lazy']",
          message: "Do not use loading=\"lazy\" on above-the-fold images (HeroSection). Use fetchpriority=\"high\" instead."
        }
      ]
    }
  }
);
