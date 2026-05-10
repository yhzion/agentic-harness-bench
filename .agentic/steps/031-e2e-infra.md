# STEP 031. e2e 인프라 — Playwright 셋업 + smoke

## 작업 단위
@playwright/test 설치, playwright.config.ts, e2e/_fixtures.ts, e2e/smoke.spec.ts 를 생성한다. 시나리오 spec 추가는 후속 STEP의 책임.

## 선행 조건
- STEP 030 (preview-check) 완료 — `dist/` 가 빌드되어 있고 `npm run preview` 가 동작.

## 사전 작성된 파일 (verbatim 복사)

### package.json — devDependencies 추가 (기존 객체 보존, 다음 키만 추가)

```txt
"@playwright/test": "^1.50.0"
```

### package.json — scripts 추가 (기존 보존, 다음 4개 키만 추가)

```json
{
  "e2e": "playwright test",
  "e2e:json": "playwright test",
  "e2e:happy": "playwright test --grep '@happy'",
  "e2e:edge": "playwright test --grep '@edge'"
}
```

### playwright.config.ts (신규 — verbatim 복사 → playwright.config.ts)

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  reporter: [
    ['line'],
    ['json', { outputFile: 'playwright-report/results.json' }],
  ],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'off',
    screenshot: 'off',
    video: 'off',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run preview -- --port=4173 --strictPort',
    port: 4173,
    timeout: 30000,
    reuseExistingServer: false,
  },
})
```

### e2e/_fixtures.ts (신규 — verbatim 복사 → e2e/_fixtures.ts)

```ts
import { test as base, expect } from '@playwright/test'

type Fixtures = {
  cleanLocalStorage: void
}

export const test = base.extend<Fixtures>({
  cleanLocalStorage: [
    async ({ page }, useFixture) => {
      await page.addInitScript(() => {
        try {
          window.localStorage.clear()
        } catch {
          // ignore
        }
      })
      await useFixture()
    },
    { auto: true },
  ],
})

export { expect }
```

### e2e/smoke.spec.ts (신규 — verbatim 복사 → e2e/smoke.spec.ts)

```ts
import { test, expect } from './_fixtures'

test.describe('@happy smoke', () => {
  test('페이지 로드 시 h1 "Todo" 노출', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/todo/i)
  })

  test('초기 listitem 개수는 0', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('listitem')).toHaveCount(0)
  })
})
```

## 작업 지시
1. package.json devDependencies에 `@playwright/test: "^1.50.0"` 추가.
2. package.json scripts 객체에 위 4개 e2e 스크립트 추가(기존 키는 변경하지 않는다).
3. 위 verbatim 파일 3개를 신규 작성한다.
4. `npm install --no-audit --no-fund` 후 `npx playwright install --with-deps chromium` 실행.

## 수정 가능 파일 (정확히 4개)
- package.json (devDependencies + scripts 추가만)
- playwright.config.ts (신규)
- e2e/_fixtures.ts (신규)
- e2e/smoke.spec.ts (신규)

## 수정 금지
- 위 4개 외 모든 파일
- `.agentic/contracts/benchmark-rubric.json` / `.lock.json`

## 검증 명령

```bash
npm install --no-audit --no-fund \
  && npx playwright install --with-deps chromium \
  && node .agentic/scripts/run-gate.mjs step \
  && npm run e2e
```

## 완료 조건
- 검증 명령 exit 0
- playwright-report/results.json 생성
- 2개 smoke 시나리오 모두 통과
