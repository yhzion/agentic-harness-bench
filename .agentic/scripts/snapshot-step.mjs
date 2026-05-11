import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { editableFilesFromStepContent, normalizePath } from './step-metadata.mjs'

const root = process.cwd()
const stateDir = path.join(root, '.agentic', 'state')
const stepsDir = path.join(root, '.agentic', 'steps')

function hasGlob(file) {
  return /[*?[\]]/.test(file)
}

function fileSha256(absPath) {
  const buf = fs.readFileSync(absPath)
  return 'sha256:' + crypto.createHash('sha256').update(buf).digest('hex')
}

export function snapshotStep(stepName) {
  const stepPath = path.join(stepsDir, `${stepName}.md`)
  if (!fs.existsSync(stepPath)) {
    throw new Error(`step file not found: ${stepPath}`)
  }
  const editable = editableFilesFromStepContent(fs.readFileSync(stepPath, 'utf8'))
    .map(normalizePath)
    .filter((f) => !hasGlob(f))

  const files = {}
  const missing = []
  for (const rel of editable) {
    const abs = path.join(root, rel)
    if (!fs.existsSync(abs)) {
      missing.push(rel)
      continue
    }
    files[rel] = fileSha256(abs)
  }
  if (missing.length > 0) {
    const list = missing.map((m) => `  > ${m}`).join('\n')
    throw new Error(`missing editable files for ${stepName}:\n${list}`)
  }

  fs.mkdirSync(stateDir, { recursive: true })
  const lockPath = path.join(stateDir, `${stepName}.lock.json`)
  const payload = {
    step: stepName,
    completedAt: new Date().toISOString(),
    files,
  }
  fs.writeFileSync(lockPath, JSON.stringify(payload, null, 2) + '\n')
  return { lockPath, fileCount: Object.keys(files).length }
}
