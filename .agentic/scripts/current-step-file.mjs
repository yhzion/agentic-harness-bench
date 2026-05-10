import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const progressPath = path.join(root, '.agentic', 'progress.json')
const progress = JSON.parse(fs.readFileSync(progressPath, 'utf8'))
const currentStep = progress.currentStep

if (!currentStep || currentStep === 'DONE') {
  console.log('DONE')
  process.exit(0)
}

const stepPath = path.join(root, '.agentic', 'steps', `${currentStep}.md`)
if (!fs.existsSync(stepPath)) {
  console.error(`Current step file not found: ${stepPath}`)
  process.exit(1)
}

console.log(stepPath)
