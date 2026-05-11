import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const benchmarkDir = path.join(root, '.agentic', 'benchmarks')

if (!fs.existsSync(benchmarkDir)) {
  console.error('[leaderboard] no benchmarks directory — run score-run.mjs first.')
  process.exit(1)
}

const files = fs
  .readdirSync(benchmarkDir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => path.join(benchmarkDir, f))

if (files.length === 0) {
  console.error('[leaderboard] no benchmark JSON files found.')
  process.exit(1)
}

const runs = []
let rubricSha = null
let rubricVersion = null

for (const file of files) {
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'))
    if (rubricSha && data.rubric_sha256 !== rubricSha) {
      console.error(
        `[leaderboard] WARN — ${path.basename(file)} uses different rubric sha256 (${data.rubric_sha256}); skipping for fairness.`,
      )
      continue
    }
    rubricSha = data.rubric_sha256
    rubricVersion = data.rubric_version
    runs.push(data)
  } catch (err) {
    console.error(`[leaderboard] WARN — failed to parse ${file}: ${err.message}`)
  }
}

if (runs.length === 0) {
  console.error('[leaderboard] no valid runs after rubric consistency check.')
  process.exit(1)
}

runs.sort((a, b) => (b.final_score_0_to_100 || 0) - (a.final_score_0_to_100 || 0))

function fmt(n, digits = 1) {
  if (typeof n !== 'number' || Number.isNaN(n)) return '—'
  return n.toFixed(digits)
}

function pct(n) {
  if (typeof n !== 'number' || Number.isNaN(n)) return '—'
  return (n * 100).toFixed(1) + '%'
}

const out = []
out.push('# Benchmark Leaderboard')
out.push('')
out.push(`- Rubric version: \`${rubricVersion}\``)
out.push(`- Rubric sha256: \`${rubricSha}\``)
out.push(`- Runs included: ${runs.length}`)
out.push(`- Generated: ${new Date().toISOString()}`)
out.push('')
out.push('All scores are produced by deterministic tools only. No LLM-as-judge.')
out.push('')
out.push('## Total ranking')
out.push('')
out.push('| Rank | Model tag | Final | Correct | Robust | Quality | Efficiency | Discipline |')
out.push('|---:|:---|---:|---:|---:|---:|---:|---:|')

runs.forEach((r, i) => {
  const a = r.axis_scores || {}
  out.push(
    `| ${i + 1} | \`${r.tag}\` | **${fmt(r.final_score_0_to_100, 1)}** | ${pct(
      a.correctness,
    )} | ${pct(a.robustness)} | ${pct(a.quality)} | ${pct(a.efficiency)} | ${pct(a.discipline)} |`,
  )
})

out.push('')
out.push('## Axis breakdown — raw values')
out.push('')

for (const r of runs) {
  out.push(`### \`${r.tag}\``)
  out.push('')
  out.push(`- Final: **${fmt(r.final_score_0_to_100, 1)} / 100**`)

  const m = r.metrics_detail || {}
  const lines = []

  const c = m.correctness?.step_pass_rate
  if (c) lines.push(`- correctness.step_pass_rate: **${c.raw}/${c.max}** (${pct(c.normalized)})`)

  const eh = m.robustness?.e2e_happy_pass
  const ee = m.robustness?.e2e_edge_pass
  if (eh) lines.push(`- robustness.e2e_happy: **${eh.raw}/${eh.max}** (${pct(eh.normalized)})`)
  if (ee) lines.push(`- robustness.e2e_edge: **${ee.raw}/${ee.max}** (${pct(ee.normalized)})`)

  const qe = m.quality || {}
  if (qe.eslint_violations)
    lines.push(`- quality.eslint_violations: ${qe.eslint_violations.raw} (cap ${qe.eslint_violations.cap})`)
  if (qe.tsc_errors)
    lines.push(`- quality.tsc_errors: ${qe.tsc_errors.raw} (cap ${qe.tsc_errors.cap})`)
  if (qe.design_token_violations)
    lines.push(
      `- quality.design_token_violations: ${qe.design_token_violations.raw} (cap ${qe.design_token_violations.cap})`,
    )
  if (qe.a11y_violations)
    lines.push(`- quality.a11y_violations: ${qe.a11y_violations.raw} (cap ${qe.a11y_violations.cap})`)

  const ef = m.efficiency || {}
  if (ef.first_pass_rate) lines.push(`- efficiency.first_pass_rate: ${pct(ef.first_pass_rate.raw)}`)
  if (ef.avg_retries) lines.push(`- efficiency.avg_retries: ${fmt(ef.avg_retries.raw, 2)}`)
  if (ef.wall_time_seconds)
    lines.push(`- efficiency.wall_time: ${fmt(ef.wall_time_seconds.raw, 0)}s`)

  const di = m.discipline || {}
  if (di.scope_violations) lines.push(`- discipline.scope_violations: ${di.scope_violations.raw}`)
  if (di.signature_violations)
    lines.push(`- discipline.signature_violations: ${di.signature_violations.raw}`)

  out.push(...lines)
  out.push('')
}

out.push('## Token efficiency')
out.push('')
out.push('| Rank | Model tag | Steps✓ | Wall(s) | In total | Out total | Out/step | Tok/s |')
out.push('|---:|:---|---:|---:|---:|---:|---:|---:|')

const tokenRows = runs
  .map((r) => {
    const t = r.token_totals || { input: 0, output: 0, cache_read: 0 }
    const stepsOk = r.steps_completed || 0
    const outPerStep = stepsOk > 0 ? t.output / stepsOk : 0
    return {
      tag: r.tag,
      stepsOk,
      wall: r.wall_time_seconds || 0,
      input: t.input || 0,
      output: t.output || 0,
      outPerStep,
      tps: r.output_tok_per_sec || 0,
    }
  })
  .sort((a, b) => b.tps - a.tps)

tokenRows.forEach((r, i) => {
  out.push(
    `| ${i + 1} | \`${r.tag}\` | ${r.stepsOk} | ${fmt(r.wall, 1)} | ${r.input} | ${r.output} | ${fmt(r.outPerStep, 0)} | ${fmt(r.tps, 1)} |`,
  )
})
out.push('')

out.push('## Per-step breakdown')
out.push('')
for (const r of runs) {
  if (!Array.isArray(r.per_step) || r.per_step.length === 0) continue
  out.push(`### \`${r.tag}\``)
  out.push('')
  out.push('| # | Step | Attempts | Wall(s) | In | Out | Tok/s | Gate |')
  out.push('|---:|:---|---:|---:|---:|---:|---:|:---:|')
  for (const s of r.per_step) {
    const wall = (s.elapsed_ms || 0) / 1000
    const gate = s.gate_pass === true ? '✓' : s.gate_pass === false ? '✗' : '—'
    out.push(
      `| ${s.step_num ?? '—'} | ${s.step_name ?? '—'} | ${s.attempts ?? 1} | ${fmt(wall, 1)} | ${s.in ?? 0} | ${s.out ?? 0} | ${fmt(s.tok_per_s, 1)} | ${gate} |`,
    )
  }
  out.push('')
}

const text = out.join('\n')
const target = process.argv[2] || path.join(root, 'LEADERBOARD.md')
fs.writeFileSync(target, text)
console.log(`[leaderboard] PASS — ${runs.length} runs → ${path.relative(root, target)}`)
