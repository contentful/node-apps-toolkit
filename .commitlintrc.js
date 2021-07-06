module.exports = {
  extends: ['@commitlint/config-conventional'],
  ignores: [(msg) => msg.startsWith('chore(deps)') || msg.startsWith('chore(deps-dev)')],
}
