import { test, expect } from './_fixtures'

test.describe('@happy add', () => {
  test('button 클릭으로 항목 추가', async ({ page }) => {
    await page.goto('/')
    const input = page.getByRole('textbox')
    await input.fill('우유 사기')
    await page.getByRole('button', { name: /^add|추가$/i }).click()
    await expect(page.getByRole('listitem')).toHaveCount(1)
    await expect(page.getByText('우유 사기')).toBeVisible()
  })

  test('Enter 키로 항목 추가', async ({ page }) => {
    await page.goto('/')
    const input = page.getByRole('textbox')
    await input.fill('운동')
    await input.press('Enter')
    await expect(page.getByRole('listitem')).toHaveCount(1)
    await expect(page.getByText('운동')).toBeVisible()
  })

  test('제출 후 input value 가 빈 문자열로 초기화', async ({ page }) => {
    await page.goto('/')
    const input = page.getByRole('textbox')
    await input.fill('책 읽기')
    await input.press('Enter')
    await expect(input).toHaveValue('')
  })

  test('동시성/이중클릭 — 추가 버튼 빠르게 두 번 눌러도 항목은 1개', async ({ page }) => {
    await page.goto('/')
    const input = page.getByRole('textbox')
    await input.fill('한 번만')
    const button = page.getByRole('button', { name: /^add|추가$/i })
    await Promise.all([button.click(), button.click()])
    await expect(page.getByRole('listitem')).toHaveCount(1)
  })

  test('Enter 연타 — 빈 input 이면 추가되지 않음', async ({ page }) => {
    await page.goto('/')
    const input = page.getByRole('textbox')
    await input.fill('첫 항목')
    await input.press('Enter')
    await input.press('Enter')
    await input.press('Enter')
    await expect(page.getByRole('listitem')).toHaveCount(1)
  })
})
