import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const stepsDir = path.join(root, '.agentic', 'steps')

const violations = []
const checked = []

if (!fs.existsSync(stepsDir)) {
  console.log('[verbatim] no steps dir — skip')
  process.exit(0)
}

const VERBATIM_RE = /verbatim\s*(?:복사|append)[^\n]*?→\s*([^\s)]+\.(?:ts|tsx))/g
const CODE_BLOCK_RE = /```[a-zA-Z0-9]*\n([\s\S]*?)```/

const stepFiles = fs.readdirSync(stepsDir).filter((f) => /^\d{3}-.*\.md$/.test(f))

for (const stepFile of stepFiles) {
  const stepPath = path.join(stepsDir, stepFile)
  const content = fs.readFileSync(stepPath, 'utf8')

  for (const match of content.matchAll(VERBATIM_RE)) {
    const targetPath = match[1].trim()
    const afterMatch = content.slice(match.index + match[0].length)
    const blockMatch = afterMatch.match(CODE_BLOCK_RE)
    if (!blockMatch) continue

    const expectedCode = blockMatch[1]
    const targetAbs = path.join(root, targetPath)

    if (!fs.existsSync(targetAbs)) continue

    const actualCode = fs.readFileSync(targetAbs, 'utf8')

    const expectedLines = expectedCode
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !/^\/\//.test(l) && !/^\/\*/.test(l))

    let missing = 0
    const sample = []
    for (const line of expectedLines) {
      if (!actualCode.includes(line)) {
        missing++
        if (sample.length < 3) sample.push(line)
      }
    }

    checked.push(`${stepFile} ↔ ${targetPath}`)

    if (missing > 0) {
      violations.push({
        step: stepFile,
        target: targetPath,
        missing_lines: missing,
        total_expected: expectedLines.length,
        sample,
      })
    }
  }
}

if (violations.length > 0) {
  console.error('[verbatim] FAIL — verbatim 명세와 실제 파일 불일치:')
  for (const v of violations) {
    console.error(
      `  > ${v.step} ↔ ${v.target}: ${v.missing_lines}/${v.total_expected} 라인 누락`,
    )
    for (const s of v.sample) console.error(`      missing: ${s.slice(0, 80)}`)
  }
  console.error('')
  console.error('verbatim으로 명시된 테스트/시그니처 코드는 LLM이 변경할 수 없다.')
  console.error('변경이 필요하면 STEP 명세 자체를 갱신하고 lock 파일을 재생성해야 한다.')
  process.exit(1)
}

console.log(`[verbatim] PASS — ${checked.length}개 verbatim 명세 일치`)
