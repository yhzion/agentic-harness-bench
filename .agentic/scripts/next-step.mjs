import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const progressPath = path.join(root, '.agentic', 'progress.json')
const progress = JSON.parse(fs.readFileSync(progressPath, 'utf8'))

const stepName = progress.currentStep
const stepPath = path.join(root, '.agentic', 'steps', `${stepName}.md`)

console.log(`Current step: ${stepName}`)
console.log(`Step file: ${stepPath}`)

if (!fs.existsSync(stepPath)) {
  console.error(`Step file not found: ${stepPath}`)
  process.exit(1)
}

console.log(fs.readFileSync(stepPath, 'utf8'))
