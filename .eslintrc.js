module.exports = {
  parser: '@typescript-eslint/parser',
  env: {
    node: true,
    es2020: true,
  },
  parserOptions: {
    project: './tsconfig.eslint.json',
  },
  plugins: ['@typescript-eslint', 'prettier'],
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  globals: {
    describe: 'readonly',
    it: 'readonly',
    expect: 'readonly',
    beforeAll: 'readonly',
    beforeEach: 'readonly',
    afterAll: 'readonly',
    afterEach: 'readonly',
    vi: 'readonly',
  },
  rules: {
    'no-unused-vars': ['error', { ignoreRestSiblings: true }],
  },
}
