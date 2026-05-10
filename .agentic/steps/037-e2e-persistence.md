# STEP 037. e2e — 영속성 + 스토리지 손상 변종

## 작업 단위
정확히 1개의 spec 파일(e2e/persistence.spec.ts)을 신규 작성한다. reload 영속, 깨진 JSON, 배열이 아닌 값, 형태 어긋난 항목 혼합, 빈 상태 안내를 커버한다.

## 사전 작성된 spec (verbatim 복사 → e2e/persistence.spec.ts)

```ts
import { test, expect } from './_fixtures'

const STORAGE_KEY = 'todos'

async function setStorage(page: import('@playwright/test').Page, raw: string) {
  await page.addInitScript(
    ({ key, value }) => {
      try {
        window.localStorage.setItem(key, value)
      } catch {
        // ignore
      }
    },
    { key: STORAGE_KEY, value: raw },
  )
}

test.describe('@happy persistence', () => {
  test('추가 후 reload — 항목 잔존', async ({ page }) => {
    await page.goto('/')
    const input = page.getByRole('textbox')
    await input.fill('persisted')
    await input.press('Enter')
    await expect(page.getByText('persisted')).toBeVisible()
    await page.reload()
    await expect(page.getByText('persisted')).toBeVisible()
  })

  test('reload 후 storage key=todos 에 JSON 직렬화 형태로 저장', async ({ page }) => {
    await page.goto('/')
    const input = page.getByRole('textbox')
    await input.fill('store me')
    await input.press('Enter')
    const raw = await page.evaluate((k) => window.localStorage.getItem(k), STORAGE_KEY)
    expect(raw).toContain('store me')
    expect(() => JSON.parse(raw ?? '')).not.toThrow()
    expect(Array.isArray(JSON.parse(raw ?? '[]'))).toBe(true)
  })
})

test.describe('@edge persistence', () => {
  test('빈 목록일 때 안내 메시지 노출', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText(/할\s*일|empty|no/i)).toBeVisible()
  })

  test('스토리지에 깨진 JSON — 빈 배열로 복구, 충돌 없음', async ({ page }) => {
    await setStorage(page, 'this-is-not-json {{')
    await page.goto('/')
    await expect(page.getByRole('listitem')).toHaveCount(0)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('스토리지에 배열 아닌 객체 — 빈 배열로 복구', async ({ page }) => {
    await setStorage(page, '{"id":"a","title":"X"}')
    await page.goto('/')
    await expect(page.getByRole('listitem')).toHaveCount(0)
  })

  test('스토리지에 number — 빈 배열로 복구', async ({ page }) => {
    await setStorage(page, '12345')
    await page.goto('/')
    await expect(page.getByRole('listitem')).toHaveCount(0)
  })

  test('스토리지에 null 문자열 — 빈 배열로 복구', async ({ page }) => {
    await setStorage(page, 'null')
    await page.goto('/')
    await expect(page.getByRole('listitem')).toHaveCount(0)
  })

  test('Todo 형태 어긋난 항목 혼합 — 유효한 항목만 복원', async ({ page }) => {
    const mixed = JSON.stringify([
      { id: 'good', title: 'Valid', completed: false, createdAt: 1, updatedAt: 1 },
      { id: 1, title: 2 },
      null,
      'string',
      { id: 'no-completed', title: 'X', createdAt: 1, updatedAt: 1 },
    ])
    await setStorage(page, mixed)
    await page.goto('/')
    await expect(page.getByRole('listitem')).toHaveCount(1)
    await expect(page.getByText('Valid')).toBeVisible()
  })

  test('빈 문자열 스토리지 — 빈 배열로 복구', async ({ page }) => {
    await setStorage(page, '')
    await page.goto('/')
    await expect(page.getByRole('listitem')).toHaveCount(0)
  })

  test('reload 사이클 (3회) — 데이터 일관 유지', async ({ page }) => {
    await page.goto('/')
    const input = page.getByRole('textbox')
    await input.fill('cycle')
    await input.press('Enter')
    for (let i = 0; i < 3; i++) {
      await page.reload()
      await expect(page.getByText('cycle')).toBeVisible()
    }
  })
})
```

## 수정 가능 파일 (정확히 1개)
- e2e/persistence.spec.ts (신규)

## 수정 금지
- `.agentic/contracts/benchmark-rubric.json` (모든 STEP에서 수정 금지)
- `.agentic/contracts/benchmark-rubric.lock.json`
- src/** 모든 파일
- 위 1개 외 모든 e2e/* 파일

## 검증 명령

```bash
node .agentic/scripts/run-gate.mjs step \
  && npm run e2e -- e2e/persistence.spec.ts
```

## 완료 조건
- 검증 명령 exit 0
- 9개 시나리오(@happy 2 + @edge 7) 모두 통과
