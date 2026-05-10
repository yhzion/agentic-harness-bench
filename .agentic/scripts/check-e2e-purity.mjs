import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const contractFile = path.join(root, '.agentic', 'contracts', 'e2e-forbidden-apis.json')

if (!fs.existsSync(contractFile)) {
  console.error(`[e2e-purity] FAIL — missing contract: ${path.relative(root, contractFile)}`)
  process.exit(1)
}

const contract = JSON.parse(fs.readFileSync(contractFile, 'utf8'))
const forbidden = contract.forbidden_tokens || []
const includeGlobs = contract.scope?.include || []

const targets = collectFiles('e2e')
const violations = []
let scanned = 0

for (const file of targets) {
  const rel = path.relative(root, file).replace(/\\/g, '/')
  if (!matchesAny(rel, includeGlobs)) continue

  scanned++
  const lines = fs.readFileSync(file, 'utf8').split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const stripped = stripStrings(stripComments(line))

    for (const { token, why } of forbidden) {
      if (stripped.includes(token)) {
        violations.push({ file: rel, line: i + 1, token, why, snippet: line.trim().slice(0, 120) })
      }
    }
  }
}

if (violations.length > 0) {
  console.error('[e2e-purity] FAIL — 검증 환경 무결성 위반 (e2e 가 자기 검증 환경을 조작):')
  for (const v of violations) {
    console.error(`  > ${v.file}:${v.line}  "${v.token}"`)
    console.error(`      이유: ${v.why}`)
    console.error(`      코드: ${v.snippet}`)
  }
  console.error('')
  console.error('e2e 는 실제 사용자처럼 페이지를 조작해야 한다. 우회 API 사용 시 STEP fail.')
  console.error('계약 변경이 필요하면 .agentic/contracts/e2e-forbidden-apis.json 갱신.')
  process.exit(1)
}

console.log(`[e2e-purity] PASS — ${scanned} e2e file(s) scanned, no forbidden API usage`)

function collectFiles(dir) {
  const out = []
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...collectFiles(full))
    else if (/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(entry.name)) out.push(full)
  }
  return out
}

function matchesAny(filePath, patterns) {
  return patterns.some((pat) => globMatches(filePath, pat))
}

function globMatches(filePath, pattern) {
  const DOUBLE = '__GLOB_DOUBLESTAR__'
  const regex = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, DOUBLE)
    .replace(/\*/g, '[^/]*')
    .replace(/\?/g, '[^/]')
    .replace(new RegExp(DOUBLE + '/', 'g'), '(?:.*/)?')
    .replace(new RegExp(DOUBLE, 'g'), '.*')
  return new RegExp('^' + regex + '$').test(filePath)
}

function stripComments(line) {
  return line.replace(/\/\/.*$/, '').replace(/\/\*[\s\S]*?\*\//g, '')
}

function stripStrings(line) {
  return line.replace(/'[^']*'/g, "''").replace(/"[^"]*"/g, '""').replace(/`[^`]*`/g, '``')
}
