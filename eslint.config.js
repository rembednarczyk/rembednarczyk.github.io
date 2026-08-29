import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import importPlugin from 'eslint-plugin-import';

/**
 * Flat config replaces rule options rather than merging them, so any
 * override that sets `no-restricted-syntax` must repeat this entry or it
 * silently loses the layout-thrashing protection for those files.
 */
const noLayoutAnimation = {
  selector: "JSXAttribute[name.name='animate'] > JSXExpressionContainer > ObjectExpression > Property[key.name=/^(margin|padding|width|height|top|left|right|bottom)$/]",
  message: "Do not animate layout properties (margin, padding, width, etc.) as it causes Layout Thrashing. Use transform (x, y, scale) or opacity instead."
};

export default tseslint.config(
  { ignores: ['dist', 'storybook-static'] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      jsxA11y.flatConfigs.recommended,
      react.configs.flat.recommended,
      react.configs.flat['jsx-runtime'],
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      // Type information turns on the rules tsc cannot express on its own:
      // floating promises, promises passed where void is expected, and
      // values reaching a template literal that have no useful string form.
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
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
      // 1. CRITICAL: Lighthouse 100/100/100/100
      // Forbid console.log to keep production clean
      'no-console': ['error', { allow: ['warn', 'error'] }],
      // Enforce rel="noopener noreferrer" for external links
      'react/jsx-no-target-blank': 'error',
      // Require aria-label for interactive elements without text (e.g., icons)
      'jsx-a11y/control-has-associated-label': 'error',
      'jsx-a11y/anchor-has-content': 'error',
      
      // 2. Styling (UI/UX)
      // Prevent Layout Thrashing by forbidding margin/padding/width animations in Framer Motion
      'no-restricted-syntax': ['error', noLayoutAnimation]
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
    // Type-aware linting stays on for application code. In test scaffolding it
    // reports third-party typing rather than defects: jest-axe's `axe()` is
    // typed `any`, and the assertion library declares matchers as
    // promise-returning although its synchronous ones return nothing. The
    // assertions themselves are demonstrably effective; the Storybook a11y
    // suite has failed the build on a real contrast violation.
    files: ['**/*.stories.tsx', '**/*.test.{ts,tsx}', 'tests/**/*.ts'],
    extends: [tseslint.configs.disableTypeChecked],
  },
  {
    // The no-console rule exists to keep the shipped bundle clean. A build
    // script that reports what it measured is a command-line tool: its
    // output is the whole point, and none of it reaches a browser.
    files: ['scripts/run*.ts'],
    rules: {
      'no-console': 'off',
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
        noLayoutAnimation,
        {
          selector: "JSXAttribute[name.name='loading'][value.value='lazy']",
          message: "Do not use loading=\"lazy\" on above-the-fold images (HeroSection). Use fetchpriority=\"high\" instead."
        }
      ]
    }
  }
);
