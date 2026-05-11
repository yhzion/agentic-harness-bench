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
