# STEP 036. e2e — 필터 (한·영 라벨 + a11y)

## 작업 단위
정확히 1개의 spec 파일(e2e/filter.spec.ts)을 신규 작성한다. all/active/completed 전환, aria-pressed, "완료" ⊂ "미완료" 부분매칭 회귀를 커버한다.

## 사전 작성된 spec (verbatim 복사 → e2e/filter.spec.ts)

```ts
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
```

## 작업 지시
- 라벨 정규식은 `^(all|전체)$` 형태로 anchor — "완료" 가 "미완료" 에 부분 매칭되지 않도록.
- 키보드 a11y 시나리오는 button 이 native `<button>` 요소일 때만 Enter 가 click 을 트리거 — div role=button 인 경우 fail 하므로 회귀 검출.

## 수정 가능 파일 (정확히 1개)
- e2e/filter.spec.ts (신규)

## 수정 금지
- `.agentic/contracts/benchmark-rubric.json` (모든 STEP에서 수정 금지)
- `.agentic/contracts/benchmark-rubric.lock.json`
- src/** 모든 파일
- 위 1개 외 모든 e2e/* 파일

## 검증 명령

```bash
node .agentic/scripts/run-gate.mjs step \
  && npm run e2e -- e2e/filter.spec.ts
```

## 완료 조건
- 검증 명령 exit 0
- 9개 시나리오(@happy 4 + @edge 5) 모두 통과
