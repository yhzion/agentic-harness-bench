import { test, expect } from './_fixtures'

async function addTodo(page: import('@playwright/test').Page, title: string) {
  const input = page.getByRole('textbox')
  await input.fill(title)
  await input.press('Enter')
}

const allBtn = (p: import('@playwright/test').Page) =>
  p.getByRole('button', { name: /^(all|전체)$/i })
const activeBtn = (p: import('@playwright/test').Page) =>
  p.getByRole('button', { name: /^(active|미완료)$/i })
const completedBtn = (p: import('@playwright/test').Page) =>
  p.getByRole('button', { name: /^(completed|완료)$/i })

test.describe('@happy filter', () => {
  test('초기 상태는 filter=all, 모든 버튼 노출', async ({ page }) => {
    await page.goto('/')
    await expect(allBtn(page)).toBeVisible()
    await expect(activeBtn(page)).toBeVisible()
    await expect(completedBtn(page)).toBeVisible()
  })

  test('all 클릭 → 전체 노출', async ({ page }) => {
    await page.goto('/')
    await addTodo(page, 'x')
    await addTodo(page, 'y')
    await page.getByRole('checkbox').first().click()
    await allBtn(page).click()
    await expect(page.getByRole('listitem')).toHaveCount(2)
  })

  test('active 클릭 → 미완료만 노출', async ({ page }) => {
    await page.goto('/')
    await addTodo(page, 'todo-a')
    await addTodo(page, 'todo-b')
    await page.getByRole('checkbox').first().click()
    await activeBtn(page).click()
    await expect(page.getByRole('listitem')).toHaveCount(1)
    await expect(page.getByText('todo-b')).toBeVisible()
  })

  test('completed 클릭 → 완료만 노출', async ({ page }) => {
    await page.goto('/')
    await addTodo(page, 'todo-c')
    await addTodo(page, 'todo-d')
    await page.getByRole('checkbox').first().click()
    await completedBtn(page).click()
    await expect(page.getByRole('listitem')).toHaveCount(1)
    await expect(page.getByText('todo-c')).toBeVisible()
  })
})

test.describe('@edge filter', () => {
  test('aria-pressed — 활성 버튼만 true', async ({ page }) => {
    await page.goto('/')
    await activeBtn(page).click()
    await expect(activeBtn(page)).toHaveAttribute('aria-pressed', 'true')
    await expect(allBtn(page)).toHaveAttribute('aria-pressed', 'false')
    await expect(completedBtn(page)).toHaveAttribute('aria-pressed', 'false')
  })

  test('한국어 라벨 회귀 — "완료" 가 "미완료" 와 분리되어 매칭', async ({ page }) => {
    await page.goto('/')
    const completed = await completedBtn(page).count()
    const active = await activeBtn(page).count()
    expect(completed).toBe(1)
    expect(active).toBe(1)
  })

  test('필터 빠른 연속 전환 — 마지막 상태가 최종 반영', async ({ page }) => {
    await page.goto('/')
    await addTodo(page, 'final')
    await page.getByRole('checkbox').click()
    await allBtn(page).click()
    await activeBtn(page).click()
    await completedBtn(page).click()
    await activeBtn(page).click()
    await expect(activeBtn(page)).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByRole('listitem')).toHaveCount(0)
  })

  test('빈 결과 필터 — listitem 0건 + 안내 메시지(있으면)', async ({ page }) => {
    await page.goto('/')
    await addTodo(page, 'only-active')
    await completedBtn(page).click()
    await expect(page.getByRole('listitem')).toHaveCount(0)
  })

  test('Enter 키로 필터 버튼 활성화 (키보드 a11y)', async ({ page }) => {
    await page.goto('/')
    await activeBtn(page).focus()
    await page.keyboard.press('Enter')
    await expect(activeBtn(page)).toHaveAttribute('aria-pressed', 'true')
  })
})
