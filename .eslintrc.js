module.exports = {
  parser: '@typescript-eslint/parser',
  env: {
    node: true,
    mocha: true,
  },
  plugins: ['@typescript-eslint', 'prettier'],
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  rules: {
    'no-unused-vars': ['error', { ignoreRestSiblings: true }],
  },
}
