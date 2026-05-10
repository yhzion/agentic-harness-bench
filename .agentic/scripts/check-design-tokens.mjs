import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const srcDir = path.join(root, 'src')
const tokensFile = path.join(srcDir, 'styles', 'tokens.css')

const ALLOWED_RADIUS_VALUES = new Set([
  '0', '0px', '9999px', '50%',
  'var(--radius-none)', 'var(--radius-pill)', 'var(--radius-full)',
])

const FORBIDDEN_FONT_WEIGHT = new Set(['500', '100', '200', '600', '800', '900'])

const violations = []

function listCssFiles(dir) {
  if (!fs.existsSync(dir)) return []
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...listCssFiles(full))
    else if (entry.name.endsWith('.css')) out.push(full)
  }
  return out
}

function stripComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, '')
}

function checkFile(file) {
  const isTokensFile = path.resolve(file) === path.resolve(tokensFile)
  const raw = fs.readFileSync(file, 'utf8')
  const text = stripComments(raw)
  const rel = path.relative(root, file)

  if (!isTokensFile) {
    const hexMatches = text.match(/#[0-9a-fA-F]{3,8}\b/g) || []
    for (const hex of hexMatches) {
      violations.push(`${rel}: 인라인 hex 금지 (${hex}) — var(--color-*) 사용`)
    }
    const rgbMatches = text.match(/\b(rgb|rgba|hsl|hsla)\s*\(/g) || []
    for (const m of rgbMatches) {
      violations.push(`${rel}: 인라인 ${m}( 사용 금지 — var(--color-*) 사용`)
    }
  }

  const declarations = text.match(/[a-z-]+\s*:\s*[^;{}]+/g) || []
  for (const decl of declarations) {
    const colonIndex = decl.indexOf(':')
    const prop = decl.slice(0, colonIndex).trim()
    const value = decl.slice(colonIndex + 1).trim()

    if (prop === 'border-radius') {
      const tokens = value.split(/\s+/)
      for (const token of tokens) {
        if (!ALLOWED_RADIUS_VALUES.has(token)) {
          violations.push(`${rel}: border-radius 비허용 값 (${token}) — 0 또는 9999px만 허용`)
        }
      }
    }

    if (prop === 'box-shadow' && value !== 'none' && value !== 'unset' && value !== 'initial') {
      violations.push(`${rel}: box-shadow 사용 금지 (${value}) — DESIGN.md "No drop shadows"`)
    }

    if (prop === 'font-weight') {
      if (FORBIDDEN_FONT_WEIGHT.has(value)) {
        violations.push(`${rel}: font-weight ${value} 금지 — 300 또는 400 또는 700만 허용`)
      }
    }

    if (prop === 'letter-spacing') {
      if (/^-/.test(value)) {
        violations.push(`${rel}: 음수 letter-spacing 금지 (${value}) — DESIGN.md "No negative letter-spacing"`)
      }
    }
  }
}

const files = listCssFiles(srcDir)

if (files.length === 0) {
  console.log('[design:check] no CSS files yet — skip')
  process.exit(0)
}

if (!fs.existsSync(tokensFile)) {
  console.error(`[design:check] FAIL — src/styles/tokens.css 미존재. 토큰 정의 STEP을 먼저 완료하세요.`)
  process.exit(1)
}

for (const file of files) checkFile(file)

if (violations.length > 0) {
  console.error('[design:check] FAIL — DESIGN.md 토큰 위반:')
  for (const v of violations) console.error('  > ' + v)
  process.exit(1)
}

console.log(`[design:check] PASS — ${files.length}개 CSS 파일 토큰 준수`)
