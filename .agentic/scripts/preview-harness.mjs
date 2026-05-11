import { spawn } from 'node:child_process'
import net from 'node:net'

const DEFAULT_HOST = '127.0.0.1'

export async function freePort(port, { host = DEFAULT_HOST, waitMs = 3000 } = {}) {
  if (!(await isPortOpen(host, port))) return { killed: [] }

  const pids = await listListeners(port)
  if (pids.length === 0) {
    throw new Error(
      `port ${port} appears in use but no listener PID found (lsof unavailable?)`,
    )
  }

  for (const pid of pids) safeKill(pid, 'SIGTERM')

  const deadline = Date.now() + waitMs
  while (Date.now() < deadline) {
    if (!(await isPortOpen(host, port))) return { killed: pids }
    await sleep(100)
  }

  for (const pid of pids) safeKill(pid, 'SIGKILL')
  await waitUntilFree(host, port, 2000)
  if (await isPortOpen(host, port)) {
    throw new Error(`failed to free port ${port}; PIDs ${pids.join(',')} still listening`)
  }
  return { killed: pids }
}

export async function startPreview({
  port,
  host = DEFAULT_HOST,
  bootTimeoutMs = 30000,
  onStdout,
  onStderr,
} = {}) {
  if (!port) throw new Error('startPreview: port is required')

  await freePort(port, { host })

  const isWin = process.platform === 'win32'
  const child = spawn(
    'npx',
    ['vite', 'preview', '--port', String(port), '--strictPort'],
    {
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: !isWin,
      shell: isWin,
    },
  )

  if (onStdout) child.stdout.on('data', onStdout)
  if (onStderr) child.stderr.on('data', onStderr)

  const exited = new Promise((resolve) => child.once('exit', resolve))
  let earlyExit = null
  child.once('exit', (code, signal) => {
    earlyExit = { code, signal }
  })

  try {
    await waitForPort(host, port, bootTimeoutMs, () => earlyExit)
  } catch (err) {
    await stopProcess(child)
    throw err
  }

  let stopped = false
  return {
    pid: child.pid,
    async stop() {
      if (stopped) return
      stopped = true
      await stopProcess(child)
      await Promise.race([exited, sleep(1000)])
    },
  }
}

async function stopProcess(child) {
  if (!child.pid || child.exitCode !== null) return

  if (process.platform === 'win32') {
    safeKill(child.pid, 'SIGTERM')
    await sleep(300)
    if (!isPidAlive(child.pid)) return
    safeKill(child.pid, 'SIGKILL')
    return
  }

  safeKillGroup(child.pid, 'SIGTERM')
  for (let i = 0; i < 15; i++) {
    await sleep(100)
    if (!isPidAlive(child.pid)) return
  }
  safeKillGroup(child.pid, 'SIGKILL')
}

function safeKill(pid, signal) {
  try {
    process.kill(pid, signal)
  } catch (err) {
    if (err.code !== 'ESRCH') throw err
  }
}

function safeKillGroup(pid, signal) {
  try {
    process.kill(-pid, signal)
  } catch (err) {
    if (err.code !== 'ESRCH' && err.code !== 'EPERM') throw err
  }
}

function isPidAlive(pid) {
  try {
    process.kill(pid, 0)
    return true
  } catch (err) {
    return err.code !== 'ESRCH'
  }
}

function listListeners(port) {
  return new Promise((resolve) => {
    const child = spawn('lsof', ['-i', `:${port}`, '-sTCP:LISTEN', '-t', '-n', '-P'], {
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    let out = ''
    child.stdout.on('data', (d) => (out += d))
    child.once('exit', () => {
      const pids = out
        .split(/\s+/)
        .map((s) => Number(s.trim()))
        .filter((n) => Number.isInteger(n) && n > 0)
      resolve([...new Set(pids)])
    })
    child.once('error', () => resolve([]))
  })
}

function isPortOpen(host, port) {
  return new Promise((resolve) => {
    const sock = net.createConnection({ host, port })
    sock.once('connect', () => {
      sock.end()
      resolve(true)
    })
    sock.once('error', () => resolve(false))
  })
}

async function waitForPort(host, port, timeoutMs, earlyExitGetter) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const exited = earlyExitGetter?.()
    if (exited) {
      throw new Error(
        `preview exited before listening on ${host}:${port} (code=${exited.code} signal=${exited.signal})`,
      )
    }
    if (await isPortOpen(host, port)) return
    await sleep(250)
  }
  throw new Error(`preview did not start on ${host}:${port} within ${timeoutMs}ms`)
}

async function waitUntilFree(host, port, timeoutMs) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (!(await isPortOpen(host, port))) return
    await sleep(100)
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

// ─── CLI entry ───────────────────────────────────────────────────────────────
// Invoked by `npm run preview` (which is itself invoked by playwright's
// webServer.command and by check-real-smoke). Parses --port=XXXX (or --port XXXX)
// from argv, ignores --strictPort (always on), and stays alive until SIGTERM/SIGINT.
const invokedAsScript = import.meta.url === `file://${process.argv[1]}`
if (invokedAsScript) {
  await runCli(process.argv.slice(2))
}

async function runCli(argv) {
  const port = parsePortArg(argv)
  if (!port) {
    console.error('[preview-harness] usage: node preview-harness.mjs --port=<n> [--strictPort]')
    process.exit(2)
  }

  let handle
  let shuttingDown = false
  const shutdown = async (signal) => {
    if (shuttingDown) return
    shuttingDown = true
    console.log(`[preview-harness] received ${signal}, stopping preview...`)
    try {
      if (handle) await handle.stop()
    } catch (err) {
      console.error('[preview-harness] stop error:', err.message || err)
    }
    process.exit(signal === 'SIGINT' ? 130 : 0)
  }
  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGHUP', () => shutdown('SIGHUP'))

  // Parent watchdog: npm/sh wrappers don't reliably forward SIGTERM to us.
  // If our parent dies (we become orphaned, PPID=1), self-terminate so the
  // vite child group is cleaned up and the port released.
  if (process.platform !== 'win32') {
    const initialPpid = process.ppid
    setInterval(() => {
      const ppid = process.ppid
      if (ppid !== initialPpid && ppid <= 1) {
        console.log(
          `[preview-harness] parent (pid ${initialPpid}) died, self-terminating`,
        )
        shutdown('PARENT-DIED')
      }
    }, 500).unref()
  }

  try {
    handle = await startPreview({
      port,
      onStdout: (d) => process.stdout.write(d),
      onStderr: (d) => process.stderr.write(d),
    })
    console.log(`[preview-harness] preview ready on 127.0.0.1:${port} (pid ${handle.pid})`)
  } catch (err) {
    console.error('[preview-harness] FAIL —', err.message || err)
    process.exit(1)
  }
  // keep process alive; signal handlers handle exit
}

function parsePortArg(argv) {
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith('--port=')) return Number(a.slice('--port='.length))
    if (a === '--port' && i + 1 < argv.length) return Number(argv[i + 1])
  }
  return null
}
