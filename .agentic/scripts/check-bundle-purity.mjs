import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { emit as emitRecoveryHint } from './emit-recovery-hint.mjs'

const root = process.cwd()
const distDir = path.join(root, 'dist')

const BUILD_OUTPUT_PATTERNS = [
  {
    re: /Module\s+["']([^"']+)["']\s+has been externalized for browser compatibility/g,
    label: 'node-builtin-externalized',
    why: 'vite 가 src/ 코드에서 import 한 모듈을 브라우저 호환을 위해 빈 객체로 치환. 런타임에 호출 시 TypeError.',
  },
  {
    re: /node_modules\/[^"]*\/(?:fs|path|os|crypto|child_process|util|buffer|stream)\b/g,
    label: 'node-builtin-resolved-from-deep',
    why: 'transitive dependency 가 Node 빌트인을 참조하는 경우.',
  },
]

console.log('[bundle-purity] running vite build (capturing full output)...')
const build = spawnSync('npx', ['vite', 'build', '--logLevel', 'info'], {
  encoding: 'utf8',
  shell: process.platform === 'win32',
})

if (build.status !== 0) {
  console.error('[bundle-purity] FAIL — vite build exited with', build.status)
  if (build.stdout) console.error(build.stdout)
  if (build.stderr) console.error(build.stderr)
  process.exit(1)
}

const fullOutput = (build.stdout || '') + '\n' + (build.stderr || '')
const violations = []

for (const { re, label, why } of BUILD_OUTPUT_PATTERNS) {
  const matches = [...fullOutput.matchAll(re)]
  for (const m of matches) {
    violations.push({
      label,
      detail: m[0],
      module: m[1] || null,
      why,
    })
  }
}

if (!fs.existsSync(distDir)) {
  console.error('[bundle-purity] FAIL — dist/ not produced by vite build')
  process.exit(1)
}

const assetsDir = path.join(distDir, 'assets')
if (fs.existsSync(assetsDir)) {
  const jsFiles = fs.readdirSync(assetsDir).filter((f) => f.endsWith('.js'))
  for (const file of jsFiles) {
    const content = fs.readFileSync(path.join(assetsDir, file), 'utf8')

    if (/\bt\.exports\s*=\s*\{\s*\}/.test(content) || /[a-zA-Z_$]\.exports\s*=\s*\{\s*\}/.test(content)) {
      const sample = content.match(/.{0,40}\.exports\s*=\s*\{\s*\}.{0,80}/)?.[0] || ''
      violations.push({
        label: 'empty-cjs-shim-in-bundle',
        detail: sample,
        why: '빈 CommonJS module shim 이 번들에 존재. 외부화된 Node 모듈의 흔적. 호출 시 undefined.method TypeError.',
      })
    }
  }
}

if (violations.length > 0) {
  console.error('[bundle-purity] FAIL — bundle 출력에 dead Node module 흔적:')
  for (const v of violations) {
    console.error(`  > [${v.label}]${v.module ? ` module="${v.module}"` : ''}`)
    console.error(`      detail: ${v.detail.slice(0, 200)}`)
    console.error(`      why:    ${v.why}`)
  }
  console.error('')
  console.error('src/ 의 import 문 중 Node 전용 모듈을 찾아 브라우저 글로벌/Web API 로 대체하라.')
  emitRecoveryHint({ gate: 'bundle-purity', violations })
  process.exit(1)
}

console.log('[bundle-purity] PASS — bundle 출력에 Node 외부화 흔적 없음')
