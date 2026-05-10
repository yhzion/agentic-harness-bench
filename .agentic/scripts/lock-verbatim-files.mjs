import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const stepsDir = path.join(root, '.agentic', 'steps')
const lockFile = path.join(root, '.agentic', 'contracts', 'verbatim-files.lock.json')

const VERBATIM_RE =
  /verbatim\s*(?:복사|append)[^\n]*?→\s*([^\s)]+\.(?:ts|tsx|js|jsx|json|css|md|html))/g
const CODE_BLOCK_RE = /```[a-zA-Z0-9]*\n([\s\S]*?)```/

if (!fs.existsSync(stepsDir)) {
  console.error('[verbatim-lock] no steps dir at .agentic/steps')
  process.exit(1)
}

const stepFiles = fs
  .readdirSync(stepsDir)
  .filter((f) => /^\d{3}-.*\.md$/.test(f))
  .sort()

const segmentsByTarget = new Map()

for (const stepFile of stepFiles) {
  const stepPath = path.join(stepsDir, stepFile)
  const content = fs.readFileSync(stepPath, 'utf8')

  for (const match of content.matchAll(VERBATIM_RE)) {
    const targetPath = match[1].trim()
    const afterMatch = content.slice(match.index + match[0].length)
    const blockMatch = afterMatch.match(CODE_BLOCK_RE)
    if (!blockMatch) {
      console.error(`[verbatim-lock] WARN ${stepFile}: marker for ${targetPath} has no code block`)
      continue
    }

    const canonical = canonicalize(blockMatch[1])
    const segment = {
      step: stepFile,
      sha256: crypto.createHash('sha256').update(canonical).digest('hex'),
      bytes: Buffer.byteLength(canonical, 'utf8'),
    }

    if (!segmentsByTarget.has(targetPath)) segmentsByTarget.set(targetPath, [])
    segmentsByTarget.get(targetPath).push({ ...segment, _canonical: canonical })
  }
}

const entries = []
for (const [target, segments] of segmentsByTarget) {
  const composite = canonicalize(segments.map((s) => s._canonical).join('\n\n'))
  const composite_sha256 = crypto.createHash('sha256').update(composite).digest('hex')
  entries.push({
    target,
    segments: segments.map(({ _canonical, ...rest }) => rest),
    composite_sha256,
    composite_bytes: Buffer.byteLength(composite, 'utf8'),
  })
}

entries.sort((a, b) => a.target.localeCompare(b.target))

const out = {
  generated_at: new Date().toISOString(),
  generator: '.agentic/scripts/lock-verbatim-files.mjs',
  canonicalization:
    'trim trailing whitespace per line; strip leading/trailing blank lines; LF endings; segments joined with single blank line',
  semantics:
    'Final file canonical content MUST equal canonicalize(segments joined with "\\n\\n"). No extra code, comments, or imports allowed.',
  count: entries.length,
  entries,
}

fs.mkdirSync(path.dirname(lockFile), { recursive: true })
fs.writeFileSync(lockFile, JSON.stringify(out, null, 2) + '\n')
console.log(
  `[verbatim-lock] PASS — ${entries.length} verbatim file(s) locked (${
    [...segmentsByTarget.values()].reduce((n, s) => n + s.length, 0)
  } segment(s)) → ${path.relative(root, lockFile)}`,
)

export function canonicalize(text) {
  return text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/, ''))
    .join('\n')
    .replace(/^\n+/, '')
    .replace(/\n+$/, '')
}
