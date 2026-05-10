import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { canonicalize } from './lock-verbatim-files.mjs'

const root = process.cwd()
const lockFile = path.join(root, '.agentic', 'contracts', 'verbatim-files.lock.json')

if (!fs.existsSync(lockFile)) {
  console.error(`[verbatim] FAIL — missing lock at ${path.relative(root, lockFile)}`)
  console.error('         run: node .agentic/scripts/lock-verbatim-files.mjs')
  process.exit(1)
}

const lock = JSON.parse(fs.readFileSync(lockFile, 'utf8'))
const violations = []
let checked = 0

for (const entry of lock.entries) {
  const targetAbs = path.join(root, entry.target)
  if (!fs.existsSync(targetAbs)) continue

  const actual = canonicalize(fs.readFileSync(targetAbs, 'utf8'))
  const actualSha = crypto.createHash('sha256').update(actual).digest('hex')
  checked++

  if (actualSha !== entry.composite_sha256) {
    violations.push({
      target: entry.target,
      expected_sha: entry.composite_sha256,
      actual_sha: actualSha,
      expected_bytes: entry.composite_bytes,
      actual_bytes: Buffer.byteLength(actual, 'utf8'),
      segment_count: entry.segments.length,
      segments: entry.segments.map((s) => s.step),
    })
  }
}

if (violations.length > 0) {
  console.error('[verbatim] FAIL — sha256 mismatch (verbatim 명세를 한 글자도 변경할 수 없다):')
  for (const v of violations) {
    console.error(`  > ${v.target}  (segments: ${v.segments.join(', ')})`)
    console.error(`      expected sha256: ${v.expected_sha}  (${v.expected_bytes} bytes)`)
    console.error(`      actual   sha256: ${v.actual_sha}  (${v.actual_bytes} bytes)`)
    if (v.actual_bytes > v.expected_bytes) {
      console.error(`      ⚠️  실제 파일이 ${v.actual_bytes - v.expected_bytes} bytes 더 큼 → 추가 코드 의심`)
    } else if (v.actual_bytes < v.expected_bytes) {
      console.error(`      ⚠️  실제 파일이 ${v.expected_bytes - v.actual_bytes} bytes 더 작음 → 누락 의심`)
    } else {
      console.error(`      ⚠️  bytes 동일하나 내용 다름 → 문자/공백 변형 의심`)
    }
  }
  console.error('')
  console.error('변경이 필요하면 STEP 명세 자체를 갱신하고 다음을 실행하라:')
  console.error('  node .agentic/scripts/lock-verbatim-files.mjs')
  process.exit(1)
}

console.log(`[verbatim] PASS — ${checked}/${lock.entries.length} verbatim files match sha256 lock`)
