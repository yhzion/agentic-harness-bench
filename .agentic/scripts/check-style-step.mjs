import fs from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
if (args.length === 0) {
  console.error('[style-step] usage: check-style-step.mjs <tsxFile> [<tsxFile> ...]')
  process.exit(1)
}

const root = process.cwd()
const violations = []

const RULES = [
  {
    name: '인라인 style 속성 금지',
    pattern: /\bstyle\s*=\s*[{"]/g,
    hint: 'CSS Module(styles.X)을 사용하세요. style={...} 와 style="..." 모두 금지.',
  },
  {
    name: '인라인 hex 금지',
    pattern: /#[0-9a-fA-F]{3,8}\b/g,
    hint: 'tokens.css의 var(--color-*)을 CSS Module 안에서 사용하세요.',
    excludeIfMatch: /^\s*\/\/|^\s*\/\*/,
  },
  {
    name: '인라인 rgb/rgba/hsl/hsla 금지',
    pattern: /\b(rgb|rgba|hsl|hsla)\s*\(/g,
    hint: 'tokens.css의 var(--color-*)을 CSS Module 안에서 사용하세요.',
  },
]

function checkFile(file) {
  const abs = path.resolve(root, file)
  if (!fs.existsSync(abs)) {
    violations.push(`${file}: 파일이 존재하지 않습니다.`)
    return
  }
  const text = fs.readFileSync(abs, 'utf8')
  const lines = text.split('\n')

  for (const rule of RULES) {
    rule.pattern.lastIndex = 0
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (rule.excludeIfMatch && rule.excludeIfMatch.test(line)) continue
      const matches = line.match(rule.pattern)
      if (matches) {
        for (const m of matches) {
          violations.push(`${file}:${i + 1}: ${rule.name} (${m}) — ${rule.hint}`)
        }
      }
    }
  }
}

for (const file of args) checkFile(file)

if (violations.length > 0) {
  console.error('[style-step] FAIL — Style STEP 가드 위반:')
  for (const v of violations) console.error('  > ' + v)
  console.error('')
  console.error('Style STEP은 .tsx 파일에 className 속성만 추가해야 합니다.')
  console.error('CSS 값은 tokens.css의 var(--*) 토큰을 거쳐서만 표현하세요.')
  process.exit(1)
}

console.log(`[style-step] PASS — ${args.length}개 .tsx 파일 가드 준수`)
