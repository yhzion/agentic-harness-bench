import fs from 'node:fs'
import path from 'node:path'
import { emit as emitRecoveryHint } from './emit-recovery-hint.mjs'

const root = process.cwd()
const contractFile = path.join(root, '.agentic', 'contracts', 'src-import-allowlist.json')

if (!fs.existsSync(contractFile)) {
  console.error(`[src-imports] FAIL — missing contract: ${path.relative(root, contractFile)}`)
  process.exit(1)
}

const contract = JSON.parse(fs.readFileSync(contractFile, 'utf8'))
const allowed = new Set(contract.allowed_packages)
const forbidden = new Set(contract.forbidden_explicit)

const includeGlobs = contract.scope?.include || []
const excludeGlobs = contract.scope?.exclude || []

const targets = collectFiles('src')
const violations = []
let scanned = 0

for (const file of targets) {
  const rel = path.relative(root, file).replace(/\\/g, '/')
  if (!matchesAny(rel, includeGlobs)) continue
  if (matchesAny(rel, excludeGlobs)) continue

  scanned++
  const content = fs.readFileSync(file, 'utf8')
  const specifiers = extractImportSpecifiers(content)

  for (const spec of specifiers) {
    if (isRelativeImport(spec.specifier)) continue
    if (forbidden.has(spec.specifier)) {
      violations.push({ file: rel, line: spec.line, specifier: spec.specifier, reason: 'forbidden' })
      continue
    }
    if (!allowed.has(spec.specifier)) {
      violations.push({ file: rel, line: spec.line, specifier: spec.specifier, reason: 'not-in-allowlist' })
    }
  }
}

if (violations.length > 0) {
  console.error('[src-imports] FAIL — disallowed imports in src/:')
  for (const v of violations) {
    console.error(`  > ${v.file}:${v.line}  import "${v.specifier}"  (${v.reason})`)
  }
  console.error('')
  console.error('허용된 specifier 만 사용 가능:')
  console.error(`  allowed:    ${[...allowed].join(', ')}`)
  console.error(`  + 상대경로 import (./, ../)`)
  console.error('계약 변경이 필요하면 .agentic/contracts/src-import-allowlist.json 을 갱신.')
  emitRecoveryHint({ gate: 'src-imports', violations })
  process.exit(1)
}

console.log(`[src-imports] PASS — ${scanned} src file(s) scanned, all imports within allowlist`)

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

function isRelativeImport(spec) {
  return spec.startsWith('./') || spec.startsWith('../') || spec === '.' || spec === '..' || spec.startsWith('/')
}

function extractImportSpecifiers(source) {
  const out = []
  const lines = source.split('\n')
  const patterns = [
    /^\s*import\s+[^'";]*?from\s+['"]([^'"]+)['"]/,
    /^\s*import\s+['"]([^'"]+)['"]/,
    /^\s*export\s+[^'";]*?from\s+['"]([^'"]+)['"]/,
  ]
  const dynamicPattern = /(?:^|[^.\w])(?:import|require)\s*\(\s*['"]([^'"]+)['"]\s*\)/g

  for (let i = 0; i < lines.length; i++) {
    for (const re of patterns) {
      const m = lines[i].match(re)
      if (m) out.push({ line: i + 1, specifier: m[1] })
    }
    let dm
    while ((dm = dynamicPattern.exec(lines[i])) !== null) {
      out.push({ line: i + 1, specifier: dm[1] })
    }
  }
  return out
}
