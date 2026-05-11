import { test, expect } from './_fixtures'

async function addTodo(page: import('@playwright/test').Page, title: string) {
  const input = page.getByRole('textbox')
  await input.fill(title)
  await input.press('Enter')
}

test.describe('@happy toggle-remove', () => {
  test('체크박스 클릭 시 completed=true', async ({ page }) => {
    await page.goto('/')
    await addTodo(page, 'A')
    const checkbox = page.getByRole('checkbox')
    await checkbox.click()
    await expect(checkbox).toBeChecked()
  })

  test('완료 항목 다시 클릭 시 completed=false 로 복귀', async ({ page }) => {
    await page.goto('/')
    await addTodo(page, 'B')
    const checkbox = page.getByRole('checkbox')
    await checkbox.click()
    await checkbox.click()
    await expect(checkbox).not.toBeChecked()
  })

  test('삭제 버튼 클릭 시 항목 제거', async ({ page }) => {
    await page.goto('/')
    await addTodo(page, 'C')
    await page.getByRole('button', { name: /delete|삭제|remove/i }).click()
    await expect(page.getByRole('listitem')).toHaveCount(0)
  })
})

test.describe('@edge toggle-remove', () => {
  test('항목 빠른 더블 토글 — 짝수 번이면 false 유지', async ({ page }) => {
    await page.goto('/')
    await addTodo(page, 'D')
    const checkbox = page.getByRole('checkbox')
    await checkbox.click()
    await checkbox.click()
    await expect(checkbox).not.toBeChecked()
  })

  test('완료 후 삭제 — 잔여 0건', async ({ page }) => {
    await page.goto('/')
    await addTodo(page, 'E')
    await page.getByRole('checkbox').click()
    await page.getByRole('button', { name: /delete|삭제|remove/i }).click()
    await expect(page.getByRole('listitem')).toHaveCount(0)
  })

  test('여러 항목 — 한 항목 삭제 시 나머지 보존', async ({ page }) => {
    await page.goto('/')
    await addTodo(page, 'first')
    await addTodo(page, 'second')
    await addTodo(page, 'third')
    const removeButtons = page.getByRole('button', { name: /delete|삭제|remove/i })
    await removeButtons.nth(1).click()
    await expect(page.getByRole('listitem')).toHaveCount(2)
    await expect(page.getByText('first')).toBeVisible()
    await expect(page.getByText('third')).toBeVisible()
    await expect(page.getByText('second')).toHaveCount(0)
  })

  test('빠른 연속 삭제 — 모든 항목 제거', async ({ page }) => {
    await page.goto('/')
    await addTodo(page, 'x')
    await addTodo(page, 'y')
    await addTodo(page, 'z')
    while ((await page.getByRole('listitem').count()) > 0) {
      await page.getByRole('button', { name: /delete|삭제|remove/i }).first().click()
    }
    await expect(page.getByRole('listitem')).toHaveCount(0)
  })
})
