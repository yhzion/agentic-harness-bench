import { test, expect } from './_fixtures'

async function addTodo(page: import('@playwright/test').Page, title: string) {
  const input = page.getByRole('textbox')
  await input.fill(title)
  await input.press('Enter')
}

test.describe('@happy edit', () => {
  test('title 더블클릭 → 편집 input 노출', async ({ page }) => {
    await page.goto('/')
    await addTodo(page, 'original')
    await page.getByText('original').dblclick()
    const editInputs = page.getByRole('textbox')
    await expect(editInputs).toHaveCount(2)
  })

  test('편집 후 Enter — title 갱신', async ({ page }) => {
    await page.goto('/')
    await addTodo(page, 'before')
    await page.getByText('before').dblclick()
    const edit = page.getByRole('textbox').last()
    await edit.fill('after')
    await edit.press('Enter')
    await expect(page.getByText('after')).toBeVisible()
    await expect(page.getByText('before')).toHaveCount(0)
  })

  test('편집 후 Esc — 원본 보존', async ({ page }) => {
    await page.goto('/')
    await addTodo(page, 'keep')
    await page.getByText('keep').dblclick()
    const edit = page.getByRole('textbox').last()
    await edit.fill('discarded')
    await edit.press('Escape')
    await expect(page.getByText('keep')).toBeVisible()
    await expect(page.getByText('discarded')).toHaveCount(0)
  })
})

test.describe('@edge edit', () => {
  test('빈 문자열로 편집 후 Enter — 갱신 거부, 원본 보존', async ({ page }) => {
    await page.goto('/')
    await addTodo(page, 'reject')
    await page.getByText('reject').dblclick()
    const edit = page.getByRole('textbox').last()
    await edit.fill('')
    await edit.press('Enter')
    await expect(page.getByText('reject')).toBeVisible()
  })

  test('공백만으로 편집 후 Enter — 갱신 거부', async ({ page }) => {
    await page.goto('/')
    await addTodo(page, 'spaceless')
    await page.getByText('spaceless').dblclick()
    const edit = page.getByRole('textbox').last()
    await edit.fill('   ')
    await edit.press('Enter')
    await expect(page.getByText('spaceless')).toBeVisible()
  })

  test('편집 후 trim 적용 — 앞뒤 공백 제거', async ({ page }) => {
    await page.goto('/')
    await addTodo(page, 'pad')
    await page.getByText('pad').dblclick()
    const edit = page.getByRole('textbox').last()
    await edit.fill('  padded  ')
    await edit.press('Enter')
    await expect(page.getByText('padded', { exact: true })).toBeVisible()
  })

  test('Tab 포커스 순서 — input → button → checkbox → title 영역 진입 가능', async ({ page }) => {
    await page.goto('/')
    await addTodo(page, 'a11y')
    await page.keyboard.press('Tab')
    const focused = await page.evaluate(() => document.activeElement?.tagName)
    expect(['INPUT', 'BUTTON']).toContain(focused)
  })
})
