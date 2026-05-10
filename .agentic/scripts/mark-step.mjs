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
  progress.retryCount = Number(progress.retryCount || 0) + 1
  progress.lastResult = 'FAIL'
  progress.failedSteps.push({ step: currentStep, message, at: new Date().toISOString() })
}

fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2) + '\n')

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
