import { spawnSync } from 'node:child_process'
import fs from 'node:fs'

const mode = process.argv[2] || 'full'
const packageJson = fs.existsSync('package.json')
  ? JSON.parse(fs.readFileSync('package.json', 'utf8'))
  : { scripts: {} }

const scripts = packageJson.scripts || {}

const commandsByMode = {
  smoke: [
    ['npm', ['run', 'typecheck']],
  ],
  step: [
    ['npm', ['test']],
    ['npm', ['run', 'typecheck']],
  ],
  full: [
    ['npm', ['test']],
    ['npm', ['run', 'typecheck']],
    ['npm', ['run', 'lint']],
    ['npm', ['run', 'build']],
  ],
}

function hasScript(command) {
  if (command[0] !== 'npm') return true
  if (command[1][0] === 'test') return Boolean(scripts.test)
  if (command[1][0] !== 'run') return true
  return Boolean(scripts[command[1][1]])
}

const commands = commandsByMode[mode] || commandsByMode.full
let failed = false

for (const command of commands) {
  const [bin, args] = command
  if (!hasScript(command)) {
    console.log(`[skip] ${bin} ${args.join(' ')} - script not found`)
    continue
  }

  console.log(`[run] ${bin} ${args.join(' ')}`)
  const result = spawnSync(bin, args, { stdio: 'inherit', shell: process.platform === 'win32' })
  if (result.status !== 0) {
    failed = true
    break
  }
}

if (failed) {
  console.error('[gate] failed')
  process.exit(1)
}

console.log('[gate] passed')
