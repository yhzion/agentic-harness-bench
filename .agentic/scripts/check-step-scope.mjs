import { spawnSync } from 'node:child_process'

const result = spawnSync('git', ['status', '--short'], { encoding: 'utf8' })

if (result.status !== 0) {
  console.error('git status failed. This script requires a git repository.')
  process.exit(1)
}

console.log(result.stdout || 'No changes')
console.log('Review changed files against the current STEP allowed files manually or extend this script.')
