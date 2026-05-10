# STEP 034. e2e — 토글 + 삭제 (행복 + 동시성 엣지)

## 작업 단위
정확히 1개의 spec 파일(e2e/toggle-remove.spec.ts)을 신규 작성한다.

## 사전 작성된 spec (verbatim 복사 → e2e/toggle-remove.spec.ts)

```ts
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
```

## 수정 가능 파일 (정확히 1개)
- e2e/toggle-remove.spec.ts (신규)

## 수정 금지
- `.agentic/contracts/benchmark-rubric.json` (모든 STEP에서 수정 금지)
- `.agentic/contracts/benchmark-rubric.lock.json`
- src/** 모든 파일
- 위 1개 외 모든 e2e/* 파일

## 검증 명령

```bash
node .agentic/scripts/run-gate.mjs step \
  && npm run e2e -- e2e/toggle-remove.spec.ts
```

## 완료 조건
- 검증 명령 exit 0
- 7개 시나리오(@happy 3 + @edge 4) 모두 통과
