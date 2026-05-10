import fs from 'node:fs'
import path from 'node:path'

const stepFile = process.argv[2] || 'unknown'
const reason = process.argv.slice(3).join(' ') || 'No reason provided.'
const root = process.cwd()
const reportDir = path.join(root, '.agentic', 'reports')
fs.mkdirSync(reportDir, { recursive: true })

const content = [
  '# Failure Report',
  '',
  `- time: ${new Date().toISOString()}`,
  `- stepFile: ${stepFile}`,
  `- reason: ${reason}`,
  '',
  '## Suggested next action',
  '',
  'Review the STEP specification, current git diff, and verification output. Then either fix the STEP manually or adjust the STEP scope before rerunning the shell runner.',
  ''
].join('\n')

fs.writeFileSync(path.join(reportDir, 'failure-report.md'), content)
console.log(path.join(reportDir, 'failure-report.md'))
