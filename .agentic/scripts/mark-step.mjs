import fs from 'node:fs'
import path from 'node:path'

const result = process.argv[2]
const message = process.argv.slice(3).join(' ')

if (!['pass', 'fail'].includes(result)) {
  console.error('Usage: node .agentic/scripts/mark-step.mjs <pass|fail> [message]')
  process.exit(1)
}

const root = process.cwd()
const agenticDir = path.join(root, '.agentic')
const progressPath = path.join(agenticDir, 'progress.json')
const runtimeStatsPath = path.join(agenticDir, 'runtime-stats.json')
const stepLogPath = path.join(agenticDir, 'runtime-step-log.jsonl')
const stepsDir = path.join(agenticDir, 'steps')

const progress = JSON.parse(fs.readFileSync(progressPath, 'utf8'))
const currentStep = progress.currentStep
const stepFiles = fs.readdirSync(stepsDir).filter((file) => file.endsWith('.md')).sort()
const currentFile = `${currentStep}.md`
const currentIndex = stepFiles.indexOf(currentFile)

if (currentIndex === -1) {
  console.error(`Current step file not found: ${currentFile}`)
  process.exit(1)
}

const previousRetryCount = Number(progress.retryCount || 0)

if (result === 'pass') {
  if (!progress.completedSteps.includes(currentStep)) {
    progress.completedSteps.push(currentStep)
  }
  progress.retryCount = 0
  progress.lastResult = 'PASS'
  const nextFile = stepFiles[currentIndex + 1]
  progress.currentStep = nextFile ? nextFile.replace(/\.md$/, '') : 'DONE'
  progress.nextStep = progress.currentStep
} else {
  progress.retryCount = previousRetryCount + 1
  progress.lastResult = 'FAIL'
  progress.failedSteps.push({ step: currentStep, message, at: new Date().toISOString() })
}

fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2) + '\n')

function readRuntimeStats() {
  try {
    return JSON.parse(fs.readFileSync(runtimeStatsPath, 'utf8'))
  } catch {
    return {}
  }
}

const stats = readRuntimeStats()
if (!Array.isArray(stats.stepHistory)) stats.stepHistory = []
if (typeof stats.firstPassCount !== 'number') stats.firstPassCount = 0
if (typeof stats.totalCompletedSteps !== 'number') stats.totalCompletedSteps = 0
if (typeof stats.totalAttempts !== 'number') stats.totalAttempts = 0

if (result === 'pass') {
  const attempts = previousRetryCount + 1
  stats.stepHistory.push({
    step: currentStep,
    attempts,
    result: 'pass',
    completedAt: new Date().toISOString(),
  })
  stats.totalCompletedSteps += 1
  stats.totalAttempts += 1
  if (attempts === 1) stats.firstPassCount += 1
} else {
  stats.totalAttempts += 1
}

fs.writeFileSync(runtimeStatsPath, JSON.stringify(stats, null, 2) + '\n')

function updateLastStepLogGate(gatePass) {
  try {
    if (!fs.existsSync(stepLogPath)) return
    const raw = fs.readFileSync(stepLogPath, 'utf8')
    const lines = raw.split('\n').filter((l) => l.trim() !== '')
    if (lines.length === 0) return
    let obj
    try {
      obj = JSON.parse(lines[lines.length - 1])
    } catch {
      return
    }
    obj.gate_pass = gatePass
    lines[lines.length - 1] = JSON.stringify(obj)
    fs.writeFileSync(stepLogPath, lines.join('\n') + '\n')
  } catch {
    // best-effort
  }
}

updateLastStepLogGate(result === 'pass')

const progressMd = [
  '# Progress',
  '',
  '## 현재 상태',
  '',
  '```txt',
  `currentStep: ${progress.currentStep}`,
  `lastResult: ${progress.lastResult}`,
  `retryCount: ${progress.retryCount}`,
  '```',
  '',
  '## 완료된 STEP',
  '',
  ...progress.completedSteps.map((step) => `- ${step}`),
  '',
  '## 실패한 STEP',
  '',
  ...(progress.failedSteps.length
    ? progress.failedSteps.map((item) => `- ${item.step}: ${item.message || 'no message'}`)
    : ['없음']),
  '',
].join('\n')

fs.writeFileSync(path.join(agenticDir, 'progress.md'), progressMd)
console.log(`Marked ${currentStep} as ${result}. Current step: ${progress.currentStep}`)
