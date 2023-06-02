module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    sourceType: 'module',
    tsconfigRootDir: __dirname,
    ecmaVersion: 12,
  },
  extends: ['airbnb-base', 'airbnb-typescript/base', 'prettier'],
  root: true,
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    'no-console': 'off',
    'max-classes-per-file': 'off',
    'no-plusplus': 'off',
    'import/prefer-default-export': 'off',
    "class-methods-use-this": "off",
    "no-useless-constructor": 0
  },
}
