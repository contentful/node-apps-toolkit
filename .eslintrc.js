module.exports = {
  parser: "@typescript-eslint/parser",
  env: {
    node: true,
    mocha: true
  },
  plugins: [
    "@typescript-eslint"
  ],
  extends: [
    "eslint:recommended",
    "prettier/@typescript-eslint",
    "plugin:prettier/recommended",
  ]
}