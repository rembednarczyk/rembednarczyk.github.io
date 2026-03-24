module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: '18.2',
    },
  },
  plugins: ['react-refresh', 'jsx-a11y'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    // 1. KRYTYCZNE: Lighthouse 100/100/100/100
    // Zakaz console.log
    'no-console': ['error', { allow: ['warn', 'error'] }],
    // rel="noopener noreferrer" dla zewnętrznych linków
    'react/jsx-no-target-blank': 'error',
    
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
}
