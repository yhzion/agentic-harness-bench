import fs from 'node:fs'
import path from 'node:path'

export function readProgress(root = process.cwd()) {
  return JSON.parse(fs.readFileSync(path.join(root, '.agentic', 'progress.json'), 'utf8'))
}

export function currentStepName(root = process.cwd()) {
  return readProgress(root).currentStep
}

export function currentStepNumber(root = process.cwd()) {
  const step = currentStepName(root)
  if (!step || step === 'DONE') return 999
  const match = /^(\d{3})-/.exec(step)
  return match ? Number(match[1]) : 999
}

export function currentStepPath(root = process.cwd()) {
  const step = currentStepName(root)
  if (!step || step === 'DONE') return null
  return path.join(root, '.agentic', 'steps', `${step}.md`)
}

export function editableFilesForCurrentStep(root = process.cwd()) {
  const stepPath = currentStepPath(root)
  if (!stepPath || !fs.existsSync(stepPath)) return []
  return editableFilesFromStepContent(fs.readFileSync(stepPath, 'utf8'))
}

export function editableFilesFromStepContent(content) {
  const heading = content.match(/^##\s+수정 가능 파일[^\n]*$/m)
  if (!heading || heading.index === undefined) return []
  const afterHeading = content.slice(heading.index + heading[0].length)
  const nextHeadingIndex = afterHeading.search(/^##\s/m)
  const section = nextHeadingIndex === -1 ? afterHeading : afterHeading.slice(0, nextHeadingIndex)

  const files = []
  for (const rawLine of section.split('\n')) {
    const line = rawLine.trim()
    if (!line.startsWith('- ')) continue
    const parsed = normalizeEditablePath(line.slice(2))
    if (parsed) files.push(parsed)
  }
  return [...new Set(files)]
}

export function normalizeEditablePath(value) {
  return value
    .replace(/`/g, '')
    .replace(/\s+\(.+$/, '')
    .replace(/\s+—.+$/, '')
    .replace(/\s+#.+$/, '')
    .trim()
}

export function isPathAllowed(file, allowedFiles) {
  const normalized = normalizePath(file)
  const expanded = expandImplicitAllowedFiles(allowedFiles)
  return expanded.some((allowed) => {
    const a = normalizePath(allowed)
    if (a.endsWith('/**')) return normalized.startsWith(a.slice(0, -2))
    if (a.endsWith('/*')) {
      const prefix = a.slice(0, -1)
      return normalized.startsWith(prefix) && !normalized.slice(prefix.length).includes('/')
    }
    return normalized === a
  })
}

export function expandImplicitAllowedFiles(allowedFiles) {
  const out = new Set(allowedFiles)
  if (out.has('package.json')) out.add('package-lock.json')
  return [...out]
}

export function normalizePath(file) {
  return file.replace(/\\/g, '/').replace(/^\.\//, '')
}
