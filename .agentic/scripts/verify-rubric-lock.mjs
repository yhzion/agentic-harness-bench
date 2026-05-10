import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const root = process.cwd()
const rubricFile = path.join(root, '.agentic', 'contracts', 'benchmark-rubric.json')
const lockFile = path.join(root, '.agentic', 'contracts', 'benchmark-rubric.lock.json')

if (!fs.existsSync(rubricFile)) {
  console.error(`[rubric-lock] FAIL — ${path.relative(root, rubricFile)} not found`)
  process.exit(1)
}
if (!fs.existsSync(lockFile)) {
  console.error(`[rubric-lock] FAIL — ${path.relative(root, lockFile)} not found`)
  process.exit(1)
}

const content = fs.readFileSync(rubricFile)
const actual = crypto.createHash('sha256').update(content).digest('hex')

const lock = JSON.parse(fs.readFileSync(lockFile, 'utf8'))
const expected = lock.sha256

if (actual !== expected) {
  console.error('[rubric-lock] FAIL — benchmark-rubric.json sha256 불일치')
  console.error(`  expected: ${expected}`)
  console.error(`  actual:   ${actual}`)
  console.error('  rubric은 평가 중 변경 금지. 의도된 변경이라면 lock을 수동 갱신.')
  process.exit(1)
}

console.log('[rubric-lock] PASS — benchmark-rubric.json 무결성 확인')
