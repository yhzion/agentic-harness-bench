import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'

const root = process.cwd()
const distAssets = path.join(root, 'dist', 'assets')
const budgetFile = path.join(root, '.agentic', 'contracts', 'bundle-budget.json')

if (!fs.existsSync(distAssets)) {
  console.log('[bundle:check] skip — dist/assets not found (build:strict가 먼저 실행되어야 함)')
  process.exit(0)
}

if (!fs.existsSync(budgetFile)) {
  console.error(`[bundle:check] FAIL — ${path.relative(root, budgetFile)} not found`)
  process.exit(1)
}

const budget = JSON.parse(fs.readFileSync(budgetFile, 'utf8'))
const files = fs.readdirSync(distAssets)

const summary = { js: [], css: [], other: [], totalGz: 0 }
const violations = []

for (const name of files) {
  const full = path.join(distAssets, name)
  const stat = fs.statSync(full)
  if (!stat.isFile()) continue
  const buf = fs.readFileSync(full)
  const gzSize = zlib.gzipSync(buf).length
  const ext = name.endsWith('.js') ? 'js' : name.endsWith('.css') ? 'css' : 'other'
  summary[ext].push({ name, raw: stat.size, gz: gzSize })
  summary.totalGz += gzSize

  const limit = budget.maxFileGzipped?.[ext]
  if (typeof limit === 'number' && gzSize > limit) {
    violations.push(`  ${name}: ${kb(gzSize)} > ${kb(limit)} (per-${ext}-file budget)`)
  }
}

if (typeof budget.maxTotalGzipped === 'number' && summary.totalGz > budget.maxTotalGzipped) {
  violations.push(
    `  total: ${kb(summary.totalGz)} > ${kb(budget.maxTotalGzipped)} (total gzipped budget)`,
  )
}

console.log('[bundle:check] dist/assets gzipped size report:')
for (const ext of ['js', 'css', 'other']) {
  for (const f of summary[ext]) {
    console.log(`  ${ext.padEnd(5)} ${f.name.padEnd(40)} raw ${kb(f.raw).padStart(8)}  gz ${kb(f.gz).padStart(8)}`)
  }
}
console.log(`  total gzipped: ${kb(summary.totalGz)} (budget ${kb(budget.maxTotalGzipped ?? 0)})`)

if (violations.length > 0) {
  console.error('[bundle:check] FAIL — 예산 초과:')
  for (const v of violations) console.error(v)
  process.exit(1)
}

console.log('[bundle:check] PASS')

function kb(bytes) {
  return (bytes / 1024).toFixed(1) + 'KB'
}
