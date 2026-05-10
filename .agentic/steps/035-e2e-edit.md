# STEP 035. e2e — 편집 흐름 (키보드 a11y 포함)

## 작업 단위
정확히 1개의 spec 파일(e2e/edit.spec.ts)을 신규 작성한다. 더블클릭 진입, Enter 저장, Esc 취소, 빈 입력 거부, 키보드 접근성을 커버한다.

## 사전 작성된 spec (verbatim 복사 → e2e/edit.spec.ts)

```ts
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
```

## 수정 가능 파일 (정확히 1개)
- e2e/edit.spec.ts (신규)

## 수정 금지
- `.agentic/contracts/benchmark-rubric.json` (모든 STEP에서 수정 금지)
- `.agentic/contracts/benchmark-rubric.lock.json`
- src/** 모든 파일
- 위 1개 외 모든 e2e/* 파일

## 검증 명령

```bash
node .agentic/scripts/run-gate.mjs step \
  && npm run e2e -- e2e/edit.spec.ts
```

## 완료 조건
- 검증 명령 exit 0
- 7개 시나리오(@happy 3 + @edge 4) 모두 통과
