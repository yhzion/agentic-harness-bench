import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const progressPath = path.join(root, '.agentic', 'progress.json')

if (fs.existsSync(progressPath)) {
  process.exit(0)
}

const stepsDir = path.join(root, '.agentic', 'steps')
const stepFiles = fs
  .readdirSync(stepsDir)
  .filter((f) => f.endsWith('.md'))
  .sort()

if (stepFiles.length === 0) {
  console.error('[progress] no step files found in .agentic/steps')
  process.exit(1)
}

const firstStep = stepFiles[0].replace(/\.md$/, '')

const fresh = {
  currentStep: firstStep,
  completedSteps: [],
  failedSteps: [],
  retryCount: 0,
  lastResult: 'READY',
  nextStep: firstStep,
}

fs.writeFileSync(progressPath, JSON.stringify(fresh, null, 2) + '\n')
console.log(`[progress] initialized → ${progressPath} (start: ${firstStep})`)
