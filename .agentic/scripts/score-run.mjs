import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { spawnSync } from 'node:child_process'

const root = process.cwd()
const rubricFile = path.join(root, '.agentic', 'contracts', 'benchmark-rubric.json')
const lockFile = path.join(root, '.agentic', 'contracts', 'benchmark-rubric.lock.json')

function fatal(msg) {
  console.error(`[score-run] FATAL — ${msg}`)
  process.exit(2)
}

if (!fs.existsSync(rubricFile)) fatal('benchmark-rubric.json missing')
if (!fs.existsSync(lockFile)) fatal('benchmark-rubric.lock.json missing')

const rubricContent = fs.readFileSync(rubricFile)
const actualSha = crypto.createHash('sha256').update(rubricContent).digest('hex')
const lock = JSON.parse(fs.readFileSync(lockFile, 'utf8'))
if (actualSha !== lock.sha256) {
  fatal('rubric sha256 mismatch — tamper detected. score is invalid.')
}
const rubric = JSON.parse(rubricContent.toString())

for (const envKey of rubric.guards.abort_score_if_env_var_present) {
  if (process.env[envKey]) {
    fatal(`env var ${envKey} present. ${rubric.guards.abort_score_reason}`)
  }
}

function readJsonSafe(p, fallback) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'))
  } catch {
    return fallback
  }
}

function clamp01(x) {
  if (Number.isNaN(x) || !Number.isFinite(x)) return 0
  if (x < 0) return 0
  if (x > 1) return 1
  return x
}

function normalize(value, max, lowerIsBetter, cap) {
  if (lowerIsBetter) {
    const c = cap ?? max ?? 100
    return clamp01(1 - value / c)
  }
  const m = max ?? 1
  return clamp01(value / m)
}

const progress = readJsonSafe(path.join(root, '.agentic', 'progress.json'), {
  completedSteps: [],
  failedSteps: [],
})
const runtimeStats = readJsonSafe(path.join(root, '.agentic', 'runtime-stats.json'), {
  totalElapsedMs: 0,
  totalIn: 0,
  totalOut: 0,
  completedSteps: 0,
})

function metricCorrectness() {
  const completed = (progress.completedSteps || []).length
  const max = rubric.axes.correctness.metrics.step_pass_rate.max
  return {
    step_pass_rate: {
      raw: completed,
      max,
      normalized: normalize(completed, max, false),
    },
  }
}

function countPlaywrightTests(suiteFilter) {
  const reportPath = path.join(root, 'playwright-report', 'results.json')
  if (!fs.existsSync(reportPath)) return { passed: 0, total: 0 }
  const data = readJsonSafe(reportPath, null)
  if (!data || !Array.isArray(data.suites)) return { passed: 0, total: 0 }

  let passed = 0
  let total = 0
  function walk(suites) {
    for (const suite of suites) {
      for (const spec of suite.specs || []) {
        for (const t of spec.tests || []) {
          const titleAll = (spec.title || '') + ' ' + (suite.title || '')
          if (titleAll.includes(`@${suiteFilter}`)) {
            total++
            if (t.results?.[0]?.status === 'passed') passed++
          }
        }
      }
      if (suite.suites) walk(suite.suites)
    }
  }
  walk(data.suites)
  return { passed, total }
}

function metricRobustness() {
  const happy = countPlaywrightTests('happy')
  const edge = countPlaywrightTests('edge')
  const happyMax = rubric.axes.robustness.metrics.e2e_happy_pass.max_scenarios
  const edgeMax = rubric.axes.robustness.metrics.e2e_edge_pass.max_scenarios

  return {
    e2e_happy_pass: {
      raw: happy.passed,
      observed_total: happy.total,
      max: happyMax,
      normalized: normalize(happy.passed, happyMax, false),
    },
    e2e_edge_pass: {
      raw: edge.passed,
      observed_total: edge.total,
      max: edgeMax,
      normalized: normalize(edge.passed, edgeMax, false),
    },
  }
}

function tryRun(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: 'utf8' })
  return {
    status: r.status ?? -1,
    stdout: r.stdout || '',
    stderr: r.stderr || '',
  }
}

function metricQuality() {
  const out = {}

  const eslint = tryRun('npx', ['--no', 'eslint', '.', '--format', 'json'])
  let eslintCount = 0
  try {
    const arr = JSON.parse(eslint.stdout || '[]')
    if (Array.isArray(arr)) {
      for (const f of arr) eslintCount += (f.messages || []).length
    }
  } catch {
    eslintCount = rubric.axes.quality.metrics.eslint_violations.cap
  }
  out.eslint_violations = {
    raw: eslintCount,
    cap: rubric.axes.quality.metrics.eslint_violations.cap,
    normalized: normalize(
      eslintCount,
      null,
      true,
      rubric.axes.quality.metrics.eslint_violations.cap,
    ),
  }

  const tsc = tryRun('npx', ['--no', 'tsc', '--noEmit', '--pretty', 'false'])
  const tscCount = (tsc.stdout.match(/error TS\d+/g) || []).length
  out.tsc_errors = {
    raw: tscCount,
    cap: rubric.axes.quality.metrics.tsc_errors.cap,
    normalized: normalize(tscCount, null, true, rubric.axes.quality.metrics.tsc_errors.cap),
  }

  const dtScript = path.join(root, '.agentic', 'scripts', 'check-design-tokens.mjs')
  let dtCount = 0
  if (fs.existsSync(dtScript)) {
    const r = tryRun('node', [dtScript])
    dtCount = (r.stderr.match(/^\s*> /gm) || []).length
  }
  out.design_token_violations = {
    raw: dtCount,
    cap: rubric.axes.quality.metrics.design_token_violations.cap,
    normalized: normalize(
      dtCount,
      null,
      true,
      rubric.axes.quality.metrics.design_token_violations.cap,
    ),
  }

  const a11yPath = path.join(root, 'src', 'App.a11y.test.tsx')
  let a11yCount = 0
  if (fs.existsSync(a11yPath)) {
    const r = tryRun('npx', ['--no', 'vitest', 'run', a11yPath, '--reporter=json'])
    try {
      const json = JSON.parse(r.stdout || '{}')
      const failed = json.numFailedTests ?? 0
      a11yCount = failed
    } catch {
      a11yCount = 0
    }
  }
  out.a11y_violations = {
    raw: a11yCount,
    cap: rubric.axes.quality.metrics.a11y_violations.cap,
    normalized: normalize(a11yCount, null, true, rubric.axes.quality.metrics.a11y_violations.cap),
  }

  return out
}

function metricEfficiency() {
  const completed = (progress.completedSteps || []).length || 1
  const failed = (progress.failedSteps || []).length
  const totalAttempts = completed + failed
  const firstPassRate = clamp01(completed / Math.max(totalAttempts, 1))
  const avgRetries = clamp01((totalAttempts - completed) / completed)
  const wallSec = (runtimeStats.totalElapsedMs || 0) / 1000

  const cap = rubric.axes.efficiency.metrics
  return {
    first_pass_rate: {
      raw: firstPassRate,
      normalized: clamp01(firstPassRate),
    },
    avg_retries: {
      raw: avgRetries,
      cap: cap.avg_retries.cap,
      normalized: normalize(avgRetries, null, true, cap.avg_retries.cap),
    },
    wall_time_seconds: {
      raw: wallSec,
      cap: cap.wall_time_seconds.cap,
      normalized: normalize(wallSec, null, true, cap.wall_time_seconds.cap),
    },
  }
}

function metricDiscipline() {
  const verifyScript = path.join(root, '.agentic', 'scripts', 'verify-tests-verbatim.mjs')
  let signatureViolations = 0
  if (fs.existsSync(verifyScript)) {
    const r = tryRun('node', [verifyScript])
    signatureViolations = (r.stderr.match(/라인 누락/g) || []).length
  }

  const scopeViolations = (progress.failedSteps || []).filter((f) =>
    /scope|out\s*of\s*allowed/i.test(JSON.stringify(f)),
  ).length

  const cap = rubric.axes.discipline.metrics
  return {
    scope_violations: {
      raw: scopeViolations,
      cap: cap.scope_violations.cap,
      normalized: normalize(scopeViolations, null, true, cap.scope_violations.cap),
    },
    signature_violations: {
      raw: signatureViolations,
      cap: cap.signature_violations.cap,
      normalized: normalize(signatureViolations, null, true, cap.signature_violations.cap),
    },
  }
}

function axisScore(axisName, metricResult) {
  const axisDef = rubric.axes[axisName]
  let sum = 0
  for (const [metricName, def] of Object.entries(axisDef.metrics)) {
    const m = metricResult[metricName]
    if (!m) continue
    sum += def.weight * m.normalized
  }
  return clamp01(sum)
}

const metrics = {
  correctness: metricCorrectness(),
  robustness: metricRobustness(),
  quality: metricQuality(),
  efficiency: metricEfficiency(),
  discipline: metricDiscipline(),
}

const axisScores = {}
let weightedTotal = 0
for (const [axisName, axisDef] of Object.entries(rubric.axes)) {
  const score = axisScore(axisName, metrics[axisName])
  axisScores[axisName] = score
  weightedTotal += axisDef.weight * score
}
const finalScore = Math.round(clamp01(weightedTotal) * 1000) / 10

const tag = process.env.MODEL_TAG || runtimeStats.model || 'unknown-model'
const output = {
  tag,
  rubric_version: rubric.version,
  rubric_sha256: actualSha,
  generated_at: new Date().toISOString(),
  fingerprint: {
    progress_sha256: crypto
      .createHash('sha256')
      .update(JSON.stringify(progress))
      .digest('hex'),
    runtime_stats_sha256: crypto
      .createHash('sha256')
      .update(JSON.stringify(runtimeStats))
      .digest('hex'),
  },
  axis_scores: axisScores,
  final_score_0_to_100: finalScore,
  metrics_detail: metrics,
}

const outDir = path.join(root, '.agentic', 'benchmarks')
fs.mkdirSync(outDir, { recursive: true })
const outPath = path.join(outDir, `${tag.replace(/[^a-zA-Z0-9._-]/g, '_')}.json`)
fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + '\n')

console.log(`[score-run] PASS — tag=${tag}, final=${finalScore}/100`)
console.log(`[score-run] written: ${path.relative(root, outPath)}`)
