import fs from 'node:fs'
import path from 'node:path'

const progressPath = path.join(process.cwd(), '.agentic', 'progress.json')
const progress = JSON.parse(fs.readFileSync(progressPath, 'utf8'))

console.log(JSON.stringify({
  currentStep: progress.currentStep,
  lastResult: progress.lastResult,
  retryCount: progress.retryCount,
  completedCount: Array.isArray(progress.completedSteps) ? progress.completedSteps.length : 0,
  failedCount: Array.isArray(progress.failedSteps) ? progress.failedSteps.length : 0
}, null, 2))
