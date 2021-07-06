module.exports = {
  extends: ['@commitlint/config-conventional'],
  ignores: [(msg) => msg.startsWith('chore(deps')],
}
