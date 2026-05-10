import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const STATE_FILE = path.join('.agentic', 'runtime-stats.json')
const RAW_LOG = path.join('.agentic', 'runtime-pi.log')
const baseState = { totalIn: 0, totalOut: 0, totalElapsedMs: 0, completedSteps: 0, model: null }

const args = parseArgs(process.argv.slice(2))
const required = ['stepNum', 'total', 'stepName', 'attempt', 'maxRetry', 'promptFile', 'piBin', 'piMode']
for (const key of required) {
  if (!args[key]) {
    console.error(`run-pi-step: missing --${kebab(key)} argument`)
    process.exit(2)
  }
}

const state = readState()
const stepStart = Date.now()
let stepIn = 0
let stepOut = 0
let detectedModel = null

const prompt = fs.readFileSync(args.promptFile, 'utf8')
fs.writeFileSync(RAW_LOG, '')

const child = spawn(args.piBin, ['--mode', args.piMode, prompt], {
  stdio: ['ignore', 'pipe', 'pipe'],
})

let stdoutBuf = ''
child.stdout.on('data', (chunk) => {
  stdoutBuf += chunk.toString()
  fs.appendFileSync(RAW_LOG, chunk)
  const lines = stdoutBuf.split('\n')
  stdoutBuf = lines.pop() ?? ''
  for (const line of lines) handleLine(line)
})

child.stderr.on('data', (chunk) => {
  fs.appendFileSync(RAW_LOG, chunk)
})

child.on('error', (err) => {
  process.stderr.write(`\n[run-pi-step] spawn error: ${err.message}\n`)
  finishStep(1)
  process.exit(1)
})

child.on('close', (code) => {
  if (stdoutBuf) handleLine(stdoutBuf)
  finishStep(code ?? 1)
  process.exit(code ?? 1)
})

function handleLine(line) {
  if (!line.trim()) return
  let evt
  try {
    evt = JSON.parse(line)
  } catch {
    return
  }
  if (!detectedModel) {
    const m = evt.model ?? evt.system?.model ?? evt.message?.model ?? evt.metadata?.model
    if (typeof m === 'string') detectedModel = m
  }
  const usage = evt.usage ?? evt.message?.usage ?? evt.delta?.usage ?? evt.metadata?.usage
  if (usage) {
    if (typeof usage.input_tokens === 'number') stepIn = usage.input_tokens
    if (typeof usage.output_tokens === 'number') stepOut = usage.output_tokens
    if (typeof usage.cache_read_input_tokens === 'number')
      stepIn = Math.max(stepIn, usage.input_tokens ?? 0) + (usage.cache_read_input_tokens || 0)
  }
  render()
}

const isTTY = Boolean(process.stderr.isTTY)
let lastRenderAt = 0

function render(force = false) {
  const now = Date.now()
  if (!force && now - lastRenderAt < 250) return
  lastRenderAt = now

  const pct = (((Number(args.stepNum) - 1) / Number(args.total)) * 100).toFixed(1)
  const totalIn = state.totalIn + stepIn
  const totalOut = state.totalOut + stepOut
  const avgTps =
    state.totalElapsedMs > 0
      ? (state.totalOut / (state.totalElapsedMs / 1000)).toFixed(1)
      : '—'
  const model = detectedModel || process.env.PI_MODEL || state.model || 'unknown'

  const line =
    `[${pad(args.stepNum, 2)}/${args.total}] ${pct.padStart(4)}% │ ` +
    `${truncate(args.stepName, 32)} │ ${truncate(model, 22)} │ ` +
    `in ${fmt(totalIn).padStart(7)} │ out ${fmt(totalOut).padStart(7)} │ ` +
    `${avgTps.padStart(6)} tok/s avg │ try ${args.attempt}/${args.maxRetry}`

  if (isTTY) {
    process.stderr.write('\r\x1b[2K' + line)
  } else {
    process.stderr.write(line + '\n')
  }
}

function finishStep(exitCode) {
  const elapsed = Date.now() - stepStart
  state.totalIn += stepIn
  state.totalOut += stepOut
  state.totalElapsedMs += elapsed
  if (detectedModel) state.model = detectedModel
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2))

  render(true)
  if (isTTY) process.stderr.write('\n')

  const stepTps = elapsed > 0 ? (stepOut / (elapsed / 1000)).toFixed(1) : '—'
  const status = exitCode === 0 ? '✓ pi-ok' : `✗ pi-exit-${exitCode}`
  process.stderr.write(
    `  └─ step ${(elapsed / 1000).toFixed(1)}s │ in ${stepIn} │ out ${stepOut} │ ${stepTps} tok/s │ ${status}\n`,
  )
}

function readState() {
  try {
    return { ...baseState, ...JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) }
  } catch {
    return { ...baseState }
  }
}

function fmt(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k'
  return String(n)
}

function truncate(str, n) {
  if (!str) return ''
  return str.length <= n ? str.padEnd(n) : str.slice(0, n - 1) + '…'
}

function pad(v, n) {
  return String(v).padStart(n)
}

function kebab(s) {
  return s.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())
}

function parseArgs(argv) {
  const out = {}
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase())
      out[key] = argv[i + 1]
      i++
    }
  }
  return out
}
