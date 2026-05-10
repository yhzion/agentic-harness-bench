import fs from 'node:fs'
import path from 'node:path'

const stateFile = path.join('.agentic', 'runtime-stats.json')
const progressFile = path.join('.agentic', 'progress.json')

const fresh = {
  totalIn: 0,
  totalOut: 0,
  totalElapsedMs: 0,
  completedSteps: 0,
  model: null,
  startedAt: new Date().toISOString(),
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
  console.log(`[runtime-stats] reset → ${stateFile}`)
} else {
  console.log(`[runtime-stats] kept (in-progress run detected; use --force to reset)`)
}
