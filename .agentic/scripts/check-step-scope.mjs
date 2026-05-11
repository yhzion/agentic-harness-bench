import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import {
  currentStepName,
  editableFilesForCurrentStep,
  isPathAllowed,
  normalizePath,
} from './step-metadata.mjs'
import { emit as emitRecoveryHint } from './emit-recovery-hint.mjs'

const root = process.cwd()
const args = parseArgs(process.argv.slice(2))
const baselineFile = args.baselineFile || path.join(root, '.agentic', 'scope-baseline.json')
const violationsFile = path.join(root, '.agentic', 'scope-violations.jsonl')

const changedFiles = gitChangedFiles()

if (args.writeBaseline) {
  const target = path.resolve(root, args.writeBaseline)
  fs.writeFileSync(
    target,
    JSON.stringify({ files: changedFiles, at: new Date().toISOString() }, null, 2),
  )
  console.log(`[scope] baseline written: ${path.relative(root, target)}`)
  process.exit(0)
}

const allowedFiles = editableFilesForCurrentStep(root)
if (allowedFiles.length === 0) {
  if (currentStepName(root) === 'DONE') {
    console.log('[scope] PASS — no active STEP')
    process.exit(0)
  }
  console.error('[scope] FAIL — current STEP has no "수정 가능 파일" allowlist.')
  process.exit(1)
}

const baseline = readBaseline(baselineFile)
const outside = changedFiles.filter((file) => {
  if (baseline.has(file)) return false
  if (isGeneratedPath(file)) return false
  return !isPathAllowed(file, allowedFiles)
})

if (outside.length > 0) {
  const payload = {
    at: new Date().toISOString(),
    currentStep: safeCurrentStep(),
    files: outside,
  }
  fs.appendFileSync(violationsFile, JSON.stringify(payload) + '\n')

  console.error('[scope] FAIL — changed files outside current STEP allowlist:')
  for (const file of outside) console.error(`  > ${file}`)
  console.error('')
  console.error('Allowed files:')
  for (const file of allowedFiles) console.error(`  - ${file}`)
  emitRecoveryHint({
    gate: 'step-scope',
    violations: outside.map((f) => ({ file: f, reason: 'outside-allowlist' })),
    extra: { allowed: allowedFiles, currentStep: safeCurrentStep() },
  })
  process.exit(1)
}

console.log(`[scope] PASS — ${changedFiles.length - baseline.size} changed file(s) checked`)

function gitChangedFiles() {
  const result = spawnSync('git', ['status', '--porcelain=v1', '--untracked-files=all'], {
    encoding: 'utf8',
  })

  if (result.status !== 0) {
    console.error('git status failed. This script requires a git repository.')
    process.exit(1)
  }

  return result.stdout
    .split('\n')
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .map((line) => {
      const file = line.slice(3)
      return normalizePath(file.includes(' -> ') ? file.split(' -> ').pop() : file)
    })
}

function readBaseline(file) {
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'))
    return new Set((data.files || []).map(normalizePath))
  } catch {
    return new Set()
  }
}

function isGeneratedPath(file) {
  return (
    file.startsWith('node_modules/') ||
    file.startsWith('dist/') ||
    file.startsWith('coverage/') ||
    file.startsWith('playwright-report/') ||
    file.startsWith('test-results/') ||
    isAgenticRuntimePath(file)
  )
}

// Harness runtime artifacts under .agentic/ — must not influence STEP scope.
// Matched by prefix so new telemetry files (runtime-*, scope-*, progress.*, reports/*)
// are absorbed automatically without touching the allowlist.
function isAgenticRuntimePath(file) {
  if (!file.startsWith('.agentic/')) return false
  const rest = file.slice('.agentic/'.length)
  return (
    rest.startsWith('runtime-') ||
    rest.startsWith('scope-') ||
    rest.startsWith('progress.') ||
    rest.startsWith('reports/')
  )
}

function safeCurrentStep() {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, '.agentic', 'progress.json'), 'utf8')).currentStep
  } catch {
    return null
  }
}

function parseArgs(argv) {
  const out = {}
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--write-baseline') {
      out.writeBaseline = argv[i + 1] || '.agentic/scope-baseline.json'
      i++
    } else if (argv[i] === '--baseline-file') {
      out.baselineFile = argv[i + 1]
      i++
    }
  }
  return out
}
