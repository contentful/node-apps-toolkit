module.exports = {
  extends: ['@commitlint/config-conventional'],
  ignores: [
    (msg) => msg.includes('Signed-off-by: dependabot[bot]'),
    (msg) => msg.includes('chore(release):'),
  ],
}
