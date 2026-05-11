import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { snapshotStep } from './snapshot-step.mjs'
import {
  currentStepName,
  editableFilesForCurrentStep,
  isPathAllowed,
} from './step-metadata.mjs'

const root = process.cwd()
const stateDir = path.join(root, '.agentic', 'state')
const progressPath = path.join(root, '.agentic', 'progress.json')

const args = process.argv.slice(2)
const backfill = args.includes('--backfill')
const refreshAll = args.includes('--refresh-all-mismatched')
const refreshSteps = new Set()
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--refresh') {
    const v = args[i + 1]
    if (!v || v.startsWith('--')) {
      console.error('[snapshot-verify] --refresh requires a STEP name')
      process.exit(1)
    }
    refreshSteps.add(v)
    i++
  }
}

if (!fs.existsSync(progressPath)) {
  console.log('[snapshot-verify] no progress.json — nothing to verify')
  process.exit(0)
}

const progress = JSON.parse(fs.readFileSync(progressPath, 'utf8'))
const completed = Array.isArray(progress.completedSteps) ? progress.completedSteps : []

if (completed.length === 0) {
  console.log('[snapshot-verify] no completed steps — nothing to verify')
  process.exit(0)
}

const expected = new Map()
const lockedBy = new Map()
const missingLocks = []

if (refreshSteps.size > 0) {
  for (const stepName of refreshSteps) {
    if (!completed.includes(stepName)) {
      console.error(`[snapshot-verify] --refresh ${stepName}: not in completedSteps; skipping`)
      continue
    }
    try {
      const { lockPath, fileCount } = snapshotStep(stepName)
      console.log(
        `[snapshot-verify] refreshed ${stepName} → ${path.relative(root, lockPath)} (${fileCount} files)`,
      )
    } catch (err) {
      console.error(`[snapshot-verify] FAILED — could not refresh ${stepName}: ${err.message}`)
      process.exit(1)
    }
  }
}

for (const stepName of completed) {
  const lockPath = path.join(stateDir, `${stepName}.lock.json`)
  if (!fs.existsSync(lockPath)) {
    missingLocks.push(stepName)
    continue
  }
  applyLock(lockPath, stepName)
}

if (missingLocks.length > 0) {
  if (!backfill) {
    console.error('[snapshot-verify] FAILED — missing lock files for completed STEP(s):')
    for (const s of missingLocks) console.error(`  > ${s}`)
    console.error('')
    console.error('Run `node .agentic/scripts/verify-step-snapshots.mjs --backfill` to')
    console.error('generate locks from the *current* disk state (only safe if you trust it).')
    process.exit(1)
  }
  console.log(`[snapshot-verify] backfilling locks for ${missingLocks.length} step(s)`)
  for (const stepName of missingLocks) {
    try {
      const { lockPath, fileCount } = snapshotStep(stepName)
      console.log(`  + ${stepName} → ${path.relative(root, lockPath)} (${fileCount} files)`)
      applyLock(lockPath, stepName)
    } catch (err) {
      console.error(`[snapshot-verify] FAILED — could not backfill ${stepName}: ${err.message}`)
      process.exit(1)
    }
  }
}

const missingFiles = []
const mismatches = []

for (const [rel, sha] of expected) {
  const abs = path.join(root, rel)
  if (!fs.existsSync(abs)) {
    missingFiles.push({ file: rel, lockedBy: lockedBy.get(rel) })
    continue
  }
  const buf = fs.readFileSync(abs)
  const actual = 'sha256:' + crypto.createHash('sha256').update(buf).digest('hex')
  if (actual !== sha) {
    mismatches.push({ file: rel, lockedBy: lockedBy.get(rel), expected: sha, actual })
  }
}

if ((missingFiles.length > 0 || mismatches.length > 0) && refreshAll) {
  const affected = new Set([
    ...missingFiles.map((m) => m.lockedBy),
    ...mismatches.map((m) => m.lockedBy),
  ])
  for (const stepName of affected) {
    try {
      const { lockPath, fileCount } = snapshotStep(stepName)
      console.log(
        `[snapshot-verify] refreshed ${stepName} → ${path.relative(root, lockPath)} (${fileCount} files)`,
      )
    } catch (err) {
      console.error(`[snapshot-verify] FAILED — could not refresh ${stepName}: ${err.message}`)
      process.exit(1)
    }
  }
  console.log(
    `[snapshot-verify] PASS (after --refresh-all-mismatched) — refreshed ${affected.size} step lock(s)`,
  )
  process.exit(0)
}

// Auto-refresh: if every mismatched file is in the current STEP's
// "수정 가능 파일" allowlist, treat the drift as a legitimate cross-step
// edit and refresh the affected prior-step locks. Missing files are
// never auto-handled — only modifications.
if (mismatches.length > 0 && missingFiles.length === 0) {
  const currentAllowed = editableFilesForCurrentStep(root)
  if (currentAllowed.length > 0) {
    const unauthorized = mismatches.filter((m) => !isPathAllowed(m.file, currentAllowed))
    if (unauthorized.length === 0) {
      const affected = new Set(mismatches.map((m) => m.lockedBy))
      const currentStep = currentStepName(root) || '(unknown)'
      for (const stepName of affected) {
        try {
          const { lockPath, fileCount } = snapshotStep(stepName)
          const authorized = mismatches.filter((m) => m.lockedBy === stepName).length
          console.log(
            `[snapshot-verify] auto-refreshed ${stepName} → ${path.relative(root, lockPath)} (${fileCount} files; ${authorized} edit(s) authorized by ${currentStep} allowlist)`,
          )
        } catch (err) {
          console.error(`[snapshot-verify] FAILED — could not auto-refresh ${stepName}: ${err.message}`)
          process.exit(1)
        }
      }
      console.log(
        `[snapshot-verify] PASS (auto-refreshed ${affected.size} step lock(s) — drift confined to ${currentStep} allowlist)`,
      )
      process.exit(0)
    }
  }
}

if (missingFiles.length > 0 || mismatches.length > 0) {
  console.error('[snapshot-verify] FAILED — committed STEP artifacts diverge from disk')
  for (const m of missingFiles) {
    console.error(`  > MISSING  ${m.file}  (locked by ${m.lockedBy})`)
  }
  for (const m of mismatches) {
    console.error(`  > MODIFIED ${m.file}  (locked by ${m.lockedBy})`)
    console.error(`      expected ${m.expected}`)
    console.error(`      actual   ${m.actual}`)
  }
  console.error('')
  console.error('A previous STEP\'s deliverable was lost or altered before the current STEP started.')
  console.error('Restore it (e.g. `git checkout <step-commit> -- <file>`) and re-run,')
  console.error('or `--refresh <step>` / `--refresh-all-mismatched` to re-snapshot from disk.')
  process.exit(1)
}

console.log(
  `[snapshot-verify] PASS — ${expected.size} file(s) match locks across ${completed.length} step(s)`,
)

function applyLock(lockPath, stepName) {
  const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'))
  for (const [rel, sha] of Object.entries(lock.files || {})) {
    expected.set(rel, sha)
    lockedBy.set(rel, stepName)
  }
}
