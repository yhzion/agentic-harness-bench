import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import {
  currentStepNumber,
  editableFilesForCurrentStep,
  normalizePath,
} from './step-metadata.mjs'

const root = process.cwd()
const mode = process.argv[2] || 'step'
const packageJson = fs.existsSync('package.json')
  ? JSON.parse(fs.readFileSync('package.json', 'utf8'))
  : { scripts: {} }
const scripts = packageJson.scripts || {}
const stepNumber = currentStepNumber(root)

const COMMANDS = {
  bootstrap: [
    cmd('npm', ['run', 'typecheck'], {
      script: 'typecheck',
      introducedAt: 1,
      applicable: codeFiles,
    }),
    cmd('npm', ['test'], { script: 'test', introducedAt: 1, applicable: testFiles }),
  ],
  step: [
    cmd('node', ['.agentic/scripts/check-step-scope.mjs'], { introducedAt: 1 }),
    cmd('node', ['.agentic/scripts/verify-tests-verbatim.mjs'], { introducedAt: 1 }),
    cmd('node', ['.agentic/scripts/check-src-imports.mjs'], { introducedAt: 1, applicable: codeFiles }),
    cmd('node', ['.agentic/scripts/check-e2e-purity.mjs'], { introducedAt: 31 }),
    cmd('npm', ['run', 'format:check'], { script: 'format:check', introducedAt: 3 }),
    cmd('npm', ['run', 'lint'], { script: 'lint', introducedAt: 3 }),
    cmd('npm', ['run', 'typecheck'], {
      script: 'typecheck',
      introducedAt: 1,
      applicable: codeFiles,
    }),
    cmd('npm', ['test'], { script: 'test', introducedAt: 1, applicable: testFiles }),
    cmd('npm', ['run', 'design:lock'], { script: 'design:lock', introducedAt: 3 }),
    cmd('npm', ['run', 'design:check'], { script: 'design:check', introducedAt: 3 }),
    cmd('npm', ['run', 'rubric:lock'], { script: 'rubric:lock', introducedAt: 3 }),
    cmd('npm', ['run', 'build:strict'], {
      script: 'build:strict',
      introducedAt: 3,
      applicable: codeFiles,
    }),
    cmd('npm', ['run', 'bundle:check'], {
      script: 'bundle:check',
      introducedAt: 3,
      applicable: codeFiles,
    }),
    cmd('node', ['.agentic/scripts/check-bundle-purity.mjs'], {
      introducedAt: 3,
      applicable: codeFiles,
    }),
  ],
  full: [
    cmd('node', ['.agentic/scripts/check-step-scope.mjs'], { introducedAt: 1 }),
    cmd('node', ['.agentic/scripts/verify-tests-verbatim.mjs'], { introducedAt: 1 }),
    cmd('node', ['.agentic/scripts/check-src-imports.mjs'], { introducedAt: 1, applicable: codeFiles }),
    cmd('node', ['.agentic/scripts/check-e2e-purity.mjs'], { introducedAt: 31 }),
    cmd('npm', ['run', 'format:check'], { script: 'format:check', introducedAt: 3 }),
    cmd('npm', ['run', 'lint'], { script: 'lint', introducedAt: 3 }),
    cmd('npm', ['run', 'typecheck'], {
      script: 'typecheck',
      introducedAt: 1,
      applicable: codeFiles,
    }),
    cmd('npm', ['test'], { script: 'test', introducedAt: 1, applicable: testFiles }),
    cmd('npm', ['run', 'design:lock'], { script: 'design:lock', introducedAt: 3 }),
    cmd('npm', ['run', 'design:check'], { script: 'design:check', introducedAt: 3 }),
    cmd('npm', ['run', 'rubric:lock'], { script: 'rubric:lock', introducedAt: 3 }),
    cmd('npm', ['run', 'build:strict'], {
      script: 'build:strict',
      introducedAt: 3,
      applicable: codeFiles,
    }),
    cmd('npm', ['run', 'bundle:check'], {
      script: 'bundle:check',
      introducedAt: 3,
      applicable: codeFiles,
    }),
    cmd('node', ['.agentic/scripts/check-bundle-purity.mjs'], {
      introducedAt: 3,
      applicable: codeFiles,
    }),
    cmd('npm', ['run', 'preview:check'], { script: 'preview:check', introducedAt: 30 }),
    cmd('node', ['.agentic/scripts/check-real-smoke.mjs'], { introducedAt: 30, applicable: codeFiles }),
    cmd('npm', ['run', 'e2e'], { script: 'e2e', introducedAt: 31 }),
  ],
  smoke: [
    cmd('npm', ['run', 'typecheck'], {
      script: 'typecheck',
      introducedAt: 1,
      applicable: codeFiles,
    }),
  ],
}

if (!COMMANDS[mode]) {
  console.error(`[gate] FAILED — unknown mode "${mode}". Use smoke, bootstrap, step, or full.`)
  process.exit(2)
}

const missingEditableFiles = editableFilesForCurrentStep(root)
  .filter((file) => !hasGlob(file))
  .filter((file) => !fs.existsSync(path.join(root, normalizePath(file))))

if (missingEditableFiles.length > 0) {
  console.error('[gate] FAILED — missing editable files required by current STEP:')
  for (const file of missingEditableFiles) console.error(`  > ${file}`)
  process.exit(1)
}

ensureDependenciesInstalled()

let failed = false
for (const command of COMMANDS[mode]) {
  if (!hasCommand(command)) {
    if (stepNumber < command.introducedAt) {
      console.log(
        `[skip] ${command.bin} ${command.args.join(' ')} — introduced at STEP ${padStep(
          command.introducedAt,
        )}`,
      )
      continue
    }
    console.error(
      `[gate] FAILED — required npm script "${command.script}" missing after STEP ${padStep(
        command.introducedAt,
      )}`,
    )
    failed = true
    break
  }

  if (command.applicable && !command.applicable()) {
    console.log(`[skip] ${command.bin} ${command.args.join(' ')} — not applicable yet`)
    continue
  }

  console.log(`[run] ${command.bin} ${command.args.join(' ')}`)
  const result = spawnSync(command.bin, command.args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })
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

function cmd(bin, args, options = {}) {
  return { bin, args, introducedAt: 1, ...options }
}

function hasCommand(command) {
  if (command.bin !== 'npm') return true
  if (!command.script) return true
  return Boolean(scripts[command.script])
}

function srcHasFiles(matchExt) {
  function walk(dir) {
    if (!fs.existsSync(dir)) return false
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        if (walk(full)) return true
      } else if (matchExt.test(entry.name)) {
        return true
      }
    }
    return false
  }
  return walk('src')
}

function codeFiles() {
  return srcHasFiles(/\.(tsx?|jsx?)$/)
}

function testFiles() {
  return srcHasFiles(/\.test\.(tsx?|jsx?)$/)
}

function ensureDependenciesInstalled() {
  if (process.env.AGENTIC_SKIP_NPM_INSTALL === '1') return
  if (fs.existsSync(path.join(root, 'node_modules'))) return
  const dependencyCount =
    Object.keys(packageJson.dependencies || {}).length +
    Object.keys(packageJson.devDependencies || {}).length
  if (dependencyCount === 0) return

  console.log('[gate] node_modules missing — running npm install --no-audit --no-fund')
  const result = spawnSync('npm', ['install', '--no-audit', '--no-fund'], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })
  if (result.status !== 0) {
    console.error('[gate] FAILED — npm install failed')
    process.exit(result.status ?? 1)
  }
}

function hasGlob(file) {
  return /[*?[\]]/.test(file)
}

function padStep(n) {
  return String(n).padStart(3, '0')
}
