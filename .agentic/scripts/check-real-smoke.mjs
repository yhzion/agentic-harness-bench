import { emit as emitRecoveryHint } from './emit-recovery-hint.mjs'
import { startPreview } from './preview-harness.mjs'

const PORT = Number(process.env.SMOKE_PORT || 4174)
const HOST = '127.0.0.1'
const BOOT_TIMEOUT_MS = 30000
const PAGE_TIMEOUT_MS = 8000

let preview
let browser
let exitCode = 1

process.on('SIGINT', handleSignal)
process.on('SIGTERM', handleSignal)

try {
  console.log(`[real-smoke] booting vite preview on ${HOST}:${PORT}...`)
  preview = await startPreview({
    port: PORT,
    host: HOST,
    bootTimeoutMs: BOOT_TIMEOUT_MS,
    onStdout: (d) => process.stdout.write(`  [preview] ${d}`),
    onStderr: (d) => process.stderr.write(`  [preview] ${d}`),
  })
  console.log(`[real-smoke] preview ready (pid ${preview.pid})`)

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
  if (preview) {
    await preview.stop()
    preview = null
  }
}

function handleSignal() {
  cleanup().finally(() => process.exit(130))
}
