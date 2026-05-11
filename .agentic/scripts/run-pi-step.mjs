import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const STATE_FILE = path.join('.agentic', 'runtime-stats.json')
const RAW_LOG = path.join('.agentic', 'runtime-pi.log')
const STEP_LOG = path.join('.agentic', 'runtime-step-log.jsonl')
const baseState = {
  totalIn: 0,
  totalOut: 0,
  totalCacheRead: 0,
  totalElapsedMs: 0,
  completedSteps: 0,
  model: null,
}

const LEVEL = (process.env.LOG_LEVEL || 'normal').toLowerCase()
const isQuiet = LEVEL === 'quiet'
const isDebug = LEVEL === 'debug'
const HEARTBEAT_MS = Number(process.env.HEARTBEAT_MS || 5000)
const THROTTLE_MS = 200

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
let stepCacheRead = 0
let detectedModel = null
let lastEventAt = Date.now()
let turnIndex = 0
let turnStart = null
let turnToolMs = 0
let stepToolMs = 0
let stepGenMs = 0
let currentThinking = null
let currentText = null
const toolStarts = new Map()

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
  writeLine(`✗ spawn error: ${err.message}`, true)
  finishStep(1)
  process.exit(1)
})

const heartbeat = setInterval(() => {
  const silent = Date.now() - lastEventAt
  if (silent >= HEARTBEAT_MS && !isQuiet) {
    const elapsedSec = ((Date.now() - stepStart) / 1000).toFixed(1)
    writeLine(`· … still running (silent ${(silent / 1000).toFixed(0)}s · elapsed ${elapsedSec}s)`)
    lastEventAt = Date.now()
  }
}, 1500)

child.on('close', (code) => {
  clearInterval(heartbeat)
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
  lastEventAt = Date.now()

  if (!detectedModel) {
    const m = evt.model ?? evt.message?.model ?? evt.assistantMessageEvent?.partial?.model
    if (typeof m === 'string') detectedModel = m
  }

  switch (evt.type) {
    case 'session':
    case 'agent_start':
    case 'agent_end':
      return
    case 'turn_start':
      turnIndex += 1
      turnStart = Date.now()
      turnToolMs = 0
      if (!isQuiet) writeLine(`▸ turn ${turnIndex}`)
      return
    case 'turn_end': {
      const u = evt.message?.usage
      if (u) {
        stepIn += Number(u.input || 0)
        stepOut += Number(u.output || 0)
        stepCacheRead += Number(u.cacheRead || 0)
      }
      const stop = evt.message?.stopReason || '—'
      const turnElapsed = turnStart != null ? Date.now() - turnStart : 0
      const genMs = Math.max(0, turnElapsed - turnToolMs)
      stepGenMs += genMs
      stepToolMs += turnToolMs
      if (!isQuiet) {
        const tps = formatTps(u?.output, genMs)
        writeLine(
          `◂ turn ${turnIndex} · in=${u?.input ?? 0} out=${u?.output ?? 0} (${tps} tok/s · stop=${stop})`,
        )
      }
      turnStart = null
      return
    }
    case 'message_start':
      return
    case 'message_end':
      return
    case 'message_update':
      handleAssistantUpdate(evt.assistantMessageEvent)
      return
    case 'tool_execution_start':
      toolStarts.set(evt.toolCallId, Date.now())
      return
    case 'tool_execution_end': {
      const startedAt = toolStarts.get(evt.toolCallId) ?? Date.now()
      const toolMs = Date.now() - startedAt
      turnToolMs += toolMs
      const dt = (toolMs / 1000).toFixed(1)
      const isError = evt.isError === true || evt.result?.isError === true
      const content = evt.result?.content?.[0]?.text ?? ''
      const lines = content ? content.split('\n').length : 0
      const sizeHint = lines ? ` ${lines}L` : ''
      const errHint = isError ? ` ✗ ${truncate(content.split('\n')[0] || 'error', 60)}` : ''
      if (!isQuiet) {
        writeLine(`  ↳ ${isError ? '✗ error' : '✓ ok'} ${dt}s${sizeHint}${errHint}`)
      }
      toolStarts.delete(evt.toolCallId)
      return
    }
    default:
      return
  }
}

function handleAssistantUpdate(inner) {
  if (!inner) return
  switch (inner.type) {
    case 'thinking_start':
      currentThinking = { start: Date.now() }
      if (!isQuiet) writeLine('· thinking …')
      return
    case 'thinking_delta':
      if (isDebug && inner.delta) {
        const preview = String(inner.delta).replace(/\s+/g, ' ').slice(0, 80)
        writeLine(`    · ${preview}`)
      }
      return
    case 'thinking_end': {
      const dt = currentThinking ? ((Date.now() - currentThinking.start) / 1000).toFixed(1) : '—'
      const head = (inner.content || '').split('\n').find((l) => l.trim()) || ''
      const preview = head ? `: ${truncate(head.trim(), 80)}` : ''
      if (!isQuiet) writeLine(`  ↳ thought (${dt}s)${preview}`)
      currentThinking = null
      return
    }
    case 'text_start':
      currentText = { start: Date.now() }
      return
    case 'text_delta':
      return
    case 'text_end': {
      const txt = (inner.content || '').replace(/\s+/g, ' ').trim()
      if (txt && !isQuiet) writeLine(`· say: ${truncate(txt, 100)}`)
      currentText = null
      return
    }
    case 'toolcall_start':
    case 'toolcall_delta':
      return
    case 'toolcall_end': {
      const tc = inner.toolCall
      if (!tc) return
      const argsBrief = briefArgs(tc.name, tc.arguments)
      if (!isQuiet) writeLine(`· call ${tc.name}${argsBrief ? ' ' + argsBrief : ''}`)
      return
    }
    default:
      return
  }
}

function briefArgs(name, a) {
  if (!a || typeof a !== 'object') return ''
  const pick = (...keys) => {
    for (const k of keys) if (typeof a[k] === 'string') return a[k]
    return null
  }
  switch (name) {
    case 'read':
    case 'ls':
    case 'glob':
    case 'edit':
    case 'write': {
      const p = pick('path', 'file', 'filename', 'pattern')
      return p ? short(p) : ''
    }
    case 'bash':
    case 'shell': {
      const cmd = pick('command', 'cmd', 'script')
      return cmd ? `"${truncate(cmd, 70)}"` : ''
    }
    case 'grep':
    case 'find': {
      const q = pick('pattern', 'query', 'regex')
      const p = pick('path', 'cwd')
      return [q && `/${truncate(q, 40)}/`, p && `in ${short(p)}`].filter(Boolean).join(' ')
    }
    default: {
      const k = Object.keys(a)[0]
      if (!k) return ''
      const v = a[k]
      return typeof v === 'string' ? `${k}=${truncate(v, 60)}` : `${k}=…`
    }
  }
}

function short(p) {
  const cwd = process.cwd() + '/'
  return p.startsWith(cwd) ? p.slice(cwd.length) : truncate(p, 60)
}

function formatTps(out, elapsedMs) {
  if (!out || elapsedMs <= 0) return '—'
  return ((out / (elapsedMs / 1000)) || 0).toFixed(0)
}

function writeLine(s) {
  process.stderr.write(s + '\n')
}

function finishStep(exitCode) {
  const elapsed = Date.now() - stepStart
  state.totalIn += stepIn
  state.totalOut += stepOut
  state.totalCacheRead += stepCacheRead
  state.totalElapsedMs += elapsed
  if (detectedModel) state.model = detectedModel
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2))

  const genTps = stepGenMs > 0 ? (stepOut / (stepGenMs / 1000)).toFixed(1) : '—'
  const wallTps = elapsed > 0 ? (stepOut / (elapsed / 1000)).toFixed(1) : '—'
  const status = exitCode === 0 ? '✓ pi-ok' : `✗ pi-exit-${exitCode}`

  const summary =
    `╌╌ attempt ${args.attempt}/${args.maxRetry} done · ` +
    `${(elapsed / 1000).toFixed(1)}s (gen ${(stepGenMs / 1000).toFixed(1)}s · tool ${(stepToolMs / 1000).toFixed(1)}s) · ` +
    `in=${stepIn} out=${stepOut} cacheR=${stepCacheRead} · ` +
    `${genTps} tok/s gen (${wallTps} wall) · ${status}`
  process.stderr.write(summary + '\n')

  const entry = {
    ts: new Date().toISOString(),
    step_num: Number(args.stepNum),
    step_name: args.stepName,
    attempt: Number(args.attempt),
    elapsed_ms: elapsed,
    in: stepIn,
    out: stepOut,
    cache_read: stepCacheRead,
    tok_per_s: elapsed > 0 ? Number((stepOut / (elapsed / 1000)).toFixed(2)) : 0,
    tok_per_s_gen: stepGenMs > 0 ? Number((stepOut / (stepGenMs / 1000)).toFixed(2)) : 0,
    gen_ms: stepGenMs,
    tool_ms: stepToolMs,
    model: detectedModel || process.env.PI_MODEL || state.model || 'unknown',
    pi_exit: exitCode,
    gate_pass: null,
  }
  fs.appendFileSync(STEP_LOG, JSON.stringify(entry) + '\n')
}

function readState() {
  try {
    return { ...baseState, ...JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) }
  } catch {
    return { ...baseState }
  }
}

function truncate(str, n) {
  if (!str) return ''
  return str.length <= n ? str : str.slice(0, n - 1) + '…'
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
