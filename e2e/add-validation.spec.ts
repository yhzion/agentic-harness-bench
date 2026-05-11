import { test, expect } from './_fixtures'

const TODO_TITLE_MAX_LENGTH = 200

test.describe('@edge add-validation', () => {
  test('빈 input 으로 Enter — 항목 추가 안 됨', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('textbox').press('Enter')
    await expect(page.getByRole('listitem')).toHaveCount(0)
  })

  test('공백만 입력 — 추가 안 됨 (trim 후 빈 문자열)', async ({ page }) => {
    await page.goto('/')
    const input = page.getByRole('textbox')
    await input.fill('   ')
    await input.press('Enter')
    await expect(page.getByRole('listitem')).toHaveCount(0)
  })

  test('탭/개행만 입력 — 추가 안 됨', async ({ page }) => {
    await page.goto('/')
    const input = page.getByRole('textbox')
    await input.fill('\t\n  ')
    await input.press('Enter')
    await expect(page.getByRole('listitem')).toHaveCount(0)
  })

  test('앞뒤 공백 — trim 되어 저장', async ({ page }) => {
    await page.goto('/')
    const input = page.getByRole('textbox')
    await input.fill('  trimmed  ')
    await input.press('Enter')
    await expect(page.getByRole('listitem')).toHaveCount(1)
    await expect(page.getByText('trimmed', { exact: true })).toBeVisible()
  })

  test('내부 공백 — 보존', async ({ page }) => {
    await page.goto('/')
    const input = page.getByRole('textbox')
    await input.fill('우유  사기')
    await input.press('Enter')
    await expect(page.getByText('우유  사기', { exact: true })).toBeVisible()
  })

  test('상한 길이 (200자) — 통과', async ({ page }) => {
    await page.goto('/')
    const title = 'a'.repeat(TODO_TITLE_MAX_LENGTH)
    const input = page.getByRole('textbox')
    await input.fill(title)
    await input.press('Enter')
    await expect(page.getByRole('listitem')).toHaveCount(1)
  })

  test('상한 초과 (201자) — 추가 안 됨', async ({ page }) => {
    await page.goto('/')
    const title = 'b'.repeat(TODO_TITLE_MAX_LENGTH + 1)
    const input = page.getByRole('textbox')
    await input.fill(title)
    await input.press('Enter')
    await expect(page.getByRole('listitem')).toHaveCount(0)
  })

  test('이모지 입력 — 정상 저장', async ({ page }) => {
    await page.goto('/')
    const input = page.getByRole('textbox')
    await input.fill('휴가 🌴 가기')
    await input.press('Enter')
    await expect(page.getByText('휴가 🌴 가기')).toBeVisible()
  })

  test('한자 입력 — 정상 저장', async ({ page }) => {
    await page.goto('/')
    const input = page.getByRole('textbox')
    await input.fill('讀書')
    await input.press('Enter')
    await expect(page.getByText('讀書')).toBeVisible()
  })

  test('HTML-injection 흉내 입력 — 텍스트로 escape 되어 표시', async ({ page }) => {
    await page.goto('/')
    const malicious = '<script>window.__pwned=true</script>'
    const input = page.getByRole('textbox')
    await input.fill(malicious)
    await input.press('Enter')
    await expect(page.getByText(malicious, { exact: true })).toBeVisible()
  })
})
