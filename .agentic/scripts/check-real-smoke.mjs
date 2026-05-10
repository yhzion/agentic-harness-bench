import { spawn } from 'node:child_process'
import net from 'node:net'
import { emit as emitRecoveryHint } from './emit-recovery-hint.mjs'

const PORT = Number(process.env.SMOKE_PORT || 4174)
const HOST = '127.0.0.1'
const BOOT_TIMEOUT_MS = 30000
const PAGE_TIMEOUT_MS = 8000

let preview
let browser
let exitCode = 1

process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)

try {
  if (await isPortOpen(HOST, PORT)) {
    console.error(
      `[real-smoke] FAIL — port ${PORT} is already in use before preview boot.`,
    )
    console.error(
      `이전 gate 실행의 vite preview가 orphan으로 남아있을 가능성이 큽니다 (PPID=1, --strictPort라 새 preview가 못 뜸).`,
    )
    console.error(
      `해결: \`lsof -i :${PORT} -sTCP:LISTEN -n -P\` 로 점유자 확인 후 kill, 또는 SMOKE_PORT 환경변수로 다른 포트 지정.`,
    )
    throw new Error(`port ${PORT} occupied`)
  }

  console.log(`[real-smoke] booting vite preview on ${HOST}:${PORT}...`)
  preview = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: process.platform === 'win32',
  })

  preview.stdout.on('data', (d) => process.stdout.write(`  [preview] ${d}`))
  preview.stderr.on('data', (d) => process.stderr.write(`  [preview] ${d}`))

  await waitForPort(HOST, PORT, BOOT_TIMEOUT_MS)
  console.log(`[real-smoke] preview ready`)

  let chromium
  try {
    ;({ chromium } = await import('@playwright/test'))
  } catch {
    try {
      ;({ chromium } = await import('playwright-core'))
    } catch {
      console.error('[real-smoke] FAIL — neither @playwright/test nor playwright-core installed')
      throw new Error('no chromium driver')
    }
  }

  browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  const consoleErrors = []
  page.on('pageerror', (err) => consoleErrors.push({ type: 'pageerror', message: String(err) }))
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push({ type: 'console-error', message: msg.text() })
  })

  await page.goto(`http://${HOST}:${PORT}/`, { waitUntil: 'load', timeout: PAGE_TIMEOUT_MS })

  await assertVisible(page, 'input, textarea', 'input element')
  await assertVisible(page, 'button', 'button element')

  const initialCount = await page.locator('[role="listitem"], li').count()
  if (initialCount !== 0) {
    throw fail(`expected 0 list items at boot, got ${initialCount}`, consoleErrors)
  }

  const input = page.locator('input').first()
  await input.fill('smoke-test-item', { timeout: PAGE_TIMEOUT_MS })

  const button = page.locator('button', { hasText: /add|추가/i }).first()
  await button.click({ timeout: PAGE_TIMEOUT_MS })

  await page.waitForTimeout(300)
  const afterClickCount = await page.locator('[role="listitem"], li').count()
  if (afterClickCount !== 1) {
    throw fail(
      `add 버튼 클릭 후 list item count expected 1, got ${afterClickCount}`,
      consoleErrors,
    )
  }

  await input.fill('enter-item', { timeout: PAGE_TIMEOUT_MS })
  await input.press('Enter')
  await page.waitForTimeout(300)
  const afterEnterCount = await page.locator('[role="listitem"], li').count()
  if (afterEnterCount !== 2) {
    throw fail(
      `Enter 키 입력 후 list item count expected 2, got ${afterEnterCount}`,
      consoleErrors,
    )
  }

  if (consoleErrors.length > 0) {
    throw fail('브라우저 콘솔/페이지 에러 발생', consoleErrors)
  }

  console.log('[real-smoke] PASS — add button click + Enter key both produce list items, no console errors')
  exitCode = 0
} catch (err) {
  if (!err?.alreadyReported) {
    console.error('[real-smoke] FAIL —', err.message || err)
  }
} finally {
  await cleanup()
  process.exit(exitCode)
}

function fail(message, consoleErrors) {
  console.error(`[real-smoke] FAIL — ${message}`)
  if (consoleErrors.length > 0) {
    console.error('  브라우저에서 발생한 에러:')
    for (const e of consoleErrors) {
      console.error(`    [${e.type}] ${e.message}`)
    }
  }
  console.error('')
  console.error('이 검증은 raw 브라우저로 add 시나리오를 실행한다. 어떤 patch/polyfill 도 사용하지 않는다.')
  console.error('실제 사용자 환경에서 실패한다는 뜻이다.')
  emitRecoveryHint({
    gate: 'real-smoke',
    violations: consoleErrors.map((e) => ({ label: e.type, detail: e.message })),
    extra: message,
  })
  const e = new Error(message)
  e.alreadyReported = true
  return e
}

async function assertVisible(page, selector, label) {
  const el = page.locator(selector).first()
  try {
    await el.waitFor({ state: 'visible', timeout: PAGE_TIMEOUT_MS })
  } catch {
    throw new Error(`${label} not visible (selector: ${selector})`)
  }
}

async function cleanup() {
  if (browser) {
    try {
      await browser.close()
    } catch {}
    browser = null
  }
  if (preview && !preview.killed) {
    preview.kill('SIGTERM')
    await new Promise((r) => setTimeout(r, 200))
    if (!preview.killed) preview.kill('SIGKILL')
  }
}

async function waitForPort(host, port, timeoutMs) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    if (await isPortOpen(host, port)) return
    await new Promise((r) => setTimeout(r, 250))
  }
  throw new Error(`preview server did not start on ${host}:${port} within ${timeoutMs}ms`)
}

function isPortOpen(host, port) {
  return new Promise((resolve) => {
    const sock = net.createConnection({ host, port })
    sock.on('connect', () => {
      sock.end()
      resolve(true)
    })
    sock.on('error', () => resolve(false))
  })
}
