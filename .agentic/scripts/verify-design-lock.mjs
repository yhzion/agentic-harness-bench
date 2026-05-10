import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const root = process.cwd()
const designFile = path.join(root, '.agentic', 'docs', 'DESIGN.md')
const lockFile = path.join(root, '.agentic', 'contracts', 'design-md.lock.json')

if (!fs.existsSync(designFile)) {
  console.error(`[design-lock] FAIL — ${path.relative(root, designFile)} not found`)
  process.exit(1)
}
if (!fs.existsSync(lockFile)) {
  console.error(`[design-lock] FAIL — ${path.relative(root, lockFile)} not found`)
  process.exit(1)
}

const content = fs.readFileSync(designFile)
const actual = crypto.createHash('sha256').update(content).digest('hex')

const lock = JSON.parse(fs.readFileSync(lockFile, 'utf8'))
const expected = lock.sha256

if (actual !== expected) {
  console.error('[design-lock] FAIL — DESIGN.md sha256 불일치')
  console.error(`  expected: ${expected}`)
  console.error(`  actual:   ${actual}`)
  console.error('  DESIGN.md를 수정했다면 lock 파일을 갱신하세요(승인된 변경에 한함).')
  process.exit(1)
}

console.log('[design-lock] PASS — DESIGN.md 무결성 확인')
