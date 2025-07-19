module.exports = {
    parser: '@typescript-eslint/parser',
    extends: [
      'eslint:recommended',
      '@typescript-eslint/recommended',
    ],
    plugins: ['@typescript-eslint'],
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': 'warn',
      'prefer-const': 'error',
    },
    env: {
      node: true,
      es6: true,
    },
  };