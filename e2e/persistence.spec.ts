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
