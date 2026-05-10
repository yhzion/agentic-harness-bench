import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const mode = process.argv[2] || 'step'
const packageJson = fs.existsSync('package.json')
  ? JSON.parse(fs.readFileSync('package.json', 'utf8'))
  : { scripts: {} }

const scripts = packageJson.scripts || {}

function srcHasFiles(matchExt) {
  function walk(dir) {
    if (!fs.existsSync(dir)) return false
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name)
      if (e.isDirectory()) {
        if (walk(full)) return true
      } else if (matchExt.test(e.name)) {
        return true
      }
    }
    return false
  }
  return walk('src')
}

function isApplicable(command) {
  if (command[0] !== 'npm') return true
  const isRun = command[1][0] === 'run'
  const script = isRun ? command[1][1] : command[1][0]

  if (script === 'typecheck' || script === 'build:strict') {
    return srcHasFiles(/\.(tsx?|jsx?)$/)
  }
  if (script === 'test') {
    return srcHasFiles(/\.test\.(tsx?|jsx?)$/)
  }
  if (script === 'bundle:check') {
    return srcHasFiles(/\.(tsx?|jsx?)$/)
  }
  return true
}

const STRICT_GATE = [
  ['npm', ['run', 'format:check']],
  ['npm', ['run', 'lint']],
  ['npm', ['run', 'typecheck']],
  ['npm', ['test']],
  ['npm', ['run', 'design:lock']],
  ['npm', ['run', 'design:check']],
  ['npm', ['run', 'rubric:lock']],
  ['npm', ['run', 'build:strict']],
  ['npm', ['run', 'bundle:check']],
]

const commandsByMode = {
  smoke: [
    ['npm', ['run', 'typecheck']],
  ],
  step: STRICT_GATE,
}

function hasScript(command) {
  if (command[0] !== 'npm') return true
  if (command[1][0] === 'test') return Boolean(scripts.test)
  if (command[1][0] !== 'run') return true
  return Boolean(scripts[command[1][1]])
}

const commands = commandsByMode[mode] || commandsByMode.step
let failed = false

for (const command of commands) {
  const [bin, args] = command
  if (!hasScript(command)) {
    console.log(`[skip] ${bin} ${args.join(' ')} — script not yet defined in package.json`)
    continue
  }
  if (!isApplicable(command)) {
    console.log(`[skip] ${bin} ${args.join(' ')} — src/ 코드 또는 테스트 파일이 아직 없음`)
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
  console.error('[gate] FAILED — 위 단계 중 첫 실패에서 중단. 같은 STEP을 재실행해 해결 후 다시 시도하세요.')
  process.exit(1)
}

console.log('[gate] PASSED')
