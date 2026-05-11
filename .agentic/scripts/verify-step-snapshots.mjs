import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { snapshotStep } from './snapshot-step.mjs'

const root = process.cwd()
const stateDir = path.join(root, '.agentic', 'state')
const progressPath = path.join(root, '.agentic', 'progress.json')

const args = process.argv.slice(2)
const backfill = args.includes('--backfill')

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
  console.error('Restore it (e.g. `git checkout <step-commit> -- <file>`) and re-run.')
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
