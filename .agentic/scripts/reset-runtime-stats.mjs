import fs from 'node:fs'
import path from 'node:path'

const stateFile = path.join('.agentic', 'runtime-stats.json')
const progressFile = path.join('.agentic', 'progress.json')
const scopeBaselineFile = path.join('.agentic', 'scope-baseline.json')
const scopeViolationsFile = path.join('.agentic', 'scope-violations.jsonl')
const stepLogFile = path.join('.agentic', 'runtime-step-log.jsonl')

const fresh = {
  totalIn: 0,
  totalOut: 0,
  totalElapsedMs: 0,
  completedSteps: 0,
  model: null,
  startedAt: new Date().toISOString(),
  stepHistory: [],
  firstPassCount: 0,
  totalCompletedSteps: 0,
  totalAttempts: 0,
}

const force = process.argv.includes('--force')
const progressEmpty = (() => {
  try {
    const p = JSON.parse(fs.readFileSync(progressFile, 'utf8'))
    return Array.isArray(p.completedSteps) && p.completedSteps.length === 0
  } catch {
    return true
  }
})()

if (force || progressEmpty || !fs.existsSync(stateFile)) {
  fs.writeFileSync(stateFile, JSON.stringify(fresh, null, 2))
  for (const file of [scopeBaselineFile, scopeViolationsFile, stepLogFile]) {
    if (fs.existsSync(file)) fs.rmSync(file)
  }
  console.log(`[runtime-stats] reset → ${stateFile}`)
} else {
  console.log(`[runtime-stats] kept (in-progress run detected; use --force to reset)`)
}
