# STEP 032. e2e — 추가 흐름 (행복 경로)

## 작업 단위
정확히 1개의 spec 파일(e2e/add.spec.ts)을 신규 작성한다. 컴포넌트/도메인 코드 수정 금지.

## 사전 작성된 spec (verbatim 복사 → e2e/add.spec.ts)

```ts
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
```

## 작업 지시
- TodoInput 의 button accessible name 이 한국어("추가") 또는 영어("Add") 여야 정규식이 매칭된다. STEP 019 산출물의 라벨을 그대로 둔다.
- 동시성 테스트는 `Promise.all` 로 두 click 을 동시 디스패치 — React 의 controlled input 가 빈 상태면 두 번째 클릭은 noop 이어야 한다.

## 수정 가능 파일 (정확히 1개)
- e2e/add.spec.ts (신규)

## 수정 금지
- `.agentic/contracts/benchmark-rubric.json` (모든 STEP에서 수정 금지)
- `.agentic/contracts/benchmark-rubric.lock.json`
- src/** 모든 파일
- e2e/_fixtures.ts (STEP 031 산출물)
- playwright.config.ts (STEP 031 산출물)

## 검증 명령

```bash
node .agentic/scripts/run-gate.mjs step \
  && npm run e2e -- e2e/add.spec.ts
```

## 완료 조건
- 검증 명령 exit 0
- 5개 시나리오 모두 통과
- playwright-report/results.json 갱신됨
